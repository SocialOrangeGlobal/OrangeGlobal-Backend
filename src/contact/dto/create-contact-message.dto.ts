import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, IsOptional, Matches, IsIn, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateContactMessageDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
  @Matches(/^[\p{L}\p{M}' \-\.]+$/u, {
    message: 'Full name may only contain letters, spaces, hyphens, apostrophes, and dots',
  })
  fullName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(254, { message: 'Email must not exceed 254 characters' })
  @Transform(({ value }: { value: string }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: '+919876543210', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Phone number must not exceed 20 characters' })
  @Matches(/^[+\d\s\-()]*$/, { message: 'Phone must only contain digits, spaces, dashes, and parentheses' })
  phone?: string;

  @ApiProperty({ example: 'General Inquiry' })
  @IsString()
  @MinLength(1, { message: 'Subject is required' })
  @MaxLength(255, { message: 'Subject must not exceed 255 characters' })
  subject: string;

  @ApiProperty({ example: 'I am interested in your talent acquisition services.' })
  @IsString()
  @MinLength(10, { message: 'Message must be at least 10 characters' })
  @MaxLength(5000, { message: 'Message must not exceed 5000 characters' })
  message: string;

  @ApiProperty({ example: 'GENERAL_QUERY', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['GENERAL_QUERY', 'NEWSLETTER', 'CONSULTATION', 'DIRECT_MESSAGE'], {
    message: 'Type must be one of: GENERAL_QUERY, NEWSLETTER, CONSULTATION, DIRECT_MESSAGE',
  })
  type?: string;

  @ApiProperty({ example: 'user-uuid-here', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  // ─── Honeypot & Anti-Bot Fields (stripped by SpamGuard before reaching service) ──

  @ApiProperty({ required: false, description: 'Honeypot field — must be empty' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ required: false, description: 'Form load timestamp for bot detection' })
  @IsOptional()
  @IsNumber()
  _formLoadedAt?: number;
}

