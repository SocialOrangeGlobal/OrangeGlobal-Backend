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
  resumeUrl?: string;

  @ApiPropertyOptional({ example: 'https://storage.example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
