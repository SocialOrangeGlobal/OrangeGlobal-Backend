import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateEnquiryDto {
  @ApiProperty({ example: 'CONSULTED', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 'Discussed skilled visa requirements. Action complete.', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
