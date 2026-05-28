import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AtsService } from '../ats/ats.service';
import { ApplicationStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

const STATUS_MESSAGES: Record<string, string> = {
  APPLIED: 'Your application has been received.',
  UNDER_REVIEW: 'Your application is under review.',
  SHORTLISTED: '🎉 Congratulations! You have been shortlisted.',
  INTERVIEW_SCHEDULED: '📅 Your interview has been scheduled. Please check your email for details.',
  INTERVIEW_COMPLETED: 'Your interview has been completed.',
  OFFER_SENT: '🎊 Great news! An offer has been sent to you.',
  OFFER_ACCEPTED: 'Your offer acceptance has been confirmed.',
  OFFER_REJECTED: 'Your offer has been declined.',
  REJECTED: 'Thank you for applying. Unfortunately, your application was not successful this time.',
  WITHDRAWN: 'Your application has been withdrawn.',
};

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private atsService: AtsService,
    private eventEmitter: EventEmitter2,
  ) {}

  async applyForJob(
    userId: string,
    jobId: string,
    resumeId: string,
    coverLetter?: string,
  ) {
    const talentProfile = await this.prisma.talentProfile.findUnique({
      where: { userId },
    });

    if (!talentProfile) {
      throw new BadRequestException('Talent profile not found');
    }

    const existingApp = await this.prisma.application.findUnique({
      where: {
        jobId_talentId: {
          jobId,
          talentId: talentProfile.id,
        },
      },
    });

    if (existingApp) {
      throw new BadRequestException('You have already applied for this job');
    }

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });

    const application = await this.prisma.application.create({
      data: {
        talentId: talentProfile.id,
        jobId,
        resumeId,
        coverLetter,
        status: ApplicationStatus.APPLIED,
      },
    });

    // Trigger ATS processing asynchronously
    this.atsService.processApplication(application.id).catch(console.error);

    // Notify all admins about the new application
    const adminUsers = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    for (const admin of adminUsers) {
      this.eventEmitter.emit('notification.send', {
        userId: admin.id,
        title: 'New Job Application',
        message: `${talentProfile.fullName} applied for "${job?.title ?? 'a job'}". Review the application now.`,
        type: 'NEW_APPLICATION',
        link: `/jobs/${jobId}/applications`,
      });
    }

    // Confirm receipt to the talent
    this.eventEmitter.emit('notification.send', {
      userId,
      title: 'Application Submitted',
      message: `Your application for "${job?.title ?? 'the job'}" has been submitted successfully!`,
      type: 'APPLICATION_UPDATE',
      link: '/talent-dashboard',
    });

    return application;
  }

  async getMyApplications(userId: string) {
    const talentProfile = await this.prisma.talentProfile.findUnique({
      where: { userId },
    });

    if (!talentProfile) return [];

    return this.prisma.application.findMany({
      where: { talentId: talentProfile.id },
      include: {
        job: true,
        resume: true,
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  // Admin routes
  async getAllApplications(
    page = 1,
    limit = 10,
    search?: string,
    status?: string,
  ) {
    const where: any = {};
    if (search) {
      where.OR = [
        {
          talent: {
            user: { fullName: { contains: search, mode: 'insensitive' } },
          },
        },
        {
          talent: {
            user: { email: { contains: search, mode: 'insensitive' } },
          },
        },
        { job: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (status && status !== 'all') {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          job: true,
          talent: {
            include: { user: true },
          },
          resume: true,
        },
        orderBy: [{ appliedAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getApplicationsForJob(jobId: string) {
    return this.prisma.application.findMany({
      where: { jobId },
      include: {
        job: true,
        talent: {
          include: { user: true },
        },
        resume: true,
      },
      orderBy: [{ atsScore: 'desc' }, { appliedAt: 'desc' }],
    });
  }

  async updateApplicationStatus(
    id: string,
    status: ApplicationStatus,
    adminId: string,
    note?: string,
    extraData?: {
      interviewDate?: string;
      interviewType?: string;
      interviewLink?: string;
      interviewNotes?: string;
      offerDetails?: string;
      adminNotes?: string;
    },
  ) {
    const app = await this.prisma.application.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('Application not found');

    const updateData: any = { status };

    if (status === 'INTERVIEW_SCHEDULED' && extraData) {
      if (extraData.interviewDate)
        updateData.interviewDate = new Date(extraData.interviewDate);
      if (extraData.interviewType !== undefined)
        updateData.interviewType = extraData.interviewType;
      if (extraData.interviewLink !== undefined)
        updateData.interviewLink = extraData.interviewLink;
      if (extraData.interviewNotes !== undefined)
        updateData.interviewNotes = extraData.interviewNotes;
    }

    if (status === 'OFFER_SENT' && extraData?.offerDetails) {
      updateData.offerDetails = extraData.offerDetails;
      updateData.offerSentAt = new Date();
    }

    if (extraData?.adminNotes) {
      updateData.adminNotes = extraData.adminNotes;
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: updateData,
    });

    await this.prisma.applicationStatusHistory.create({
      data: {
        applicationId: id,
        fromStatus: app.status,
        toStatus: status,
        changedBy: adminId,
        note,
      },
    });

    const [job, talentProfile] = await Promise.all([
      this.prisma.job.findUnique({ where: { id: app.jobId } }),
      this.prisma.talentProfile.findUnique({ where: { id: app.talentId } }),
    ]);

    if (talentProfile) {
      const statusMsg =
        STATUS_MESSAGES[status] ??
        `Your application status is now: ${status.replace(/_/g, ' ')}.`;

      this.eventEmitter.emit('notification.send', {
        userId: talentProfile.userId,
        title: `Application Update – ${job?.title ?? 'Job'}`,
        message: statusMsg,
        type: 'APPLICATION_UPDATE',
        link: '/talent-dashboard',
      });
    }

    return updated;
  }
}
