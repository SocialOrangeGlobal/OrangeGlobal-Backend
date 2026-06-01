import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ReplyContactMessageDto {
  @ApiProperty({ example: 'Thank you for your query. Yes, we can schedule a meeting.' })
  @IsString()
  @IsNotEmpty({ message: 'Reply message cannot be empty' })
  message: string;
}
