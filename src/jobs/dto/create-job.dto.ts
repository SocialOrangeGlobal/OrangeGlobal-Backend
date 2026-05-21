import { IsString, IsOptional, IsBoolean, IsInt, IsArray, Min, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  company: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  mode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  salary?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  vacancies?: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsArray()
  requirements?: string[];

  @IsOptional()
  @IsArray()
  benefits?: string[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
