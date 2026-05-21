import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class AdminUpdateUserDto {
  @ApiPropertyOptional({ example: 'talent@orangeglobal.co' })
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  profileData?: any;
}
