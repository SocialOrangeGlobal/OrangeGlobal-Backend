import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { Throttle } from '@nestjs/throttler';
import { ChatbotService } from './chatbot.service';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';

export class ChatbotQueryDto {
  @ApiProperty({ example: 'Show me remote tech jobs', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message: string;

  /** Client-generated UUID used to maintain per-conversation session history */
  @ApiProperty({ example: 'a1b2c3d4-...', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  sessionId?: string;
}

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 queries per minute per IP
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Send a message to the Orange AI Chatbot' })
  @ApiResponse({ status: 200, description: 'AI chatbot text reply' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async queryChatbot(@Body() dto: ChatbotQueryDto, @Req() req: any) {
    const userId    = req.user?.id || req.user?.userId;
    const sessionId = dto.sessionId;

    const reply = await this.chatbotService.getAIResponse(
      dto.message,
      userId,
      sessionId,
    );

    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: { reply },
    };
  }
}
