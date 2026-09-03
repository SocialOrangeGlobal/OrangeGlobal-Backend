/**
 * jobs-data-batch2.js
 * -----------------------------------------------------------------------
 * SECOND BATCH — 10 additional trending IT roles, distinct from the
 * first batch (jobs-data.js) which is already posted/published:
 *   Already posted: Full-Stack/Software Developer, Cloud/DevOps Engineer,
 *   AI/ML Engineer, Site Reliability Engineer, Cybersecurity Engineer/
 *   Analyst (Japan) | ICT Business Analyst, Data Scientist, Cybersecurity
 *   Specialist, QA/Test Automation Engineer, Cloud Solutions Architect,
 *   UX/UI Designer (China)
 *
 * This batch adds:
 *   Japan  -> Data Engineer, Blockchain Developer, IT Project Manager,
 *             Embedded Systems Engineer, Frontend Engineer (React)
 *   China  -> BI Developer, Salesforce Developer/Admin, ERP/SAP
 *             Consultant, Database Administrator, Network Engineer
 *
 * Run with the same seed-jobs.js runner — see README for how to point
 * it at this file instead of (or in addition to) jobs-data.js.
 * -----------------------------------------------------------------------
 */

const COMPANY_NAME = "Orange Global"; // change per-employer if needed

const jobs = [
  // ============================= JAPAN =============================
  {
    jobTitle: "Data Engineer",
    companyName: COMPANY_NAME,
    industry: "Information Technology / Data Engineering",
    jobCategory: "Data & Analytics",
    location: "Sydney, NSW, Australia",
    workMode: "Hybrid",
    positionType: "Full-time",
    vacancies: 2,
    salaryMin: 120000,
    salaryMax: 190000,
    currency: "AUD",
    targetRegion: "Japan",
    anzscoCode: "261313 / 263111",
    description: `We're hiring a Data Engineer to join our data platform team in Sydney/Melbourne, with visa sponsorship available for skilled candidates relocating from Japan.

About the Role:
You'll design, build, and maintain the data pipelines and infrastructure that power analytics and ML across our products.

Responsibilities:
- Design and build scalable ETL/ELT data pipelines
- Maintain and optimize data warehouses (Snowflake, BigQuery, Redshift)
- Ensure data quality, governance, and reliability
- Collaborate with data scientists and analysts on data access needs
- Automate data workflows using orchestration tools (Airflow, dbt)
- Monitor pipeline performance and troubleshoot issues

What We're Looking For:
- 3+ years of experience in data engineering
- Strong SQL and Python skills
- Experience with cloud data warehouses and orchestration tools
- Familiarity with streaming data (Kafka) is a plus
- Comfortable working in an English-speaking, distributed team

Visa Sponsorship:
Eligible for the Temporary Skill Shortage (subclass 482) visa, with a pathway to permanent residency (186/189/190).`,
    requirements: [
      "3+ years of experience in data engineering",
      "Strong SQL and Python skills",
      "Experience with cloud data warehouses (Snowflake, BigQuery, or Redshift)",
      "Familiarity with orchestration tools (Airflow, dbt, or Prefect)",
      "Experience with streaming/event data (Kafka) preferred",
      "Understanding of data modeling and warehouse design",
      "Experience with version control and CI/CD for data pipelines",
      "Strong English communication skills for distributed team collaboration",
      "Eligible for ANZSCO 261313 (Software Engineer) or 263111",
      "Willingness to relocate to Sydney or Melbourne under employer-sponsored visa (subclass 482)",
    ],
    benefits: [
      "Visa sponsorship (subclass 482) with pathway to permanent residency",
      "Competitive salary (AUD 120,000–190,000, based on experience)",
      "Relocation assistance for candidates moving from Japan",
      "Health insurance",
      "Flexible/hybrid working arrangements",
      "Paid annual leave and public holidays (Australian standard)",
    ],
    publish: true,
  },
  {
    jobTitle: "Blockchain Developer",
    companyName: COMPANY_NAME,
    industry: "Information Technology / Blockchain & Web3",
    jobCategory: "Software Development / Engineering",
    location: "Melbourne, VIC, Australia",
    workMode: "Hybrid",
    positionType: "Full-time",
    vacancies: 1,
    salaryMin: 130000,
    salaryMax: 200000,
    currency: "AUD",
    targetRegion: "Japan",
    anzscoCode: "261312",
    description: `We're hiring a Blockchain Developer to join our engineering team in Melbourne/Sydney, with visa sponsorship available for skilled candidates relocating from Japan.

About the Role:
You'll build and maintain smart contracts and blockchain-based systems, working across our product's decentralized infrastructure.

Responsibilities:
- Design, develop, and audit smart contracts (Solidity or similar)
- Build integrations between blockchain networks and backend systems
- Ensure security best practices in smart contract development
- Collaborate with product teams on Web3 feature design
- Monitor and optimize gas costs and contract performance
- Stay current with blockchain protocol updates and standards

What We're Looking For:
- 3+ years of experience in blockchain or smart contract development
- Proficiency in Solidity and Ethereum-compatible chains
- Understanding of smart contract security practices
- Experience with Web3 libraries (ethers.js, web3.js)
- Comfortable working in an English-speaking, distributed team

Visa Sponsorship:
Eligible for the Temporary Skill Shortage (subclass 482) visa, with a pathway to permanent residency (186).`,
    requirements: [
      "3+ years of experience in blockchain or smart contract development",
      "Proficiency in Solidity and Ethereum-compatible chains",
      "Strong understanding of smart contract security best practices",
      "Experience with Web3 libraries (ethers.js, web3.js)",
      "Familiarity with Layer 2 solutions and gas optimization",
      "Experience with smart contract testing frameworks (Hardhat, Foundry)",
      "Understanding of decentralized application (dApp) architecture",
      "Strong English communication skills for distributed team collaboration",
      "Eligible for ANZSCO 261312 (Developer Programmer)",
      "Willingness to relocate to Melbourne or Sydney under employer-sponsored visa (subclass 482)",
    ],
    benefits: [
      "Visa sponsorship (subclass 482) with pathway to permanent residency",
      "Competitive salary (AUD 130,000–200,000, based on experience)",
      "Relocation assistance for candidates moving from Japan",
      "Health insurance",
      "Flexible/hybrid working arrangements",
      "Paid annual leave and public holidays (Australian standard)",
    ],
    publish: true,
  },
  {
    jobTitle: "IT Project Manager",
    companyName: COMPANY_NAME,
    industry: "Information Technology / Project Management",
    jobCategory: "Project Management",
    location: "Sydney, NSW, Australia",
    workMode: "Hybrid",
    positionType: "Full-time",
    vacancies: 1,
    salaryMin: 115000,
    salaryMax: 170000,
    currency: "AUD",
    targetRegion: "Japan",
    anzscoCode: "135112",
    description: `We're hiring an IT Project Manager to lead technical project delivery in Sydney/Melbourne, with visa sponsorship available for skilled candidates relocating from Japan.

About the Role:
You'll plan, coordinate, and deliver IT projects across engineering, product, and business teams, ensuring on-time, on-budget delivery.

Responsibilities:
- Plan and manage IT project timelines, budgets, and resources
- Coordinate cross-functional teams (engineering, design, QA)
- Identify and mitigate project risks
- Report project status to stakeholders and leadership
- Manage vendor and third-party technical relationships
- Drive process improvements for project delivery

What We're Looking For:
- 4+ years of experience managing IT or software projects
- Strong understanding of Agile/Scrum and Waterfall methodologies
- Experience with project management tools (Jira, MS Project, Asana)
- PMP or similar certification preferred
- Comfortable working in an English-speaking, distributed team

Visa Sponsorship:
Eligible for the Temporary Skill Shortage (subclass 482) visa, with a pathway to permanent residency (186).`,
    requirements: [
      "4+ years of experience managing IT or software projects",
      "Strong understanding of Agile/Scrum and Waterfall methodologies",
      "Experience with project management tools (Jira, MS Project, Asana)",
      "PMP, PRINCE2, or similar certification preferred",
      "Strong stakeholder management and communication skills",
      "Experience managing project budgets and resource allocation",
      "Ability to identify and mitigate technical/project risks",
      "Strong English communication skills for distributed team collaboration",
      "Eligible for ANZSCO 135112 (ICT Project Manager)",
      "Willingness to relocate to Sydney or Melbourne under employer-sponsored visa (subclass 482)",
    ],
    benefits: [
      "Visa sponsorship (subclass 482) with pathway to permanent residency",
      "Competitive salary (AUD 115,000–170,000, based on experience)",
      "Relocation assistance for candidates moving from Japan",
      "Health insurance",
      "Flexible/hybrid working arrangements",
      "Paid annual leave and public holidays (Australian standard)",
    ],
    publish: true,
  },
  {
    jobTitle: "Embedded Systems Engineer",
    companyName: COMPANY_NAME,
    industry: "Information Technology / Embedded Systems",
    jobCategory: "Software Development / Engineering",
    location: "Melbourne, VIC, Australia",
    workMode: "On-site",
    positionType: "Full-time",
    vacancies: 1,
    salaryMin: 110000,
    salaryMax: 175000,
    currency: "AUD",
    targetRegion: "Japan",
    anzscoCode: "263311 / 233411",
    description: `We're hiring an Embedded Systems Engineer to join our hardware-software integration team in Melbourne, with visa sponsorship available for skilled candidates relocating from Japan.

About the Role:
You'll design and develop firmware and embedded software for hardware-connected products, drawing on Japan's strong tradition in precision electronics and manufacturing.

Responsibilities:
- Design and develop firmware for embedded devices
- Write low-level code in C/C++ for microcontrollers
- Debug hardware-software integration issues
- Collaborate with hardware engineers on system design
- Optimize for performance, power consumption, and reliability
- Conduct testing and validation on embedded platforms

What We're Looking For:
- 3+ years of experience in embedded systems or firmware development
- Strong proficiency in C/C++
- Experience with microcontrollers (ARM, STM32, or similar)
- Understanding of RTOS and hardware communication protocols (I2C, SPI, UART)
- Comfortable working in an English-speaking, distributed team

Visa Sponsorship:
Eligible for the Temporary Skill Shortage (subclass 482) visa, with a pathway to permanent residency (186).`,
    requirements: [
      "3+ years of experience in embedded systems or firmware development",
      "Strong proficiency in C/C++",
      "Experience with microcontrollers (ARM, STM32, or similar)",
      "Understanding of RTOS and communication protocols (I2C, SPI, UART)",
      "Experience with hardware debugging tools (oscilloscopes, logic analyzers)",
      "Familiarity with version control and embedded CI/CD practices",
      "Understanding of power optimization for embedded devices",
      "Strong English communication skills for distributed team collaboration",
      "Eligible for ANZSCO 263311 (Telecommunications Engineer) or 233411 (Electronics Engineer)",
      "Willingness to relocate to Melbourne under employer-sponsored visa (subclass 482)",
    ],
    benefits: [
      "Visa sponsorship (subclass 482) with pathway to permanent residency",
      "Competitive salary (AUD 110,000–175,000, based on experience)",
      "Relocation assistance for candidates moving from Japan",
      "Health insurance",
      "Flexible working arrangements",
      "Paid annual leave and public holidays (Australian standard)",
    ],
    publish: true,
  },
  {
    jobTitle: "Frontend Engineer (React Specialist)",
    companyName: COMPANY_NAME,
    industry: "Information Technology / Web Development",
    jobCategory: "Software Development / Engineering",
    location: "Sydney, NSW, Australia",
    workMode: "Hybrid",
    positionType: "Full-time",
    vacancies: 2,
    salaryMin: 95000,
    salaryMax: 155000,
    currency: "AUD",
    targetRegion: "Japan",
    anzscoCode: "261312",
    description: `We're hiring a Frontend Engineer to join our product team in Sydney/Melbourne, with visa sponsorship available for skilled candidates relocating from Japan.

About the Role:
You'll build performant, accessible, and visually polished user interfaces, working closely with designers and backend engineers.

Responsibilities:
- Build responsive, accessible UI components using React/Next.js
- Collaborate with designers to implement pixel-perfect interfaces
- Optimize frontend performance and load times
- Write unit and integration tests for UI components
- Maintain and extend our design system
- Participate in code reviews and technical planning

What We're Looking For:
- 3+ years of experience in frontend development
- Strong proficiency in React, TypeScript, and modern CSS
- Experience with Next.js or similar frameworks
- Understanding of web performance and accessibility best practices
- Comfortable working in an English-speaking, distributed team

Visa Sponsorship:
Eligible for the Temporary Skill Shortage (subclass 482) visa, with a pathway to permanent residency (186).`,
    requirements: [
      "3+ years of experience in frontend development",
      "Strong proficiency in React, TypeScript, and modern CSS",
      "Experience with Next.js or similar frameworks",
      "Understanding of web performance optimization",
      "Experience with accessibility (WCAG) standards",
      "Familiarity with testing tools (Jest, React Testing Library)",
      "Experience working with design systems and component libraries",
      "Strong English communication skills for distributed team collaboration",
      "Eligible for ANZSCO 261312 (Developer Programmer)",
      "Willingness to relocate to Sydney or Melbourne under employer-sponsored visa (subclass 482)",
    ],
    benefits: [
      "Visa sponsorship (subclass 482) with pathway to permanent residency",
      "Competitive salary (AUD 95,000–155,000, based on experience)",
      "Relocation assistance for candidates moving from Japan",
      "Health insurance",
      "Flexible/hybrid working arrangements",
      "Paid annual leave and public holidays (Australian standard)",
    ],
    publish: true,
  },

  // ============================= CHINA ==============================
  {
    jobTitle: "Business Intelligence (BI) Developer",
    companyName: COMPANY_NAME,
    industry: "Information Technology / Data & Analytics",
    jobCategory: "Data & Analytics",
    location: "Melbourne, VIC, Australia",
    workMode: "Hybrid",
    positionType: "Full-time",
    vacancies: 2,
    salaryMin: 95000,
    salaryMax: 150000,
    currency: "AUD",
    targetRegion: "China",
    anzscoCode: "261111 / 224111",
    description: `We're hiring a BI Developer to join our analytics team in Melbourne/Sydney, with a state-nomination visa pathway available for skilled candidates relocating from China.

About the Role:
You'll build dashboards, reports, and data models that give the business clear visibility into performance and trends.

Responsibilities:
- Design and build BI dashboards and reports (Power BI, Tableau)
- Develop and maintain data models for reporting
- Write complex SQL queries to extract and transform data
- Collaborate with business stakeholders to define reporting needs
- Ensure data accuracy and consistency across reports
- Automate recurring reporting processes

What We're Looking For:
- 3+ years of experience in BI development or data analytics
- Strong SQL skills and experience with BI tools (Power BI, Tableau, Looker)
- Understanding of data warehousing concepts
- Strong English business communication skills
- Bachelor's degree in a relevant field

Visa Pathway:
Eligible for 190 (State Nominated) PR pathway, or 482 employer sponsorship.`,
    requirements: [
      "3+ years of experience in BI development or data analytics",
      "Strong SQL skills and experience with BI tools (Power BI, Tableau, or Looker)",
      "Understanding of data warehousing and dimensional modeling",
      "Experience with DAX or similar reporting query languages",
      "Strong attention to data accuracy and detail",
      "Experience automating recurring reports and workflows",
      "Strong English business communication skills",
      "Bachelor's degree in IT, Statistics, Business, or related field",
      "Eligible for ANZSCO 261111 (ICT Business Analyst) or 224111",
      "Willingness to relocate to Melbourne or Sydney under state-nominated visa (subclass 190)",
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
  {
    jobTitle: "Salesforce Developer / Administrator",
    companyName: COMPANY_NAME,
    industry: "Information Technology / CRM & Enterprise Software",
    jobCategory: "Software Development / Engineering",
    location: "Sydney, NSW, Australia",
    workMode: "Hybrid",
    positionType: "Full-time",
    vacancies: 1,
    salaryMin: 100000,
    salaryMax: 160000,
    currency: "AUD",
    targetRegion: "China",
    anzscoCode: "261313 / 261111",
    description: `We're hiring a Salesforce Developer/Administrator to join our enterprise systems team in Sydney/Melbourne, with a strong visa pathway for skilled candidates relocating from China.

About the Role:
You'll customize, configure, and maintain our Salesforce platform, supporting sales, service, and marketing teams with reliable CRM tooling.

Responsibilities:
- Configure and customize Salesforce (Apex, Lightning components)
- Build and maintain workflows, automations, and integrations
- Manage user access, security, and data quality
- Support sales/service teams with CRM troubleshooting
- Integrate Salesforce with third-party systems via APIs
- Document configurations and maintain platform best practices

What We're Looking For:
- 3+ years of experience with Salesforce development or administration
- Proficiency in Apex, Lightning Web Components, and SOQL
- Salesforce certification (Administrator or Platform Developer) preferred
- Experience integrating Salesforce with external systems
- Strong English communication skills

Visa Pathway:
Eligible for 190 (State Nominated) PR pathway, or 482 employer sponsorship.`,
    requirements: [
      "3+ years of experience with Salesforce development or administration",
      "Proficiency in Apex, Lightning Web Components, and SOQL",
      "Salesforce certification (Administrator or Platform Developer I) preferred",
      "Experience with Salesforce integrations via REST/SOAP APIs",
      "Understanding of Salesforce security model and data governance",
      "Experience with Flow Builder and process automation",
      "Strong troubleshooting and stakeholder support skills",
      "Strong English communication skills for distributed team collaboration",
      "Eligible for ANZSCO 261313 (Software Engineer) or 261111",
      "Willingness to relocate to Sydney or Melbourne under state-nominated visa (subclass 190)",
    ],
    benefits: [
      "Visa pathway (190 state-nominated) toward permanent residency, or 482 sponsorship",
      "Competitive salary (AUD 100,000–160,000, based on experience)",
      "Relocation assistance for candidates moving from China",
      "Health insurance",
      "Flexible/hybrid working arrangements",
      "Paid annual leave and public holidays (Australian standard)",
    ],
    publish: true,
  },
  {
    jobTitle: "ERP / SAP Consultant",
    companyName: COMPANY_NAME,
    industry: "Information Technology / Enterprise Systems",
    jobCategory: "IT Consulting",
    location: "Melbourne, VIC, Australia",
    workMode: "Hybrid",
    positionType: "Full-time",
    vacancies: 1,
    salaryMin: 110000,
    salaryMax: 175000,
    currency: "AUD",
    targetRegion: "China",
    anzscoCode: "261111 / 135112",
    description: `We're hiring an ERP/SAP Consultant to support enterprise system implementations in Melbourne/Sydney, with a strong visa pathway for skilled candidates relocating from China.

About the Role:
You'll configure, implement, and support SAP/ERP modules for business clients, ensuring systems align with operational needs.

Responsibilities:
- Configure and implement SAP/ERP modules (FI/CO, MM, SD, or similar)
- Gather business requirements and translate them into system configurations
- Support system testing, training, and go-live activities
- Troubleshoot and resolve ERP system issues
- Collaborate with cross-functional business and IT teams
- Document configurations and maintain system documentation

What We're Looking For:
- 4+ years of experience in ERP/SAP consulting or implementation
- Expertise in one or more SAP modules (FI/CO, MM, SD, or similar)
- Experience with full-cycle ERP implementations
- Strong business process analysis skills
- Strong English communication skills

Visa Pathway:
Eligible for 482 employer sponsorship with pathway to 186, or 190 state nomination.`,
    requirements: [
      "4+ years of experience in ERP/SAP consulting or implementation",
      "Expertise in one or more SAP modules (FI/CO, MM, SD, or similar)",
      "Experience with full lifecycle ERP implementations",
      "Strong business process analysis and requirements-gathering skills",
      "SAP certification in relevant module preferred",
      "Experience with system testing, UAT, and go-live support",
      "Ability to work directly with business stakeholders",
      "Strong English communication skills for distributed team collaboration",
      "Eligible for ANZSCO 261111 (ICT Business Analyst) or 135112",
      "Willingness to relocate to Melbourne or Sydney under employer-sponsored visa (subclass 482)",
    ],
    benefits: [
      "Visa sponsorship (subclass 482) with pathway to permanent residency, or 190 nomination",
      "Competitive salary (AUD 110,000–175,000, based on experience)",
      "Relocation assistance for candidates moving from China",
      "Health insurance",
      "Flexible/hybrid working arrangements",
      "Paid annual leave and public holidays (Australian standard)",
    ],
    publish: true,
  },
  {
    jobTitle: "Database Administrator (DBA)",
    companyName: COMPANY_NAME,
    industry: "Information Technology / Database Management",
    jobCategory: "Software Development / Engineering",
    location: "Sydney, NSW, Australia",
    workMode: "On-site",
    positionType: "Full-time",
    vacancies: 1,
    salaryMin: 105000,
    salaryMax: 165000,
    currency: "AUD",
    targetRegion: "China",
    anzscoCode: "262111",
    description: `We're hiring a Database Administrator to manage and optimize our database infrastructure in Sydney/Melbourne, with a state-nomination visa pathway available for skilled candidates relocating from China.

About the Role:
You'll ensure the performance, reliability, and security of our production databases, supporting engineering teams with a stable data foundation.

Responsibilities:
- Manage and maintain production databases (PostgreSQL, MySQL, or similar)
- Monitor database performance and optimize queries
- Implement backup, recovery, and disaster recovery procedures
- Manage database security, access controls, and compliance
- Plan and execute database migrations and upgrades
- Collaborate with engineering teams on schema design

What We're Looking For:
- 4+ years of experience as a Database Administrator
- Strong expertise in PostgreSQL or MySQL administration
- Experience with backup/recovery and high-availability setups
- Understanding of database security and compliance requirements
- Strong English communication skills

Visa Pathway:
Eligible for 190 (State Nominated) PR pathway, or 482 employer sponsorship.`,
    requirements: [
      "4+ years of experience as a Database Administrator",
      "Strong expertise in PostgreSQL or MySQL administration",
      "Experience with backup, recovery, and disaster recovery procedures",
      "Understanding of database security, access control, and compliance",
      "Experience with performance tuning and query optimization",
      "Familiarity with high-availability and replication setups",
      "Experience with database migration and version upgrades",
      "Strong English communication skills for distributed team collaboration",
      "Eligible for ANZSCO 262111 (Database Administrator)",
      "Willingness to relocate to Sydney or Melbourne under state-nominated visa (subclass 190)",
    ],
    benefits: [
      "Visa pathway (190 state-nominated) toward permanent residency, or 482 sponsorship",
      "Competitive salary (AUD 105,000–165,000, based on experience)",
      "Relocation assistance for candidates moving from China",
      "Health insurance",
      "Flexible working arrangements",
      "Paid annual leave and public holidays (Australian standard)",
    ],
    publish: true,
  },
  {
    jobTitle: "Network Engineer",
    companyName: COMPANY_NAME,
    industry: "Information Technology / Networking",
    jobCategory: "IT Infrastructure",
    location: "Melbourne, VIC, Australia",
    workMode: "On-site",
    positionType: "Full-time",
    vacancies: 2,
    salaryMin: 95000,
    salaryMax: 150000,
    currency: "AUD",
    targetRegion: "China",
    anzscoCode: "263111",
    description: `We're hiring a Network Engineer to maintain and optimize our network infrastructure in Melbourne/Sydney, with a state-nomination visa pathway available for skilled candidates relocating from China.

About the Role:
You'll design, implement, and maintain secure, reliable network infrastructure supporting our offices and production systems.

Responsibilities:
- Design and maintain LAN/WAN network infrastructure
- Configure and manage routers, switches, and firewalls
- Monitor network performance and troubleshoot connectivity issues
- Implement network security best practices
- Support cloud networking (VPC, VPN, load balancers)
- Document network architecture and configurations

What We're Looking For:
- 3+ years of experience in network engineering or administration
- Strong knowledge of routing, switching, and firewall configuration
- Experience with cloud networking (AWS/Azure VPC, VPN)
- Relevant certification preferred (CCNA, CCNP)
- Strong English communication skills

Visa Pathway:
Eligible for 190 (State Nominated) PR pathway, or 482 employer sponsorship.`,
    requirements: [
      "3+ years of experience in network engineering or administration",
      "Strong knowledge of routing, switching, and firewall configuration",
      "Experience with cloud networking (AWS/Azure VPC, VPN, load balancers)",
      "Relevant certification preferred (CCNA, CCNP, or equivalent)",
      "Understanding of network security best practices",
      "Experience with network monitoring tools (SolarWinds, PRTG)",
      "Familiarity with SD-WAN and hybrid network architectures",
      "Strong English communication skills for distributed team collaboration",
      "Eligible for ANZSCO 263111 (Computer Network and Systems Engineer)",
      "Willingness to relocate to Melbourne or Sydney under state-nominated visa (subclass 190)",
    ],
    benefits: [
      "Visa pathway (190 state-nominated) toward permanent residency, or 482 sponsorship",
      "Competitive salary (AUD 95,000–150,000, based on experience)",
      "Relocation assistance for candidates moving from China",
      "Health insurance",
      "Flexible working arrangements",
      "Paid annual leave and public holidays (Australian standard)",
    ],
    publish: true,
  },
];

module.exports = { jobs };
