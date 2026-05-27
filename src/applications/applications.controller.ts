import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApplicationStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Applications')
@ApiBearerAuth('access-token')
@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) { }

  // ── Talent endpoints ──────────────────────────────────────────────────────

  @Post('jobs/:id/apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TALENT')
  @ApiOperation({ summary: 'Apply for a job (Talent only)' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiBody({ schema: { type: 'object', properties: { resumeId: { type: 'string' }, coverLetter: { type: 'string' } }, required: ['resumeId'] } })
  @ApiResponse({ status: 201, description: 'Application submitted successfully' })
  @ApiResponse({ status: 400, description: 'Already applied or missing requirements' })
  applyForJob(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) jobId: string,
    @Body('resumeId', ParseUUIDPipe) resumeId: string,
    @Body('coverLetter') coverLetter?: string,
  ) {
    return this.applicationsService.applyForJob(req.user.id, jobId, resumeId, coverLetter);
  }

  @Get('talent/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TALENT')
  @ApiOperation({ summary: 'Get current talent applications' })
  @ApiResponse({ status: 200, description: 'List of applications for the logged-in talent' })
  getMyApplications(@Req() req: any) {
    return this.applicationsService.getMyApplications(req.user.id);
  }

  // ── Admin endpoints ───────────────────────────────────────────────────────

  @Get('applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all applications (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by ApplicationStatus' })
  @ApiResponse({ status: 200, description: 'Paginated list of all applications' })
  getAllApplications(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.applicationsService.getAllApplications(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search,
      status
    );
  }

  @Get('jobs/:id/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get applications for a specific job (Admin only)' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'List of applications for the specified job' })
  getApplicationsForJob(@Param('id', ParseUUIDPipe) jobId: string) {
    return this.applicationsService.getApplicationsForJob(jobId);
  }

  @Patch('applications/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update application status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        status: { type: 'string' }, 
        note: { type: 'string' }, 
        interviewDate: { type: 'string' }, 
        interviewType: { type: 'string' }, 
        interviewLink: { type: 'string' }, 
        interviewNotes: { type: 'string' }, 
        offerDetails: { type: 'string' }, 
        adminNotes: { type: 'string' } 
      }, 
      required: ['status'] 
    } 
  })
  @ApiResponse({ status: 200, description: 'Application status updated' })
  updateApplicationStatus(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ApplicationStatus,
    @Body('note') note?: string,
    @Body('interviewDate') interviewDate?: string,
    @Body('interviewType') interviewType?: string,
    @Body('interviewLink') interviewLink?: string,
    @Body('interviewNotes') interviewNotes?: string,
    @Body('offerDetails') offerDetails?: string,
    @Body('adminNotes') adminNotes?: string,
  ) {
    return this.applicationsService.updateApplicationStatus(
      id,
      status,
      req.user.id,
      note,
      { interviewDate, interviewType, interviewLink, interviewNotes, offerDetails, adminNotes }
    );
  }
}
