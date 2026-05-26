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

@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) { }

  // ── Talent endpoints ──────────────────────────────────────────────────────

  @Post('jobs/:id/apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TALENT')
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
  getMyApplications(@Req() req: any) {
    return this.applicationsService.getMyApplications(req.user.id);
  }

  // ── Admin endpoints ───────────────────────────────────────────────────────

  @Get('applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
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
  getApplicationsForJob(@Param('id', ParseUUIDPipe) jobId: string) {
    return this.applicationsService.getApplicationsForJob(jobId);
  }

  @Patch('applications/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
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
