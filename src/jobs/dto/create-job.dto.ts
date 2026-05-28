import { IsString, IsOptional, IsBoolean, IsInt, IsArray, Min, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({ example: 'Senior Frontend Developer', description: 'The title of the job' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Orange Global', description: 'The name of the hiring company' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  company: string;

  @ApiPropertyOptional({ example: 'Technology', description: 'The industry sector' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @ApiProperty({ example: 'Engineering', description: 'The job category' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category: string;

  @ApiProperty({ example: 'New York, NY', description: 'The location of the job' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location: string;

  @ApiProperty({ example: 'Remote', description: 'The work mode (e.g., Remote, On-site, Hybrid)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  mode: string;

  @ApiProperty({ example: 'Full-time', description: 'The employment type (e.g., Full-time, Contract)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type: string;

  @ApiPropertyOptional({ example: '$120,000 - $150,000', description: 'Salary range or fixed amount' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  salary?: string;

  @ApiPropertyOptional({ example: 1, description: 'Number of open vacancies' })
  @IsOptional()
  @IsInt()
  @Min(1)
  vacancies?: number;

  @ApiProperty({ example: 'We are looking for an experienced developer...', description: 'Detailed job description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: ['5+ years React', 'TypeScript expertise'], description: 'List of requirements' })
  @IsOptional()
  @IsArray()
  requirements?: string[];

  @ApiPropertyOptional({ example: ['Health Insurance', '401k'], description: 'List of benefits' })
  @IsOptional()
  @IsArray()
  benefits?: string[];

  @ApiPropertyOptional({ example: true, description: 'Whether the job is currently published' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg', description: 'URL of the company logo' })
  @IsOptional()
  @IsString()
  companyLogo?: string;
}
