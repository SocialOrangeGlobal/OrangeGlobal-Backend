import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResumeParserService } from './resume-parser.service';
import { Job, Resume } from '@prisma/client';

@Injectable()
export class AtsService {
  private readonly logger = new Logger(AtsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly parser: ResumeParserService,
  ) { }

  async processApplication(applicationId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        resume: true,
      },
    });

    if (!app || !app.resume || !app.job) return;

    let text = app.resume.rawText;
    if (!text && app.resume.fileUrl.endsWith('.pdf')) {
      try {
        const response = await fetch(app.resume.fileUrl);
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          text = await this.parser.parsePdfBuffer(Buffer.from(buffer));

          await this.prisma.resume.update({
            where: { id: app.resume.id },
            data: { rawText: text, status: 'READY' }
          });
        }
      } catch (error) {
        this.logger.error('Failed to download or parse resume', error);
      }
    }

    const score = this.calculateATSScore(text || '', app.job);

    await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        atsScore: score.totalScore,
        atsSkillMatch: score.breakdown.skills,
        atsExperienceMatch: score.breakdown.experience,
        atsEducationMatch: score.breakdown.education,
        atsKeywordMatch: score.breakdown.keywords,
        atsBreakdown: score as any,
      }
    });
  }

  private calculateATSScore(resumeText: string, job: Job) {
    const textLower = resumeText.toLowerCase();

    const weights = {
      skills: 0.40,
      keywords: 0.30,
      experience: 0.20,
      education: 0.10,
    };

    let skillScore = 0;
    let keywordScore = 0;
    let expScore = 0;
    let eduScore = 0;

    const jobSkills = (job.skills as string[]) || [];
    if (jobSkills.length > 0) {
      let matchedSkills = 0;
      jobSkills.forEach(skill => {
        if (textLower.includes(skill.toLowerCase())) {
          matchedSkills++;
        }
      });
      skillScore = (matchedSkills / jobSkills.length) * 100;
    } else {
      skillScore = 100;
    }

    const keywords = this.extractKeywords(job.description);
    if (keywords.length > 0) {
      let matchedKeywords = 0;
      keywords.forEach(kw => {
        if (textLower.includes(kw.toLowerCase())) {
          matchedKeywords++;
        }
      });
      keywordScore = (matchedKeywords / keywords.length) * 100;
    } else {
      keywordScore = 100;
    }

    const expMatch = textLower.match(/(\d+)\+?\s*years?/);
    const resumeExp = expMatch ? parseInt(expMatch[1], 10) : 0;
    const requiredExp = job.experienceMin || 0;

    if (requiredExp === 0) {
      expScore = 100;
    } else if (resumeExp >= requiredExp) {
      expScore = 100;
    } else {
      expScore = (resumeExp / requiredExp) * 100;
    }

    const requiredEdu = (job.educationLevel || '').toLowerCase();
    if (!requiredEdu) {
      eduScore = 100;
    } else {
      const bachelors = ['bachelor', 'bsc', 'ba', 'b.s', 'b.a', 'degree'];
      const masters = ['master', 'msc', 'ma', 'm.s', 'm.a', 'mba'];
      const phd = ['phd', 'doctorate', 'ph.d'];

      let hasEdu = false;
      if (requiredEdu.includes('bachelor')) {
        hasEdu = bachelors.some(kw => textLower.includes(kw));
      } else if (requiredEdu.includes('master')) {
        hasEdu = masters.some(kw => textLower.includes(kw));
      } else if (requiredEdu.includes('phd') || requiredEdu.includes('doctor')) {
        hasEdu = phd.some(kw => textLower.includes(kw));
      } else {
        hasEdu = textLower.includes(requiredEdu);
      }

      eduScore = hasEdu ? 100 : 50;
    }

    const totalScore = (skillScore * weights.skills) +
      (keywordScore * weights.keywords) +
      (expScore * weights.experience) +
      (eduScore * weights.education);

    return {
      totalScore: parseFloat(totalScore.toFixed(2)),
      breakdown: {
        skills: parseFloat(skillScore.toFixed(2)),
        keywords: parseFloat(keywordScore.toFixed(2)),
        experience: parseFloat(expScore.toFixed(2)),
        education: parseFloat(eduScore.toFixed(2))
      }
    };
  }

  private extractKeywords(text: string): string[] {
    if (!text) return [];
    const commonWords = ['the', 'and', 'or', 'a', 'to', 'of', 'in', 'for', 'with', 'on', 'as', 'an', 'is', 'at', 'by', 'this', 'that', 'are', 'be', 'will', 'have', 'from', 'we', 'your', 'you'];
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
    const uniqueWords = [...new Set(words)];
    const keywords = uniqueWords.filter(w => w.length > 4 && !commonWords.includes(w));
    return keywords.slice(0, 15);
  }
}
