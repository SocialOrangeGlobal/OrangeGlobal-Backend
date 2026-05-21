import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EducationDto, ExperienceDto } from '../../auth/dto/signup-talent.dto';

export class UpdateProfileDto {
  // Talent Fields
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'Lagos, Nigeria' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'Sydney' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'New South Wales' })
  @IsOptional()
  @IsString()
  state?: string;

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

  @ApiPropertyOptional({ example: 'https://storage.example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'https://storage.example.com/resume.pdf' })
  @IsOptional()
  @IsString()
  resumeUrl?: string;

  // Additional Talent Details
  @ApiPropertyOptional({ description: '[Section 1: Personal Info] Date of Birth (YYYY-MM-DD)', example: '1995-05-15' })
  @IsOptional()
  @IsString()
  dob?: string;

  @ApiPropertyOptional({ description: '[Section 1: Personal Info] Current Age', example: '31' })
  @IsOptional()
  @IsString()
  age?: string;

  @ApiPropertyOptional({ description: '[Section 1: Personal Info] Gender (Male, Female, Other)', example: 'Male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: '[Section 1: Personal Info] Nationality', example: 'Indian' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ description: '[Section 1: Personal Info] Current Country of Residence', example: 'United Arab Emirates' })
  @IsOptional()
  @IsString()
  countryOfResidence?: string;

  @ApiPropertyOptional({ description: '[Section 1: Personal Info] WhatsApp Contact Number', example: '+971 50 000 0000' })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiPropertyOptional({ description: '[Section 1: Personal Info] LinkedIn Profile URL', example: 'https://linkedin.com/in/johndoe' })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiPropertyOptional({ description: '[Section 2: Job Preferences] Preferred Opportunity Type', example: 'Full-Time Onsite' })
  @IsOptional()
  @IsString()
  opportunityType?: string;

  @ApiPropertyOptional({ description: '[Section 2: Job Preferences] Preferred Industry Sector', example: 'IT' })
  @IsOptional()
  @IsString()
  preferredIndustry?: string;

  @ApiPropertyOptional({ description: '[Section 2: Job Preferences] Preferred Role/Position', example: 'Senior Software Engineer' })
  @IsOptional()
  @IsString()
  preferredRole?: string;

  @ApiPropertyOptional({ description: '[Section 2: Job Preferences] Expected Salary (AUD / Year)', example: '$120,000' })
  @IsOptional()
  @IsString()
  preferredSalary?: string;

  @ApiPropertyOptional({ description: '[Section 2: Job Preferences] Preferred Start Date', example: 'Immediately' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Current/Recent Job Title for Talent, or Professional Job Title for Employer', example: 'Software Engineer' })
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

  @ApiPropertyOptional({ description: '[Section 4: Education] Highest Academic Qualification', example: 'Bachelor\'s Degree' })
  @IsOptional()
  @IsString()
  highestQualification?: string;

  @ApiPropertyOptional({ description: '[Section 4: Education] Field of Study', example: 'Computer Science' })
  @IsOptional()
  @IsString()
  fieldOfStudy?: string;

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

  @ApiPropertyOptional({ description: '[Section 6: Visa & Work Rights] Current Visa / Residency Status', example: 'Employment Pass' })
  @IsOptional()
  @IsString()
  visaStatus?: string;

  @ApiPropertyOptional({ description: '[Section 6: Visa & Work Rights] Legal Work Rights (e.g. Require Sponsorship)', example: 'Require Sponsorship' })
  @IsOptional()
  @IsString()
  legalWorkRights?: string;

  @ApiPropertyOptional({ description: '[Section 7: Relocation & Background] Open to Relocation?', example: 'Yes' })
  @IsOptional()
  @IsString()
  openToRelocation?: string;

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

  @ApiPropertyOptional({ description: '[Section 7: Relocation & Background] Relocating Alone or with Family?', example: 'Alone' })
  @IsOptional()
  @IsString()
  relocateAloneOrFamily?: string;

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

  @ApiPropertyOptional({ description: '[Section 8: Documents] Passport Bio Page Document URL', example: 'https://supabase.co/storage/v1/object/public/documents/passport.pdf' })
  @IsOptional()
  @IsString()
  passportUrl?: string;

  @ApiPropertyOptional({ description: '[Section 8: Documents] Visa/Residency Permit Document URL', example: 'https://supabase.co/storage/v1/object/public/documents/visa.pdf' })
  @IsOptional()
  @IsString()
  visaUrl?: string;

  @ApiPropertyOptional({ description: '[Section 8: Documents] Educational Certificates Document URL', example: 'https://supabase.co/storage/v1/object/public/documents/edu_certs.pdf' })
  @IsOptional()
  @IsString()
  eduCertUrl?: string;

  @ApiPropertyOptional({ description: '[Section 8: Documents] Employment / Experience Letters Document URL', example: 'https://supabase.co/storage/v1/object/public/documents/emp_letters.pdf' })
  @IsOptional()
  @IsString()
  empCertUrl?: string;

  @ApiPropertyOptional({ description: '[Section 8: Documents] English Test Results Document URL', example: 'https://supabase.co/storage/v1/object/public/documents/english_test.pdf' })
  @IsOptional()
  @IsString()
  englishTestUrl?: string;

  @ApiPropertyOptional({ description: '[Section 8: Documents] Professional License Document URL', example: 'https://supabase.co/storage/v1/object/public/documents/licence.pdf' })
  @IsOptional()
  @IsString()
  licenceUrl?: string;

  @ApiPropertyOptional({ description: '[Section 9: Declaration] I declare all information is true', example: 'Yes' })
  @IsOptional()
  @IsString()
  declarationTrue?: string;

  @ApiPropertyOptional({ description: '[Section 9: Declaration] I consent to data processing for job placements', example: 'Yes' })
  @IsOptional()
  @IsString()
  declarationConsent?: string;

  // Employer Fields
  @ApiPropertyOptional({ example: 'Jane' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Smith' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '+1 555 000 0000' })
  @IsOptional()
  @IsString()
  businessPhone?: string;

  @ApiPropertyOptional({ example: 'Acme Corp' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: 'Backend Developer' })
  @IsOptional()
  @IsString()
  jobTitleToHire?: string;

  @ApiPropertyOptional({ example: '10001' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({ example: 'Full-time' })
  @IsOptional()
  @IsString()
  positionType?: string;

  @ApiPropertyOptional({ example: 'https://storage.example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  companyLogo?: string;

  // Admin Fields
  @ApiPropertyOptional({ example: 'Super Administrator' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'https://facebook.com/orangeglobal' })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiPropertyOptional({ example: 'https://twitter.com/orangeglobal' })
  @IsOptional()
  @IsString()
  twitter?: string;

  @ApiPropertyOptional({ example: 'https://instagram.com/orangeglobal' })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({ example: 'Australia' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'Melbourne, Victoria' })
  @IsOptional()
  @IsString()
  cityState?: string;

  @ApiPropertyOptional({ example: '3000' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ example: 'TAX987654' })
  @IsOptional()
  @IsString()
  taxId?: string;
}
