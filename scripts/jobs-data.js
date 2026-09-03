/**
 * jobs-data.js
 * -----------------------------------------------------------------------
 * Structured job data for the Orange Global Hire Platform.
 * Covers 10 trending IT roles across two sourcing corridors:
 *   - Japan -> Australia (5 roles)
 *   - China -> Australia (5 roles)
 *
 * IMPORTANT: Field names here are based on the "Post a New Job" form
 * (Basics / Details / Requirements / Benefits). Match these keys to your
 * actual Prisma `Job` model field names in seed-jobs.js before running —
 * see the mapping notes at the top of seed-jobs.js.
 * -----------------------------------------------------------------------
 */

const COMPANY_NAME = "Orange Global"; // change per-employer if needed

const jobs = [
  // ============================= JAPAN =============================
  {
    jobTitle: "Full-Stack / Software Developer",
    companyName: COMPANY_NAME,
    industry: "Information Technology / Software Development",
    jobCategory: "Software Development / Engineering",
    location: "Sydney, NSW, Australia",
    workMode: "On-site",
    positionType: "Full-time",
    vacancies: 2,
    salaryMin: 85000,
    salaryMax: 180000,
    currency: "AUD",
    targetRegion: "Japan",
    anzscoCode: "261312 / 261313",
    description: `We're hiring a Full-Stack Software Developer to join our engineering team in Sydney/Melbourne, with visa sponsorship available for skilled candidates relocating from Japan.

About the Role:
You'll build and maintain full-stack applications across our product suite, working with modern cloud infrastructure and collaborating with a global engineering team. This role suits developers with a strong background in digital transformation (DX) or SaaS environments who are comfortable working in English-first teams.

Responsibilities:
- Design, build, and maintain scalable full-stack applications (frontend + backend)
- Work with cloud platforms (AWS/Azure/GCP) to deploy and manage microservices
- Collaborate with product and design teams to ship features end-to-end
- Write clean, maintainable code and participate in code reviews
- Contribute to system architecture decisions as the platform scales

What We're Looking For:
- 3+ years of professional full-stack development experience
- Proficiency in Java, Python, or JavaScript/TypeScript
- Experience with cloud infrastructure and SaaS/microservices architecture
- Comfortable working in an English-speaking, distributed team
- Prior experience in DX-driven or SaaS companies is a strong plus

Visa Sponsorship:
This role is eligible for the Temporary Skill Shortage (subclass 482) visa, with a pathway to permanent residency (186/189/190) for the right candidate.`,
    requirements: [
      "3+ years of professional full-stack development experience",
      "Proficiency in Java, Python, or JavaScript/TypeScript",
      "Hands-on experience with cloud platforms (AWS, Azure, or GCP)",
      "Experience building and deploying microservices or SaaS architecture",
      "Familiarity with CI/CD pipelines and version control (Git)",
      "Strong English communication skills for distributed team collaboration",
      "Experience in DX (digital transformation) or SaaS-driven environments preferred",
      "Bachelor's degree in Computer Science, Engineering, or equivalent practical experience",
      "Eligible for ANZSCO 261312/261313 (Developer Programmer / Software Engineer)",
      "Willingness to relocate to Sydney or Melbourne under employer-sponsored visa (subclass 482)",
    ],
    benefits: [
      "Visa sponsorship (subclass 482) with pathway to permanent residency",
      "Competitive salary (AUD 85,000–180,000, based on experience)",
      "Relocation assistance for candidates moving from Japan",
      "Health insurance",
      "Flexible working arrangements",
      "Paid annual leave and public holidays (Australian standard)",
    ],
    publish: true,
  },
  {
    jobTitle: "Cloud / DevOps Engineer",
    companyName: COMPANY_NAME,
    industry: "Information Technology / Cloud Computing",
    jobCategory: "Software Development / Engineering",
    location: "Melbourne, VIC, Australia",
    workMode: "On-site",
    positionType: "Full-time",
    vacancies: 2,
    salaryMin: 130000,
    salaryMax: 220000,
    currency: "AUD",
    targetRegion: "Japan",
    anzscoCode: "263111 / 261313",
    description: `We're hiring a Cloud/DevOps Engineer to join our infrastructure team in Sydney/Melbourne, with visa sponsorship available for skilled candidates relocating from Japan.

About the Role:
You'll design, build, and manage our cloud infrastructure, driving reliability, scalability, and automation across our platform. This role suits engineers with strong experience from Japan's cloud migration and digital transformation projects.

Responsibilities:
- Architect and manage cloud infrastructure on AWS, Azure, or GCP
- Build and maintain CI/CD pipelines for automated deployment
- Implement infrastructure-as-code (Terraform, CloudFormation, etc.)
- Monitor system performance, reliability, and security
- Collaborate with development teams to optimize deployment workflows
- Manage containerized environments using Docker and Kubernetes

What We're Looking For:
- 4+ years of experience in cloud infrastructure or DevOps roles
- Strong hands-on experience with AWS, Azure, or GCP
- Proficiency with Kubernetes, Docker, and CI/CD tooling
- Experience with infrastructure-as-code practices
- Comfortable working in an English-speaking, distributed team

Visa Sponsorship:
Eligible for the Temporary Skill Shortage (subclass 482) visa, with a pathway to permanent residency (186/189/190).`,
    requirements: [
      "4+ years of experience in cloud infrastructure or DevOps",
      "Strong hands-on experience with AWS, Azure, or GCP",
      "Proficiency with Kubernetes and Docker",
      "Experience building CI/CD pipelines (Jenkins, GitLab CI, GitHub Actions)",
      "Infrastructure-as-code experience (Terraform, CloudFormation, or Ansible)",
      "Strong scripting skills (Python, Bash, or Go)",
      "Experience with monitoring/observability tools (Prometheus, Grafana, Datadog)",
      "Strong English communication skills for distributed team collaboration",
      "Eligible for ANZSCO 263111 (Computer Network and Systems Engineer) or 261313",
      "Willingness to relocate to Sydney or Melbourne under employer-sponsored visa (subclass 482)",
    ],
    benefits: [
      "Visa sponsorship (subclass 482) with pathway to permanent residency",
      "Competitive salary (AUD 130,000–220,000, based on experience)",
      "Relocation assistance for candidates moving from Japan",
      "Health insurance",
      "Flexible working arrangements",
      "Paid annual leave and public holidays (Australian standard)",
    ],
    publish: true,
  },
  {
    jobTitle: "AI/ML Engineer",
    companyName: COMPANY_NAME,
    industry: "Information Technology / Artificial Intelligence",
    jobCategory: "Software Development / Data & AI",
    location: "Sydney, NSW, Australia",
    workMode: "Hybrid",
    positionType: "Full-time",
    vacancies: 2,
    salaryMin: 140000,
    salaryMax: 230000,
    currency: "AUD",
    targetRegion: "Japan",
    anzscoCode: "261311 / 263111",
    description: `We're hiring an AI/ML Engineer to join our team in Sydney/Melbourne, with visa sponsorship available for skilled candidates relocating from Japan.

About the Role:
You'll design, train, and deploy machine learning models that power our core products, working closely with data and engineering teams to bring AI capabilities into production.

Responsibilities:
- Design and train ML models for production use cases
- Fine-tune and deploy LLMs and other deep learning models
- Build MLOps pipelines for model versioning, monitoring, and retraining
- Collaborate with product teams to identify high-impact AI applications
- Optimize model performance and inference costs
- Stay current with emerging AI research and tooling

What We're Looking For:
- 3+ years of experience in ML engineering or applied AI
- Strong proficiency in Python and ML frameworks (TensorFlow/PyTorch)
- Experience with LLM fine-tuning or deployment
- Familiarity with MLOps practices and cloud ML platforms
- Comfortable working in an English-speaking, distributed team

Visa Sponsorship:
Eligible for the Temporary Skill Shortage (subclass 482) visa, with a pathway to permanent residency (186/189/190).`,
    requirements: [
      "3+ years of experience in ML engineering or applied AI",
      "Strong proficiency in Python and ML frameworks (TensorFlow, PyTorch)",
      "Experience with LLM fine-tuning, prompt engineering, or model deployment",
      "Familiarity with MLOps tools (MLflow, Kubeflow, or similar)",
      "Experience with cloud ML platforms (AWS SageMaker, Vertex AI, Azure ML)",
      "Strong understanding of data pipelines and feature engineering",
      "Experience with model monitoring and performance optimization",
      "Strong English communication skills for distributed team collaboration",
      "Eligible for ANZSCO 261311 (Analyst Programmer) or 263111",
      "Willingness to relocate to Sydney or Melbourne under employer-sponsored visa (subclass 482)",
    ],
    benefits: [
      "Visa sponsorship (subclass 482) with pathway to permanent residency",
      "Competitive salary (AUD 140,000–230,000, based on experience)",
      "Relocation assistance for candidates moving from Japan",
      "Health insurance",
      "Flexible/hybrid working arrangements",
      "Paid annual leave and public holidays (Australian standard)",
    ],
    publish: true,
  },
  {
    jobTitle: "Site Reliability Engineer (SRE)",
    companyName: COMPANY_NAME,
    industry: "Information Technology / Infrastructure",
    jobCategory: "Software Development / Engineering",
    location: "Sydney, NSW, Australia",
    workMode: "On-site",
    positionType: "Full-time",
    vacancies: 2,
    salaryMin: 135000,
    salaryMax: 200000,
    currency: "AUD",
    targetRegion: "Japan",
    anzscoCode: "263111",
    description: `We're hiring a Site Reliability Engineer to join our infrastructure team in Sydney/Melbourne, with visa sponsorship available for skilled candidates relocating from Japan.

About the Role:
You'll ensure the reliability, scalability, and performance of our production systems, bringing high-availability engineering discipline to our platform.

Responsibilities:
- Design and maintain highly available, fault-tolerant systems
- Build observability tooling (metrics, logs, tracing) for production systems
- Lead incident response and post-incident reviews
- Automate operational tasks to reduce manual toil
- Define and track SLIs/SLOs for critical services
- Collaborate with engineering teams on reliability best practices

What We're Looking For:
- 4+ years of experience in SRE, DevOps, or infrastructure engineering
- Strong experience with Kubernetes and container orchestration
- Proficiency with observability tools (Prometheus, Grafana, Datadog)
- Experience with incident management and on-call rotations
- Comfortable working in an English-speaking, distributed team

Visa Sponsorship:
Eligible for the Temporary Skill Shortage (subclass 482) visa, with a pathway to permanent residency (186/189/190).`,
    requirements: [
      "4+ years of experience in SRE, DevOps, or infrastructure engineering",
      "Strong experience with Kubernetes and container orchestration",
      "Proficiency with observability tools (Prometheus, Grafana, Datadog)",
      "Experience with incident response and on-call management",
      "Strong scripting/automation skills (Python, Bash, or Go)",
      "Experience defining and tracking SLIs/SLOs",
      "Familiarity with infrastructure-as-code (Terraform, Ansible)",
      "Strong English communication skills for distributed team collaboration",
      "Eligible for ANZSCO 263111 (Computer Network and Systems Engineer)",
      "Willingness to relocate to Sydney or Melbourne under employer-sponsored visa (subclass 482)",
    ],
    benefits: [
      "Visa sponsorship (subclass 482) with pathway to permanent residency",
      "Competitive salary (AUD 135,000–200,000, based on experience)",
      "Relocation assistance for candidates moving from Japan",
      "Health insurance",
      "Flexible working arrangements",
      "Paid annual leave and public holidays (Australian standard)",
    ],
    publish: true,
  },
  {
    jobTitle: "Cybersecurity Engineer / Analyst",
    companyName: COMPANY_NAME,
    industry: "Information Technology / Cybersecurity",
    jobCategory: "Security / IT Risk & Compliance",
    location: "Sydney, NSW, Australia",
    workMode: "On-site",
    positionType: "Full-time",
    vacancies: 2,
    salaryMin: 130000,
    salaryMax: 210000,
    currency: "AUD",
    targetRegion: "Japan",
    anzscoCode: "262112",
    description: `We're hiring a Cybersecurity Engineer/Analyst to join our security team in Sydney/Melbourne, with visa sponsorship available for skilled candidates relocating from Japan.

About the Role:
You'll protect our systems and data from evolving threats, monitoring, detecting, and responding to security incidents while strengthening our overall security posture.

Responsibilities:
- Monitor systems for security threats and anomalies (SOC operations)
- Conduct vulnerability assessments and penetration testing
- Implement and manage cloud security controls (AWS/Azure)
- Respond to and investigate security incidents
- Ensure compliance with relevant security frameworks and standards
- Develop security policies and staff training materials

What We're Looking For:
- 3+ years of experience in cybersecurity or information security roles
- Experience with SOC operations, SIEM tools, and threat detection
- Knowledge of cloud security practices (AWS/Azure)
- Familiarity with compliance frameworks (ISO 27001, SOC 2)
- Comfortable working in an English-speaking, distributed team

Visa Sponsorship:
Eligible for the Temporary Skill Shortage (subclass 482) visa, with a pathway to permanent residency (186/189/190).`,
    requirements: [
      "3+ years of experience in cybersecurity or information security",
      "Experience with SOC operations and SIEM tools (Splunk, QRadar)",
      "Knowledge of cloud security practices (AWS/Azure security controls)",
      "Experience with penetration testing or vulnerability assessment",
      "Familiarity with compliance frameworks (ISO 27001, SOC 2, NIST)",
      "Incident response and forensic investigation experience",
      "Relevant certification preferred (CISSP, CEH, Security+)",
      "Strong English communication skills for distributed team collaboration",
      "Eligible for ANZSCO 262112 (ICT Security Specialist)",
      "Willingness to relocate to Sydney or Melbourne under employer-sponsored visa (subclass 482)",
    ],
    benefits: [
      "Visa sponsorship (subclass 482) with pathway to permanent residency",
      "Competitive salary (AUD 130,000–210,000, based on experience)",
      "Relocation assistance for candidates moving from Japan",
      "Health insurance",
      "Flexible working arrangements",
      "Paid annual leave and public holidays (Australian standard)",
    ],
    publish: true,
  },

  // ============================= CHINA ==============================
  {
    jobTitle: "ICT Business Analyst",
    companyName: COMPANY_NAME,
    industry: "Information Technology / Business Analysis",
    jobCategory: "Business Analysis / IT Consulting",
    location: "Melbourne, VIC, Australia",
    workMode: "Hybrid",
    positionType: "Full-time",
    vacancies: 2,
    salaryMin: 90000,
    salaryMax: 150000,
    currency: "AUD",
    targetRegion: "China",
    anzscoCode: "261111",
    description: `We're hiring an ICT Business Analyst to join our team in Melbourne, with visa sponsorship and state-nomination pathways available for skilled candidates relocating from China.

About the Role:
You'll bridge the gap between business needs and technical solutions, gathering requirements, analyzing processes, and working closely with stakeholders and engineering teams to shape product direction.

Responsibilities:
- Gather and document business requirements from stakeholders
- Analyze current business processes and identify improvement opportunities
- Translate business needs into functional specifications for development teams
- Facilitate workshops and stakeholder meetings
- Support UAT (user acceptance testing) and product rollout
- Prepare reports and presentations for leadership

What We're Looking For:
- 3+ years of experience as a Business Analyst in an IT/tech environment
- Strong analytical and problem-solving skills
- Experience with requirements documentation and process mapping tools
- Strong English business communication skills
- Bachelor's degree in Business, IT, or related field

Visa Sponsorship:
This occupation (ANZSCO 261111) was reinstated to Australia's MLTSSL in late 2025, opening a state-nominated (190) pathway — Victoria actively prioritizes ICT nominations.`,
    requirements: [
      "3+ years of experience as a Business Analyst in IT or tech",
      "Strong requirements-gathering and stakeholder management skills",
      "Experience with process mapping and documentation tools (Visio, Lucidchart, Confluence)",
      "Familiarity with Agile/Scrum methodologies",
      "Strong analytical and problem-solving ability",
      "Strong English business communication and presentation skills",
      "Experience supporting UAT and product rollout",
      "Bachelor's degree in Business, IT, or a related field",
      "Eligible for ANZSCO 261111 (ICT Business Analyst) — reinstated to MLTSSL in 2025",
      "Willingness to relocate to Melbourne, VIC under state-nominated visa (subclass 190)",
    ],
    benefits: [
      "Visa sponsorship / state nomination (subclass 190) with PR pathway",
      "Competitive salary (AUD 90,000–150,000, based on experience)",
      "Relocation assistance for candidates moving from China",
      "Health insurance",
      "Flexible/hybrid working arrangements",
      "Paid annual leave and public holidays (Australian standard)",
    ],
    publish: true,
  },
  {
    jobTitle: "Data Scientist",
    companyName: COMPANY_NAME,
    industry: "Information Technology / Data & Analytics",
    jobCategory: "Data Science / Analytics",
    location: "Sydney, NSW, Australia",
    workMode: "Hybrid",
    positionType: "Full-time",
    vacancies: 2,
    salaryMin: 100000,
    salaryMax: 160000,
    currency: "AUD",
    targetRegion: "China",
    anzscoCode: "224113",
    description: `We're hiring a Data Scientist to join our analytics team in Sydney/Melbourne, with a newly opened PR pathway for skilled candidates relocating from China.

About the Role:
You'll build and deploy machine learning models, analyze large datasets, and generate insights that drive product and business decisions. Ideal for candidates from China's AI/big-data-trained talent pool.

Responsibilities:
- Analyze large, complex datasets to extract actionable insights
- Build, train, and deploy machine learning models
- Collaborate with engineering and product teams to integrate ML into products
- Design experiments and A/B tests to validate hypotheses
- Communicate findings to technical and non-technical stakeholders
- Maintain data pipelines and ensure data quality

What We're Looking For:
- 3+ years of experience in data science or machine learning roles
- Strong proficiency in Python, R, and SQL
- Experience with ML frameworks (TensorFlow, PyTorch, scikit-learn)
- Strong data visualization skills (Tableau, Power BI, or similar)
- Experience with big data platforms (Spark, Hadoop) is a plus
- Strong English communication skills

Visa Sponsorship:
Data Scientist was newly added to Australia's MLTSSL for 2026, opening a fresh 189/190 PR pathway with less competition for early applicants.`,
    requirements: [
      "3+ years of experience in data science or machine learning",
      "Strong proficiency in Python, R, and SQL",
      "Experience with ML frameworks (TensorFlow, PyTorch, or scikit-learn)",
      "Strong data visualization skills (Tableau, Power BI, or similar)",
      "Experience with big data platforms (Spark, Hadoop) preferred",
      "Strong statistical analysis and experimental design skills",
      "Experience communicating insights to non-technical stakeholders",
      "Master's degree in Data Science, Statistics, Computer Science, or related field preferred",
      "Eligible for ANZSCO 224113 (Data Scientist) — newly added to MLTSSL for 2026",
      "Willingness to relocate to Sydney or Melbourne under independent or state-nominated visa (189/190)",
    ],
    benefits: [
      "Visa pathway (189 independent or 190 state-nominated) toward permanent residency",
      "Competitive salary (AUD 100,000–160,000, based on experience)",
      "Relocation assistance for candidates moving from China",
      "Health insurance",
      "Flexible/hybrid working arrangements",
      "Paid annual leave and public holidays (Australian standard)",
    ],
    publish: true,
  },
  {
    jobTitle: "Cybersecurity Specialist",
    companyName: COMPANY_NAME,
    industry: "Information Technology / Cybersecurity",
    jobCategory: "Security / IT Risk & Compliance",
    location: "Sydney, NSW, Australia",
    workMode: "On-site",
    positionType: "Full-time",
    vacancies: 2,
    salaryMin: 130000,
    salaryMax: 210000,
    currency: "AUD",
    targetRegion: "China",
    anzscoCode: "262112",
    description: `We're hiring a Cybersecurity Specialist to join our security team in Sydney/Melbourne, with a strong visa pathway for skilled candidates relocating from China.

About the Role:
You'll protect our systems and data from evolving threats, bringing large-scale platform security experience to strengthen our overall security posture.

Responsibilities:
- Monitor systems for security threats and anomalies (SOC operations)
- Conduct vulnerability assessments and penetration testing
- Implement and manage cloud security controls (AWS/Azure)
- Lead fraud prevention and risk detection initiatives
- Respond to and investigate security incidents
- Ensure compliance with relevant security frameworks and standards

What We're Looking For:
- 3+ years of experience in cybersecurity, ideally in fintech/e-commerce/payments
- Experience with SOC operations, SIEM tools, and threat detection
- Knowledge of cloud security practices (AWS/Azure)
- Familiarity with compliance frameworks (ISO 27001, SOC 2)
- Comfortable working in an English-speaking, distributed team

Visa Pathway:
Eligible for 189 (Independent) or 190 (State Nominated) PR pathways, or 482 employer sponsorship.`,
    requirements: [
      "3+ years of experience in cybersecurity, ideally fintech/e-commerce/payments",
      "Experience with SOC operations and SIEM tools (Splunk, QRadar)",
      "Knowledge of cloud security practices (AWS/Azure security controls)",
      "Experience with fraud detection and risk prevention systems",
      "Familiarity with compliance frameworks (ISO 27001, SOC 2, NIST)",
      "Incident response and forensic investigation experience",
      "Relevant certification preferred (CISSP, CEH, Security+)",
      "Strong English communication skills for distributed team collaboration",
      "Eligible for ANZSCO 262112 (ICT Security Specialist)",
      "Willingness to relocate to Sydney or Melbourne under independent/state-nominated visa (189/190)",
    ],
    benefits: [
      "Visa pathway (189/190) toward permanent residency, or 482 sponsorship",
      "Competitive salary (AUD 130,000–210,000, based on experience)",
      "Relocation assistance for candidates moving from China",
      "Health insurance",
      "Flexible working arrangements",
      "Paid annual leave and public holidays (Australian standard)",
    ],
    publish: true,
  },
  {
    jobTitle: "QA / Test Automation Engineer",
    companyName: COMPANY_NAME,
    industry: "Information Technology / Quality Assurance",
    jobCategory: "Software Testing / QA",
    location: "Melbourne, VIC, Australia",
    workMode: "Hybrid",
    positionType: "Full-time",
    vacancies: 3,
    salaryMin: 90000,
    salaryMax: 140000,
    currency: "AUD",
    targetRegion: "China",
    anzscoCode: "261314",
    description: `We're hiring a QA/Test Automation Engineer to join our engineering team in Melbourne/Sydney, with a state-nomination visa pathway available for skilled candidates relocating from China.

About the Role:
You'll design and maintain automated test suites, ensuring product quality and reliability across our platform at scale.

Responsibilities:
- Design, build, and maintain automated test frameworks
- Write and execute test plans covering functional, regression, and integration testing
- Integrate automated tests into CI/CD pipelines
- Perform API and performance testing
- Collaborate with developers to identify and resolve defects early
- Advocate for quality best practices across the team

What We're Looking For:
- 2+ years of experience in QA or test automation
- Proficiency with test automation tools (Selenium, Playwright, or Cypress)
- Experience with API testing tools (Postman, REST Assured)
- Familiarity with CI/CD test integration
- Strong English communication skills

Visa Pathway:
Eligible for 190 (State Nominated) PR pathway, or 482 employer sponsorship — a more accessible entry point into Australia's skilled visa system.`,
    requirements: [
      "2+ years of experience in QA or test automation",
      "Proficiency with test automation tools (Selenium, Playwright, or Cypress)",
      "Experience with API testing tools (Postman, REST Assured)",
      "Familiarity with CI/CD pipelines and test integration",
      "Understanding of test strategy design and test case management",
      "Basic scripting knowledge (Python, JavaScript, or Java)",
      "Experience with bug tracking tools (Jira, TestRail)",
      "Strong English communication skills for distributed team collaboration",
      "Eligible for ANZSCO 261314 (Software Tester)",
      "Willingness to relocate to Melbourne or Sydney under state-nominated visa (subclass 190)",
    ],
    benefits: [
      "Visa pathway (190 state-nominated) toward permanent residency, or 482 sponsorship",
      "Competitive salary (AUD 90,000–140,000, based on experience)",
      "Relocation assistance for candidates moving from China",
      "Health insurance",
      "Flexible/hybrid working arrangements",
      "Paid annual leave and public holidays (Australian standard)",
    ],
    publish: true,
  },
  {
    jobTitle: "Cloud Solutions Architect",
    companyName: COMPANY_NAME,
    industry: "Information Technology / Cloud Computing",
    jobCategory: "Software Development / Architecture",
    location: "Sydney, NSW, Australia",
    workMode: "Hybrid",
    positionType: "Full-time",
    vacancies: 1,
    salaryMin: 150000,
    salaryMax: 230000,
    currency: "AUD",
    targetRegion: "China",
    anzscoCode: "263111 / 135112",
    description: `We're hiring a Cloud Solutions Architect to lead infrastructure design in Sydney/Melbourne, with a strong visa pathway for senior candidates relocating from China.

About the Role:
You'll design scalable, secure, and cost-effective cloud architectures, guiding our platform's technical direction as we expand.

Responsibilities:
- Design and oversee multi-cloud architecture strategy
- Lead cloud migration and modernization initiatives
- Define standards for scalability, security, and cost optimization
- Collaborate with engineering leadership on technical roadmaps
- Mentor engineering teams on cloud best practices
- Evaluate and recommend new cloud technologies and services

What We're Looking For:
- 6+ years of experience in cloud architecture or senior infrastructure engineering
- Deep expertise in AWS/Azure (experience with Alibaba Cloud a plus)
- Strong system design and cost optimization skills
- Experience leading large-scale cloud migrations
- Strong English communication skills for stakeholder collaboration

Visa Pathway:
Eligible for 482 employer sponsorship with pathway to 186 permanent residency, or 190 state nomination.`,
    requirements: [
      "6+ years of experience in cloud architecture or senior infrastructure roles",
      "Deep expertise in AWS or Azure; Alibaba Cloud experience valued",
      "Strong system design and distributed systems knowledge",
      "Experience leading large-scale cloud migration projects",
      "Strong understanding of cost optimization and FinOps practices",
      "Relevant certifications preferred (AWS Solutions Architect, Azure Architect)",
      "Experience mentoring engineering teams on architecture best practices",
      "Strong English communication skills for stakeholder collaboration",
      "Eligible for ANZSCO 263111 or 135112 (ICT Project Manager)",
      "Willingness to relocate to Sydney or Melbourne under employer-sponsored visa (subclass 482)",
    ],
    benefits: [
      "Visa sponsorship (subclass 482) with pathway to permanent residency, or 190 nomination",
      "Competitive salary (AUD 150,000–230,000, based on experience)",
      "Relocation assistance for candidates moving from China",
      "Health insurance",
      "Flexible/hybrid working arrangements",
      "Paid annual leave and public holidays (Australian standard)",
    ],
    publish: true,
  },
  {
    jobTitle: "UX/UI Designer (Product Design)",
    companyName: COMPANY_NAME,
    industry: "Information Technology / Product Design",
    jobCategory: "Design / User Experience",
    location: "Sydney, NSW, Australia",
    workMode: "Hybrid",
    positionType: "Full-time",
    vacancies: 2,
    salaryMin: 95000,
    salaryMax: 150000,
    currency: "AUD",
    targetRegion: "China",
    anzscoCode: "232414 / 261399",
    description: `We're hiring a UX/UI Designer to join our product team in Sydney/Melbourne, with a state-nomination visa pathway available for skilled candidates relocating from China.

About the Role:
You'll design intuitive, engaging user experiences across our web and mobile products, bringing mobile-first design expertise to our growing product suite.

Responsibilities:
- Design user flows, wireframes, and high-fidelity prototypes
- Conduct user research to inform design decisions
- Maintain and evolve our design system
- Collaborate closely with product managers and engineers
- Run usability testing and iterate based on feedback
- Ensure design consistency across web and mobile platforms

What We're Looking For:
- 3+ years of experience in UX/UI or product design
- Strong proficiency in Figma and design systems
- Experience designing mobile-first, cross-platform products
- Strong user research and prototyping skills
- Strong English communication skills

Visa Pathway:
Eligible for 190 (State Nominated) PR pathway, or 482 employer sponsorship.`,
    requirements: [
      "3+ years of experience in UX/UI or product design",
      "Strong proficiency in Figma and building/maintaining design systems",
      "Experience designing mobile-first, cross-platform products",
      "Strong user research, prototyping, and usability testing skills",
      "Understanding of accessibility and responsive design principles",
      "Experience collaborating closely with PMs and engineers",
      "Strong portfolio demonstrating end-to-end design process",
      "Strong English communication skills for distributed team collaboration",
      "Eligible for ANZSCO 232414 (Multimedia Designer) or 261399",
      "Willingness to relocate to Sydney or Melbourne under state-nominated visa (subclass 190)",
    ],
    benefits: [
      "Visa pathway (190 state-nominated) toward permanent residency, or 482 sponsorship",
      "Competitive salary (AUD 95,000–150,000, based on experience)",
      "Relocation assistance for candidates moving from China",
      "Health insurance",
      "Flexible/hybrid working arrangements",
      "Paid annual leave and public holidays (Australian standard)",
    ],
    publish: true,
  },
];

module.exports = { jobs };
