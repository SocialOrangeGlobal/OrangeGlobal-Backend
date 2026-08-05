import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class EducationDto {
  @ApiProperty({ example: 'Harvard University' })
  @IsString()
  @IsNotEmpty()
  school: string;

  @ApiProperty({ example: 'Master of Science' })
  @IsString()
  @IsNotEmpty()
  degree: string;

  @ApiProperty({ example: '2022' })
  @IsString()
  @IsNotEmpty()
  year: string;
}

export class ExperienceDto {
  @ApiProperty({ example: 'Senior Developer' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Tech Global' })
  @IsString()
  @IsNotEmpty()
  company: string;

  @ApiProperty({ example: 'Led a team of 5 engineers...' })
  @IsString()
  responsibilities: string;
}

export class SignUpTalentDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }: { value: string }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72) // bcrypt hard limit
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiPropertyOptional({ example: 'Lagos, Nigeria' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: '+234 800 0000000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ type: [EducationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationDto)
  educations?: EducationDto[];

  @ApiPropertyOptional({ example: ['React', 'Node.js'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ type: [ExperienceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experiences?: ExperienceDto[];

  @ApiPropertyOptional({ example: 'https://storage.example.com/resume.pdf' })
  @IsOptional()
  @IsString()
  @Matches(/^$|\.(pdf|doc|docx)(\?.*)?$/i, { message: 'resumeUrl must be a valid document URL (.pdf, .doc, .docx)' })
  resumeUrl?: string;

  @ApiPropertyOptional({ example: 'https://storage.example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  @Matches(/^$|\.(jpg|jpeg|png|webp)(\?.*)?$/i, { message: 'avatarUrl must be a valid image URL (.jpg, .jpeg, .png, .webp)' })
  avatarUrl?: string;

  // ─── SECTION 1: PERSONAL INFORMATION ──────────────────────────────────────────
  @ApiProperty({ description: '[Section 1: Personal Info] Date of Birth (YYYY-MM-DD)', example: '1995-05-15' })
  @IsString()
  @IsNotEmpty()
  dob: string;

  @ApiPropertyOptional({ description: '[Section 1: Personal Info] Current Age', example: '31' })
  @IsOptional()
  @IsString()
  age?: string;

  @ApiPropertyOptional({ description: '[Section 1: Personal Info] Gender (Male, Female, Other)', example: 'Male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ description: '[Section 1: Personal Info] Nationality', example: 'Indian' })
  @IsString()
  @IsNotEmpty()
  nationality: string;

  @ApiProperty({ description: '[Section 1: Personal Info] Current Country of Residence', example: 'United Arab Emirates' })
  @IsString()
  @IsNotEmpty()
  countryOfResidence: string;

  @ApiPropertyOptional({ description: '[Section 1: Personal Info] WhatsApp Contact Number', example: '+971 50 000 0000' })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiPropertyOptional({ description: '[Section 1: Personal Info] LinkedIn Profile URL', example: 'https://linkedin.com/in/johndoe' })
  @IsOptional()
  @IsString()
  linkedin?: string;

  // ─── SECTION 2: JOB PREFERENCES ──────────────────────────────────────────────
  @ApiProperty({ description: '[Section 2: Job Preferences] Preferred Opportunity Type', example: 'Full-Time Onsite' })
  @IsString()
  @IsNotEmpty()
  opportunityType: string;

  @ApiProperty({ description: '[Section 2: Job Preferences] Preferred Industry Sector', example: 'IT' })
  @IsString()
  @IsNotEmpty()
  preferredIndustry: string;

  @ApiProperty({ description: '[Section 2: Job Preferences] Preferred Role/Position', example: 'Senior Software Engineer' })
  @IsString()
  @IsNotEmpty()
  preferredRole: string;

  @ApiPropertyOptional({ description: '[Section 2: Job Preferences] Expected Salary (AUD / Year)', example: '$120,000' })
  @IsOptional()
  @IsString()
  preferredSalary?: string;

  @ApiPropertyOptional({ description: '[Section 2: Job Preferences] Preferred Start Date', example: 'Immediately' })
  @IsOptional()
  @IsString()
  startDate?: string;

  // ─── SECTION 3: EMPLOYMENT HISTORY ────────────────────────────────────────────
  @ApiPropertyOptional({ description: '[Section 3: Employment] Current/Recent Job Title', example: 'Software Engineer' })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional({ description: '[Section 3: Employment] Current/Recent Employer Name', example: 'Acme Corp' })
  @IsOptional()
  @IsString()
  employerName?: string;

  @ApiPropertyOptional({ description: '[Section 3: Employment] Country of Employment', example: 'India' })
  @IsOptional()
  @IsString()
  employmentCountry?: string;

  @ApiPropertyOptional({ description: '[Section 3: Employment] Total Work Experience (years)', example: '8' })
  @IsOptional()
  @IsString()
  totalExp?: string;

  @ApiPropertyOptional({ description: '[Section 3: Employment] Relevant Work Experience in nominated role (years)', example: '6' })
  @IsOptional()
  @IsString()
  relevantExp?: string;

  @ApiPropertyOptional({ description: '[Section 3: Employment] Professional summary or key accomplishments', example: 'Experienced web developer specialized in scalable microservices...' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: '[Section 3: Employment] Currently employed?', example: 'Yes' })
  @IsOptional()
  @IsString()
  isEmployed?: string;

  @ApiPropertyOptional({ description: '[Section 3: Employment] Have you worked overseas before?', example: 'Yes' })
  @IsOptional()
  @IsString()
  workedOverseas?: string;

  @ApiPropertyOptional({ description: '[Section 3: Employment] List of overseas countries worked in', example: 'Singapore, UK' })
  @IsOptional()
  @IsString()
  overseasCountries?: string;

  // ─── SECTION 4: EDUCATION & CERTIFICATIONS ───────────────────────────────────
  @ApiProperty({ description: '[Section 4: Education] Highest Academic Qualification', example: 'Bachelor\'s Degree' })
  @IsString()
  @IsNotEmpty()
  highestQualification: string;

  @ApiProperty({ description: '[Section 4: Education] Field of Study', example: 'Computer Science' })
  @IsString()
  @IsNotEmpty()
  fieldOfStudy: string;

  @ApiPropertyOptional({ description: '[Section 4: Education] Institution Name', example: 'Stanford University' })
  @IsOptional()
  @IsString()
  institutionName?: string;

  @ApiPropertyOptional({ description: '[Section 4: Education] Year of Graduation', example: '2018' })
  @IsOptional()
  @IsString()
  graduationYear?: string;

  @ApiPropertyOptional({ description: '[Section 4: Education] Do you hold any professional licenses or trade certs?', example: 'Yes' })
  @IsOptional()
  @IsString()
  hasLicences?: string;

  @ApiPropertyOptional({ description: '[Section 4: Education] List of licences/certifications', example: 'AWS Certified Solutions Architect' })
  @IsOptional()
  @IsString()
  licencesList?: string;

  // ─── SECTION 5: LANGUAGE PROFICIENCY ──────────────────────────────────────────
  @ApiPropertyOptional({ description: '[Section 5: Language] Taken any English language tests?', example: 'IELTS' })
  @IsOptional()
  @IsString()
  englishTest?: string;

  @ApiPropertyOptional({ description: '[Section 5: Language] Overall Score', example: '8.0' })
  @IsOptional()
  @IsString()
  overallScore?: string;

  @ApiPropertyOptional({ description: '[Section 5: Language] Test Date', example: '2025-01-10' })
  @IsOptional()
  @IsString()
  testDate?: string;

  // ─── SECTION 6: VISA & WORK RIGHTS ────────────────────────────────────────────
  @ApiProperty({ description: '[Section 6: Visa & Work Rights] Current Visa / Residency Status', example: 'Employment Pass' })
  @IsString()
  @IsNotEmpty()
  visaStatus: string;

  @ApiPropertyOptional({ description: '[Section 6: Visa & Work Rights] Legal Work Rights (e.g. Require Sponsorship)', example: 'Require Sponsorship' })
  @IsOptional()
  @IsString()
  legalWorkRights?: string;

  // ─── SECTION 7: RELOCATION & BACKGROUND ───────────────────────────────────────
  @ApiProperty({ description: '[Section 7: Relocation & Background] Open to Relocation?', example: 'Yes' })
  @IsString()
  @IsNotEmpty()
  openToRelocation: string;

  @ApiPropertyOptional({ description: '[Section 7: Relocation & Background] Have you previously applied for an Australian Visa?', example: 'Yes' })
  @IsOptional()
  @IsString()
  appliedAusVisa?: string;

  @ApiPropertyOptional({ description: '[Section 7: Relocation & Background] Visa Type previously applied for', example: '482 Temporary Skill Shortage' })
  @IsOptional()
  @IsString()
  visaTypeApplied?: string;

  @ApiPropertyOptional({ description: '[Section 7: Relocation & Background] Have you ever had a visa refusal?', example: 'No' })
  @IsOptional()
  @IsString()
  visaRefusal?: string;

  @ApiPropertyOptional({ description: '[Section 7: Relocation & Background] Details of visa refusal (if applicable)', example: 'None' })
  @IsOptional()
  @IsString()
  visaRefusalDetails?: string;

  @ApiProperty({ description: '[Section 7: Relocation & Background] Relocating Alone or with Family?', example: 'Alone' })
  @IsString()
  @IsNotEmpty()
  relocateAloneOrFamily: string;

  @ApiPropertyOptional({ description: '[Section 7: Relocation & Background] Do you hold a valid passport?', example: 'Yes' })
  @IsOptional()
  @IsString()
  validPassport?: string;

  @ApiPropertyOptional({ description: '[Section 7: Relocation & Background] Passport Expiry Date', example: '2030-05-15' })
  @IsOptional()
  @IsString()
  passportExpiry?: string;

  @ApiPropertyOptional({ description: '[Section 7: Relocation & Background] Willing to undergo medical/background checks?', example: 'Yes' })
  @IsOptional()
  @IsString()
  medicalBackgroundCheck?: string;

  @ApiPropertyOptional({ description: '[Section 7: Relocation & Background] Do you have any criminal convictions?', example: 'No' })
  @IsOptional()
  @IsString()
  criminalConvictions?: string;

  @ApiPropertyOptional({ description: '[Section 7: Relocation & Background] Details of criminal convictions (if applicable)', example: 'None' })
  @IsOptional()
  @IsString()
  criminalDetails?: string;

  // ─── SECTION 8: DOCUMENTS ─────────────────────────────────────────────────────
  @ApiPropertyOptional({ description: '[Section 8: Documents] Passport Bio Page Document URL', example: 'https://supabase.co/storage/v1/object/public/documents/passport.pdf' })
  @IsOptional()
  @IsString()
  @Matches(/^$|\.(pdf|jpg|jpeg|png|doc|docx)(\?.*)?$/i, { message: 'passportUrl must be a valid document/image URL (.pdf, .jpg, .png, .doc, .docx)' })
  passportUrl?: string;

  @ApiPropertyOptional({ description: '[Section 8: Documents] Visa/Residency Permit Document URL', example: 'https://supabase.co/storage/v1/object/public/documents/visa.pdf' })
  @IsOptional()
  @IsString()
  @Matches(/^$|\.(pdf|jpg|jpeg|png|doc|docx)(\?.*)?$/i, { message: 'visaUrl must be a valid document/image URL (.pdf, .jpg, .png, .doc, .docx)' })
  visaUrl?: string;

  @ApiProperty({ description: '[Section 8: Documents] Educational Certificates Document URL', example: 'https://supabase.co/storage/v1/object/public/documents/edu_certs.pdf' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^$|\.(pdf|jpg|jpeg|png|doc|docx)(\?.*)?$/i, { message: 'eduCertUrl must be a valid document/image URL (.pdf, .jpg, .png, .doc, .docx)' })
  eduCertUrl: string;

  @ApiProperty({ description: '[Section 8: Documents] Employment / Experience Letters Document URL', example: 'https://supabase.co/storage/v1/object/public/documents/emp_letters.pdf' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^$|\.(pdf|jpg|jpeg|png|doc|docx)(\?.*)?$/i, { message: 'empCertUrl must be a valid document/image URL (.pdf, .jpg, .png, .doc, .docx)' })
  empCertUrl: string;

  @ApiPropertyOptional({ description: '[Section 8: Documents] English Test Results Document URL', example: 'https://supabase.co/storage/v1/object/public/documents/english_test.pdf' })
  @IsOptional()
  @IsString()
  @Matches(/^$|\.(pdf|jpg|jpeg|png|doc|docx)(\?.*)?$/i, { message: 'englishTestUrl must be a valid document/image URL (.pdf, .jpg, .png, .doc, .docx)' })
  englishTestUrl?: string;

  @ApiPropertyOptional({ description: '[Section 8: Documents] Professional License Document URL', example: 'https://supabase.co/storage/v1/object/public/documents/licence.pdf' })
  @IsOptional()
  @IsString()
  @Matches(/^$|\.(pdf|jpg|jpeg|png|doc|docx)(\?.*)?$/i, { message: 'licenceUrl must be a valid document/image URL (.pdf, .jpg, .png, .doc, .docx)' })
  licenceUrl?: string;

  @ApiPropertyOptional({ description: '[Section 8: Documents] Financial Statement Document URL', example: 'https://supabase.co/storage/v1/object/public/documents/financial_statement.pdf' })
  @IsOptional()
  @IsString()
  @Matches(/^$|\.(pdf|jpg|jpeg|png|doc|docx)(\?.*)?$/i, { message: 'bankStatementUrl must be a valid document/image URL (.pdf, .jpg, .png, .doc, .docx)' })
  bankStatementUrl?: string;

  @Matches(/^$|\.(pdf|jpg|jpeg|png|doc|docx)(\?.*)?$/i, { message: 'taxDocumentUrl must be a valid document/image URL (.pdf, .jpg, .png, .doc, .docx)' })
  taxDocumentUrl?: string;

  @Matches(/^$|\.(pdf|jpg|jpeg|png|doc|docx)(\?.*)?$/i, { message: 'paySlipUrl must be a valid document/image URL (.pdf, .jpg, .png, .doc, .docx)' })
  paySlipUrl?: string;

  // ─── SECTION 9: DECLARATION ───────────────────────────────────────────────────
  @ApiProperty({ description: '[Section 9: Declaration] I declare all information is true', example: 'Yes' })
  @IsString()
  @IsNotEmpty()
  declarationTrue: string;

  @ApiProperty({ description: '[Section 9: Declaration] I consent to data processing for job placements', example: 'Yes' })
  @IsString()
  @IsNotEmpty()
  declarationConsent: string;
}
