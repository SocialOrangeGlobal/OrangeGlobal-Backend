import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class SignInDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }: { value: string }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @ApiProperty({ example: 'TALENT', enum: ['TALENT', 'EMPLOYER'] })
  @IsIn(['TALENT', 'EMPLOYER'], { message: 'Role must be TALENT or EMPLOYER' })
  role: 'TALENT' | 'EMPLOYER';
}
