import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'The refresh token issued at sign-in' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
