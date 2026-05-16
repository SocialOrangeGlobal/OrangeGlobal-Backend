import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class SignUpEmployerDto {
  @ApiProperty({ example: 'john@company.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }: { value: string }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({ example: '+1 (555) 000-0000' })
  @IsOptional()
  @IsString()
  businessPhone?: string;

  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  companyName: string;

  @ApiPropertyOptional({ example: 'Hiring Manager' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  jobTitle?: string;

  @ApiPropertyOptional({ example: 'Senior Backend Developer' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  jobTitleToHire?: string;

  @ApiPropertyOptional({ example: '10001' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipCode?: string;

  @ApiPropertyOptional({ example: 'Full-time' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  positionType?: string;

  @ApiPropertyOptional({ example: 'https://storage.example.com/logo.jpg' })
  @IsOptional()
  @IsString()
  companyLogo?: string;
}
