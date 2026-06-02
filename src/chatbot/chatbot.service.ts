import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Free-tier model: 30 RPM · 1,500 RPD · 1M TPM */
const MODEL_NAME = 'gemini-2.0-flash-lite';

/** Hard ceiling on output to keep the response concise & save output quota */
const MAX_OUTPUT_TOKENS = 320;

/** TTLs */
const SESSION_TTL_MS = 15 * 60 * 1000;   // 15 min  – conversation continuity
const RESP_CACHE_TTL = 10 * 60 * 1000;   // 10 min  – Gemini response cache
const JOB_CACHE_TTL = 3 * 60 * 1000;   //  3 min  – job listing cache

// ─────────────────────────────────────────────────────────────────────────────
// Intent Taxonomy
// ─────────────────────────────────────────────────────────────────────────────

enum Intent {
  GREETING = 'GREETING',    // "hi", "hello", etc.
  JOB_SEARCH = 'JOB_SEARCH',  // "show me remote tech jobs"
  APP_STATUS = 'APP_STATUS',  // "what's my application status?"
  COMPANY = 'COMPANY',     // "what services does Orange Global offer?"
  CONTACT = 'CONTACT',     // "how do I contact support?"
  MIGRATION = 'MIGRATION',  // visa details and migration options
  PROFILE = 'PROFILE',      // talent profile details
  GENERAL = 'GENERAL',     // anything else
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal Types
// ─────────────────────────────────────────────────────────────────────────────

interface HistoryEntry { user: string; bot: string }
interface SessionEntry { history: HistoryEntry[]; expiresAt: number }
interface CacheEntry { value: string; expiresAt: number }

// Zero-cost Static Responses are built dynamically in the constructor using environment URLs.

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private readonly genAI: GoogleGenerativeAI | null = null;

  /** Staff / job-seeker portal base URL (e.g. http://localhost:5174 or https://orangeglobal.co) */
  private readonly staffUrl: string;
  /** Admin / employer portal base URL (e.g. http://localhost:5173) */
  private readonly adminUrl: string;
  /** Pre-built zero-cost static responses keyed by Intent */
  private readonly staticResponses: Partial<Record<Intent, string>>;

  private readonly migrationVisas = [
    { code: '485', title: 'Graduate Temporary visa (Subclass 485)', category: 'Skilled Visa', desc: 'Allows international students who have completed their studies in Australia to live, study, and work temporarily.', link: '/migration/skilled-visa/graduate-temporary-485-visa' },
    { code: '189', title: 'Skilled Independent visa (Subclass 189)', category: 'Skilled Visa', desc: 'Points-tested visa for skilled workers who are not sponsored by an employer, state/territory, or family member. Grants PR.', link: '/migration/skilled-visa/skilled-independent-visa-189' },
    { code: '190', title: 'Skilled Nominated visa (Subclass 190)', category: 'Skilled Visa', desc: 'Points-tested permanent visa for skilled workers nominated by an Australian state or territory government.', link: '/migration/skilled-visa/skilled-nominated-visa190' },
    { code: '491', title: 'Skilled Work Regional visa (Subclass 491)', category: 'Skilled Visa', desc: 'Provisional visa for skilled workers nominated by a state/territory government or sponsored by an eligible family member to live and work in regional Australia.', link: '/migration/skilled-visa/regional-visas-491-visa' },
    { code: '482', title: 'Temporary Skill Shortage visa (Subclass 482 / TSS)', category: 'Employer Sponsored', desc: 'Enables employers to address labor shortages by bringing in genuinely skilled workers where they cannot find an appropriately skilled Australian.', link: '/migration/employer-sponsored/tss-482-visa' },
    { code: '186', title: 'Employer Nomination Scheme visa (Subclass 186)', category: 'Employer Sponsored', desc: 'Permanent residency visa for skilled workers sponsored by an Australian employer.', link: '/migration/employer-sponsored/186-visa-skill-requirements' },
    { code: '494', title: 'Skilled Employer Sponsored Regional visa (Subclass 494)', category: 'Employer Sponsored', desc: 'Provisional regional visa sponsored by an employer in regional Australia.', link: '/migration/employer-sponsored/494-visa' },
    { code: '143', title: 'Contributory Parent visa (Subclass 143)', category: 'Family Visa', desc: 'Allows parents of settled Australian citizens, PRs, or eligible New Zealand citizens to live in Australia permanently.', link: '/migration/family-visa/parent-visa-australia/contributory-parent-visa-subclass-143' },
    { code: '300', title: 'Prospective Marriage visa (Subclass 300)', category: 'Family Visa', desc: 'Allows people to come to Australia to marry their prospective spouse.', link: '/migration/family-visa/partner-visa-australia/fiance-prospective-spouse-subclass-300' },
    { code: '309', title: 'Partner visa (Offshore Subclass 309/100)', category: 'Family Visa', desc: 'Allows the partner or spouse of an Australian citizen, PR, or eligible NZ citizen to live in Australia.', link: '/migration/family-visa/partner-visa-australia/partner-visa-offshore-309-100' },
    { code: '820', title: 'Partner visa (Onshore Subclass 820/801)', category: 'Family Visa', desc: 'Allows the partner or spouse of an Australian citizen, PR, or eligible NZ citizen to live in Australia onshore.', link: '/migration/family-visa/partner-visa-australia/partner-visa-onshore-820-and-801' },
    { code: '476', title: 'Recognised Graduate visa (Subclass 476)', category: 'Skilled Visa', desc: 'Allows recent engineering graduates of recognized universities to gain up to 18 months of skilled work experience in Australia.', link: '/migration/skilled-visa/recognised-graduate-476-visa' },
    { code: '887', title: 'Skilled Regional visa (Subclass 887)', category: 'Skilled Visa', desc: 'Permanent visa for skilled workers who have lived and worked in specified regional areas of Australia.', link: '/migration/skilled-visa/skilled-regional-887-visa' },
    { code: '191', title: 'Skilled Regional Visa (Subclass 191)', category: 'Skilled Visa', desc: 'Permanent visa for applicants who have held an eligible regional provisional visa (like subclass 491).', link: '/migration/skilled-visa/regional-visas-191-visa' },
    { code: '124', title: 'Distinguished Talent visa (Subclass 124)', category: 'Skilled Visa', desc: 'Permanent visa for people who have an internationally recognized record of exceptional and outstanding achievement in their field.', link: '/migration/skilled-visa/distinguished-talent-visa-subclass-124' },
    { code: 'gti', title: 'Global Talent visa (GTI)', category: 'Skilled Visa', desc: 'Fast-tracked permanent visa for highly skilled professionals to live and work permanently in Australia.', link: '/migration/skilled-visa/global-talent-visa-gti' },
  ];

  // In-memory stores (lightweight; cleared on process restart)
  private readonly sessions = new Map<string, SessionEntry>();
  private readonly responseCache = new Map<string, CacheEntry>();
  private readonly jobCache = new Map<string, CacheEntry>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.staffUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5174';
    this.adminUrl = this.config.get<string>('ADMIN_URL') ?? 'http://localhost:5173';
    this.staticResponses = this.buildStaticResponses();

    const key = this.config.get<string>('GEMINI_API_KEY');
    if (key && key !== 'your_gemini_api_key_here') {
      this.genAI = new GoogleGenerativeAI(key);
      this.logger.log(`✅ Gemini AI ready  model=${MODEL_NAME}`);
    } else {
      this.logger.warn('⚠️  GEMINI_API_KEY not set – rule engine active.');
    }
  }

  private buildStaticResponses(): Partial<Record<Intent, string>> {
    return {
      [Intent.GREETING]: [
        `Hi! I'm **Orange** 👋, your AI recruitment assistant for Orange Global.`,
        ``,
        `I can help you:`,
        `- 🔍 **Find jobs** – *"Show me remote tech openings"*`,
        `- 📋 **Track applications** – *"What's my application status?"*`,
        `- 🏢 **Learn about us** – *"What services do you offer?"*`,
        `- 📞 **Get support** – *"How do I contact support?"*`,
        ``,
        `What would you like to know?`,
      ].join('\n'),

      [Intent.CONTACT]: [
        `Our support team is here to help!`,
        ``,
        `- 📧 **Email:** info@orangeglobal.co`,
        `- 📝 **Contact Form:** [Open form →](${this.staffUrl}/contact)`,
        ``,
        `We aim to respond within 1 business day.`,
      ].join('\n'),
    };
  }

  // ─── Public Entry Point ───────────────────────────────────────────────────

  async getAIResponse(
    rawMessage: string,
    userId?: string,
    sessionId?: string,
  ): Promise<string> {
    // ── 1. Sanitize & validate ──
    const message = rawMessage.trim().slice(0, 500);
    if (!message) return `Please type a message and I'll be happy to help!`;

    // ── 2. Classify intent (local, zero-cost) ──
    const intent = this.classify(message);

    // ── 3. Static gate – no DB, no Gemini ──
    if (this.staticResponses[intent]) return this.staticResponses[intent]!;

    // ── 4. Response cache lookup ──
    const cacheKey = this.cacheKey(intent, message, userId);
    const cached = this.getCache(this.responseCache, cacheKey);
    if (cached) return cached;

    // ── 5. Build minimal, intent-scoped DB context ──
    const context = await this.buildContext(intent, message, userId);

    // ── 6. Load session history (last 1 exchange for continuity) ──
    const history = this.getHistory(sessionId);

    // ── 7. Gemini → fallback chain ──
    let reply: string;
    if (this.genAI) {
      try {
        reply = await this.callGemini(message, context, history);
      } catch (err: any) {
        const status = err?.status ?? 0;
        if (status === 429 || status === 503) {
          this.logger.warn(`Gemini rate-limited (${status}) – rule engine.`);
        } else {
          this.logger.error(`Gemini error (${status}):`, err?.message ?? err);
        }
        reply = this.ruleEngine(intent, context);
      }
    } else {
      reply = this.ruleEngine(intent, context);
    }

    // ── 8. Persist session history ──
    this.saveHistory(sessionId, message, reply);

    // ── 9. Cache non-personalised responses ──
    if (!userId || intent === Intent.JOB_SEARCH || intent === Intent.COMPANY || intent === Intent.MIGRATION || intent === Intent.GENERAL) {
      this.setCache(this.responseCache, cacheKey, reply, RESP_CACHE_TTL);
    }

    return reply;
  }

  // ─── Layer 1: Intent Classifier ──────────────────────────────────────────
  // Pure local regex – zero latency, zero API cost.

  private classify(msg: string): Intent {
    const m = msg.toLowerCase();

    if (/^(hi+|hello+|hey+|howdy|good\s*(morning|afternoon|evening)|greetings|yo+|sup)[\s!?.]*$/.test(m))
      return Intent.GREETING;

    if (
      /\b(contact|support|email|phone|reach|speak|talk to( someone| a human| an agent)?|helpdesk)\b/.test(m) &&
      !/\b(job|role|position|vacancy)\b/.test(m)
    )
      return Intent.CONTACT;

    if (
      /\b(my application|application status|have i been|applied|interview scheduled|shortlisted|rejected|offer letter|hiring decision|where.{0,20}application)\b/.test(m)
    )
      return Intent.APP_STATUS;

    if (
      /\b(my profile|my resume|my details|my skills|profile score|pro score|verified expert|my education|my experience|change my profile|edit my profile)\b/.test(m)
    )
      return Intent.PROFILE;

    if (
      /\b(visa|subclass|migration|pr in australia|permanent residency|skilled independent|regional visa|sponsored visa|partner visa|parent visa|bridging visa|485|189|190|482|186|491|494|143|300|309|820|801)\b/.test(m)
    )
      return Intent.MIGRATION;

    if (
      /\b(job|jobs|vacancy|vacancies|opening|openings|role|roles|position|career|hiring|recruit|remote|hybrid|on.?site|full.?time|part.?time|contract|work available|can i apply)\b/.test(m)
    )
      return Intent.JOB_SEARCH;

    if (
      /\b(service|staffing|consulting|orange global|about (you|us|the company)|who are you|what do you (do|offer)|employer|post a job|how does it work)\b/.test(m)
    )
      return Intent.COMPANY;

    return Intent.GENERAL;
  }

  // ─── Layer 2: Intent-Aware Context Builder ────────────────────────────────
  // Only fetch what the intent needs – minimises tokens & DB calls.

  private async buildContext(
    intent: Intent,
    message: string,
    userId?: string,
  ): Promise<string> {
    switch (intent) {
      case Intent.JOB_SEARCH:
        return this.jobSearchContext(message);

      case Intent.APP_STATUS:
        return this.applicationContext(userId);

      case Intent.PROFILE:
        return this.talentProfileContext(userId);

      case Intent.MIGRATION:
        return this.getMigrationContext(message);

      case Intent.COMPANY:
        return (
          `Orange Global: world-class staffing & consulting firm. ` +
          `Services: global talent delivery, executive search, direct placements, contract staffing, tech-transformation consulting. ` +
          `Employers post jobs at ${this.adminUrl}. ` +
          `Job seekers browse at ${this.staffUrl}/jobs.`
        );

      case Intent.GENERAL:
      default: {
        const total = await this.prisma.job.count({ where: { isPublished: true } });
        return `Orange Global has ${total} active jobs. Browse: ${this.staffUrl}/jobs`;
      }
    }
  }

  private getMigrationContext(message: string): string {
    const m = message.toLowerCase();
    const matches = this.migrationVisas.filter(
      (v) => m.includes(v.code) || m.includes(v.title.toLowerCase()) || (v.code === '309' && m.includes('offshore')) || (v.code === '820' && m.includes('onshore'))
    );

    if (matches.length > 0) {
      const lines = matches.map(
        (v) => `• [${v.title}](${this.staffUrl}${v.link}) [${v.category}]: ${v.desc}`
      ).join('\n');
      return `Found the following visa options matching query:\n${lines}`;
    }

    return [
      `Australian Migration Pathways we support:`,
      `1. **Skilled Visas**: For independent workers, state nominees, and regional workers (Subclass 189, 190, 491, 191, 485, 476).`,
      `2. **Employer Sponsored**: TSS 482, ENS 186, and Regional 494 visas.`,
      `3. **Family Visas**: Partner visas (Onshore 820/801, Offshore 309/100, Prospective Subclass 300) and Parent visas (Subclass 143/173).`,
      `More info: [Migration Page](${this.staffUrl}/migration/skilled-visa/graduate-temporary-485-visa)`
    ].join('\n');
  }

  private async talentProfileContext(userId?: string): Promise<string> {
    if (!userId)
      return `Not signed in. Sign in to view your profile: ${this.staffUrl}/signin`;

    const profile = await this.prisma.talentProfile.findUnique({
      where: { userId },
      select: {
        fullName: true,
        jobTitle: true,
        skills: true,
        educations: true,
        experiences: true,
      },
    });

    if (!profile)
      return `No profile found. Complete profile: ${this.staffUrl}/manage-profile`;

    const score = this.calculateProfileScore(profile);
    const skillsList = profile.skills.length > 0 ? profile.skills.join(', ') : 'None';

    let eduCount = 0;
    try {
      const edus = typeof profile.educations === 'string' ? JSON.parse(profile.educations) : profile.educations;
      eduCount = Array.isArray(edus) ? edus.length : 0;
    } catch {
      eduCount = Array.isArray(profile.educations) ? profile.educations.length : 0;
    }

    let expCount = 0;
    try {
      const exps = typeof profile.experiences === 'string' ? JSON.parse(profile.experiences) : profile.experiences;
      expCount = Array.isArray(exps) ? exps.length : 0;
    } catch {
      expCount = Array.isArray(profile.experiences) ? profile.experiences.length : 0;
    }

    return [
      `User Profile Details:`,
      `- Name: ${profile.fullName || 'Talent User'}`,
      `- Title: ${profile.jobTitle || 'Job Seeker'}`,
      `- Profile Completion Score: ${score}% (${score >= 80 ? 'Verified Expert' : 'Building Profile'})`,
      `- Key Skills: ${skillsList}`,
      `- Educations: ${eduCount} added`,
      `- Experiences: ${expCount} added`,
      `Edit Profile: ${this.staffUrl}/manage-profile`
    ].join('\n');
  }

  private calculateProfileScore(profile: any): number {
    let score = 20;
    if (profile.fullName) score += 10;
    if (profile.jobTitle) score += 10;
    if (profile.skills && profile.skills.length > 0) score += 20;

    let eduCount = 0;
    try {
      const edus = typeof profile.educations === 'string' ? JSON.parse(profile.educations) : profile.educations;
      eduCount = Array.isArray(edus) ? edus.length : 0;
    } catch {
      eduCount = Array.isArray(profile.educations) ? profile.educations.length : 0;
    }
    if (eduCount > 0) score += 20;

    let expCount = 0;
    try {
      const exps = typeof profile.experiences === 'string' ? JSON.parse(profile.experiences) : profile.experiences;
      expCount = Array.isArray(exps) ? exps.length : 0;
    } catch {
      expCount = Array.isArray(profile.experiences) ? profile.experiences.length : 0;
    }
    if (expCount > 0) score += 20;

    return score;
  }

  // ── Job search context (cached per filter combo) ──

  private async jobSearchContext(message: string): Promise<string> {
    const m = message.toLowerCase();

    const mode =
      /\b(remote|wfh|work from home)\b/.test(m) ? 'Remote' :
        /\bhybrid\b/.test(m) ? 'Hybrid' :
          /\b(on.?site|office|onsite)\b/.test(m) ? 'On-site' :
            undefined;

    const category =
      /\b(tech|developer|software|it |engineer|coding|programming|devops|cloud)\b/.test(m) ? 'Technology' :
        /\b(legal|law|lawyer|attorney|paralegal|compliance)\b/.test(m) ? 'Legal' :
          /\b(market|creative|design|brand|content|social media)\b/.test(m) ? 'Marketing & Creative' :
            /\b(finance|accounting|audit|tax|cfo|cpa|bookkeep)\b/.test(m) ? 'Finance & Accounting' :
              undefined;

    const jCacheKey = `jobs|${mode ?? '*'}|${category ?? '*'}`;
    const hit = this.getCache(this.jobCache, jCacheKey);
    if (hit) return hit;

    const where: any = { isPublished: true };
    if (mode) where.mode = mode;
    if (category) where.category = category;

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        orderBy: { postedAt: 'desc' },
        take: 5,
        select: { title: true, company: true, location: true, mode: true, salary: true },
      }),
      this.prisma.job.count({ where: { isPublished: true } }),
    ]);

    let ctx: string;
    if (jobs.length === 0) {
      ctx = `No jobs match filter (mode=${mode ?? 'any'}, category=${category ?? 'any'}). Total active: ${total}. All jobs: ${this.staffUrl}/jobs`;
    } else {
      const lines = jobs
        .map((j) => `• ${j.title} @ ${j.company} | ${j.location} | ${j.mode} | ${j.salary ?? 'Salary TBD'}`)
        .join('\n');
      const filter = [mode, category].filter(Boolean).join(' · ');
      ctx = `Jobs${filter ? ` [${filter}]` : ''} (${total} total active):\n${lines}\nAll: ${this.staffUrl}/jobs`;
    }

    this.setCache(this.jobCache, jCacheKey, ctx, JOB_CACHE_TTL);
    return ctx;
  }

  // ── Application context (personalised, never cached) ──

  private async applicationContext(userId?: string): Promise<string> {
    if (!userId)
      return `Not signed in. Sign in to view applications: ${this.staffUrl}/signin`;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role === 'EMPLOYER' || user?.role === 'ADMIN')
      return `User is ${user.role}. Dashboard: ${this.adminUrl}`;

    const talent = await this.prisma.talentProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!talent)
      return `No talent profile found. Complete profile: ${this.staffUrl}/talent-dashboard`;

    const apps = await this.prisma.application.findMany({
      where: { talentId: talent.id },
      include: { job: { select: { title: true, company: true } } },
      orderBy: { appliedAt: 'desc' },
      take: 5,
    });

    if (apps.length === 0)
      return `No applications yet. Browse jobs: ${this.staffUrl}/jobs`;

    const lines = apps
      .map(
        (a) =>
          `• ${a.job.title} @ ${a.job.company}: ${a.status.replace(/_/g, ' ')} (${new Date(a.appliedAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short' })})`,
      )
      .join('\n');

    return `${apps.length} application(s):\n${lines}\nDashboard: ${this.staffUrl}/talent-dashboard`;
  }

  // ─── Layer 3: Gemini Call with Retry ─────────────────────────────────────
  // Single-turn generateContent (no chat history overhead).
  // Retries once after 1.5 s on 429.

  private async callGemini(
    message: string,
    context: string,
    history: HistoryEntry[],
    attempt = 0,
  ): Promise<string> {
    const model = this.genAI!.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
      generationConfig: {
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.65,
        topP: 0.9,
      },
    });

    try {
      const result = await model.generateContent(
        this.assemblePrompt(message, context, history),
      );
      return result.response.text().trim();
    } catch (err: any) {
      if ((err?.status === 429 || err?.status === 503) && attempt === 0) {
        await new Promise((r) => setTimeout(r, 1500));
        return this.callGemini(message, context, history, 1);
      }
      throw err;
    }
  }

  // ─── Layer 4: Compact Prompt Assembler ───────────────────────────────────
  // Target: ~220-280 input tokens total (system + context + optional history + user msg).
  // The system instruction is intentionally terse to save quota.

  private assemblePrompt(
    message: string,
    context: string,
    history: HistoryEntry[],
  ): string {
    // Only the last exchange matters for continuity (~40 tokens)
    const historyBlock =
      history.length > 0
        ? `\nPrev: User said "${history[history.length - 1].user}" → You replied "${history[history.length - 1].bot.slice(0, 120)}…"\n`
        : '';

    return [
      // ── System instruction (~60 tokens) ──
      `You are Orange, AI assistant for Orange Global (staffing & consulting).`,
      `Rules: markdown, ≤5 bullets, concise, end with ONE action link.`,
      `Base URLs: jobs→${this.staffUrl} | admin→${this.adminUrl}`,
      ``,
      // ── Live context (50-120 tokens, intent-filtered) ──
      `Context: ${context}`,
      historyBlock,
      // ── User message ──
      `User: ${message}`,
      `Orange:`,
    ].join('\n');
  }

  // ─── Layer 5: Rule Engine (zero-cost fallback) ────────────────────────────
  // Produces a solid, formatted response without any API call.

  private ruleEngine(intent: Intent, context: string): string {
    switch (intent) {
      case Intent.JOB_SEARCH: {
        const bullets = context.split('\n').filter((l) => l.startsWith('•')).slice(0, 5);
        if (bullets.length === 0)
          return `No matching vacancies right now. [Browse all jobs →](${this.staffUrl}/jobs)`;
        return [
          `Here are some **matching openings**:`,
          ``,
          ...bullets,
          ``,
          `View all active jobs on the [Jobs Page →](${this.staffUrl}/jobs)`,
        ].join('\n');
      }

      case Intent.APP_STATUS: {
        if (context.includes('Not signed in'))
          return `To check your application status, please [sign in →](${this.staffUrl}/signin).`;
        if (context.includes('No applications'))
          return `You haven't applied yet. Browse our [Jobs Page →](${this.staffUrl}/jobs) to get started!`;
        const bullets = context.split('\n').filter((l) => l.startsWith('•')).slice(0, 5);
        return [
          `Here are your **recent applications**:`,
          ``,
          ...bullets,
          ``,
          `Track full details in your [Talent Dashboard →](${this.staffUrl}/talent-dashboard)`,
        ].join('\n');
      }

      case Intent.PROFILE: {
        if (context.includes('Not signed in'))
          return `To view your profile details, please [sign in →](${this.staffUrl}/signin).`;
        return [
          `Here is your **profile overview**:`,
          ``,
          context,
          ``,
          `Manage your profile: [Edit Profile →](${this.staffUrl}/manage-profile)`,
        ].join('\n');
      }

      case Intent.MIGRATION: {
        return [
          `Here is the **migration and visa information**:`,
          ``,
          context,
          ``,
          `Explore all visa streams: [Migration Pathways →](${this.staffUrl}/migration/skilled-visa/graduate-temporary-485-visa)`,
        ].join('\n');
      }

      case Intent.COMPANY:
        return [
          `**Orange Global** specialises in:`,
          ``,
          `- 🌍 Global talent delivery`,
          `- 🎯 Executive search & direct placements`,
          `- 📝 Contract & temp staffing`,
          `- 💻 Technology transformation consulting`,
          ``,
          `Employers, start hiring via the [Employer Portal →](${this.adminUrl})`,
        ].join('\n');

      case Intent.GENERAL:
      default:
        return [
          `Hi! I'm **Orange** 👋, your AI recruitment guide.`,
          ``,
          `Try asking me:`,
          `- *"Tell me about the Subclass 189 skilled visa"*`,
          `- *"What is my profile completion score?"*`,
          `- *"Show me remote software developer jobs"*`,
          `- *"What's my application status?"*`,
          ``,
          `[Browse all jobs →](${this.staffUrl}/jobs)`,
        ].join('\n');
    }
  }

  // ─── Session Manager ──────────────────────────────────────────────────────

  private getHistory(sessionId?: string): HistoryEntry[] {
    if (!sessionId) return [];
    this.evictExpiredSessions();
    return this.sessions.get(sessionId)?.history ?? [];
  }

  private saveHistory(sessionId: string | undefined, user: string, bot: string): void {
    if (!sessionId) return;
    const existing = this.sessions.get(sessionId) ?? { history: [], expiresAt: 0 };
    // Keep only the last 2 exchanges to cap token usage
    const history = [...existing.history, { user, bot }].slice(-2);
    this.sessions.set(sessionId, { history, expiresAt: Date.now() + SESSION_TTL_MS });
  }

  private evictExpiredSessions(): void {
    const now = Date.now();
    for (const [id, s] of this.sessions) {
      if (s.expiresAt < now) this.sessions.delete(id);
    }
  }

  // ─── Response Cache Helpers ───────────────────────────────────────────────

  private cacheKey(intent: Intent, message: string, userId?: string): string {
    const normalized = message.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 80);
    // Personalised responses keyed by userId; public ones keyed by intent+message
    return `${userId ?? 'guest'}:${intent}:${normalized}`;
  }

  private getCache(store: Map<string, CacheEntry>, key: string): string | null {
    const entry = store.get(key);
    if (!entry || entry.expiresAt < Date.now()) {
      store.delete(key);
      return null;
    }
    return entry.value;
  }

  private setCache(
    store: Map<string, CacheEntry>,
    key: string,
    value: string,
    ttl: number,
  ): void {
    store.set(key, { value, expiresAt: Date.now() + ttl });
  }
}
