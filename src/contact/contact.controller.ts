import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query, UseGuards, Req, Param, Patch } from '@nestjs/common';
import { SpamGuard } from '../common/guards/spam-guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ReplyContactMessageDto } from './dto/reply-contact-message.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(SpamGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 submissions per minute per IP
  @ApiOperation({ summary: 'Submit a contact form message / enquiry' })
  @ApiResponse({ status: 201, description: 'Message saved' })
  @ApiResponse({ status: 403, description: 'Spam detected' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  create(@Body() dto: CreateContactMessageDto) {
    return this.contactService.create(dto);
  }

  @Get('my-messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current user\'s submitted enquiries and replies' })
  @ApiResponse({ status: 200, description: 'List of enquiries submitted by the user' })
  findUserMessages(@Req() req: any) {
    return this.contactService.findUserMessages(req.user.id, req.user.email);
  }

  @Post('direct')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Initiate a direct message thread with a talent (Admin only)' })
  @ApiResponse({ status: 201, description: 'Direct message initiated' })
  initiateDirectMessage(@Req() req: any, @Body() dto: { userId: string; message: string }) {
    return this.contactService.initiateDirectMessage(dto.userId, req.user.id, dto.message);
  }

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Submit a reply / follow-up to a message' })
  @ApiResponse({ status: 201, description: 'Reply added successfully' })
  addReply(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: ReplyContactMessageDto,
  ) {
    return this.contactService.addReply(id, req.user.id, req.user.role, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get a single contact message / enquiry (Admin only)' })
  @ApiResponse({ status: 200, description: 'Single contact message details' })
  findOne(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all contact messages (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Paginated list of contact messages' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.contactService.findAll(
      Number(page || 1),
      Number(limit || 10),
      type,
      status,
      search,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update status or notes of an enquiry (Admin only)' })
  @ApiResponse({ status: 200, description: 'Enquiry updated successfully' })
  updateEnquiry(
    @Param('id') id: string,
    @Body() dto: UpdateEnquiryDto,
  ) {
    return this.contactService.updateEnquiry(id, dto);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mark all replies in a thread as read' })
  @ApiResponse({ status: 200, description: 'Thread marked as read successfully' })
  markThreadAsRead(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.contactService.markThreadAsRead(id, req.user.id, req.user.role);
  }

  @Post(':id/typing')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Trigger typing indicator for a thread' })
  @ApiResponse({ status: 200, description: 'Typing event emitted' })
  triggerTyping(
    @Param('id') id: string,
    @Req() req: any,
    @Body('isTyping') isTyping: boolean,
  ) {
    return this.contactService.triggerTyping(id, req.user.id, req.user.role, isTyping);
  }
}
