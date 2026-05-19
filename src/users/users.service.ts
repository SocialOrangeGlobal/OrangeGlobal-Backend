import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole, TalentProfile, EmployerProfile } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        talentProfile: {
          include: {
            resumes: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        employerProfile: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, refreshTokenHash, ...safeUser } = user;

    let fullName = '';
    let avatarUrl = '';
    let profileScore = 0;

    if (user.role === UserRole.TALENT && user.talentProfile) {
      fullName = user.talentProfile.fullName || '';
      avatarUrl = user.talentProfile.avatarUrl || '';
      const p = user.talentProfile;
      if (p.fullName) profileScore += 15;
      if (p.workEmail) profileScore += 15;
      if (p.phone) profileScore += 15;
      if (p.location) profileScore += 15;
      if (p.avatarUrl) profileScore += 10;
      if (p.skills && p.skills.length > 0) profileScore += 10;
      if (p.educations && (p.educations as any[]).length > 0) profileScore += 10;
      if (p.experiences && (p.experiences as any[]).length > 0) profileScore += 10;
    } else if (user.role === UserRole.EMPLOYER && user.employerProfile) {
      fullName = [user.employerProfile.firstName, user.employerProfile.lastName].filter(Boolean).join(' ');
      avatarUrl = user.employerProfile.companyLogo || '';
      const p = user.employerProfile;
      if (p.firstName && p.lastName) profileScore += 20;
      if (p.businessEmail) profileScore += 20;
      if (p.companyName) profileScore += 20;
      if (p.businessPhone) profileScore += 15;
      if (p.companyLogo) profileScore += 15;
      if (p.jobTitle) profileScore += 10;
    }

    const profileData = user.role === UserRole.TALENT
      ? (user.talentProfile ? { ...user.talentProfile, profileScore } : null)
      : (user.employerProfile ? { ...user.employerProfile, profileScore } : null);

    return {
      id: safeUser.id,
      email: safeUser.email,
      role: safeUser.role,
      fullName,
      avatarUrl,
      isEmailVerified: safeUser.isEmailVerified,
      createdAt: safeUser.createdAt,
      profile: profileData,
    };
  }

  async updateProfile(userId: string, dto: any) {
    const user = await this.findById(userId);

    if (user.role === UserRole.TALENT) {
      const {
        fullName,
        location,
        phone,
        educations,
        skills,
        experiences,
        resumeUrl,
        avatarUrl,
        dob,
        age,
        gender,
        nationality,
        countryOfResidence,
        whatsapp,
        linkedin,
        opportunityType,
        preferredIndustry,
        preferredRole,
        preferredSalary,
        startDate,
        jobTitle,
        employerName,
        employmentCountry,
        totalExp,
        relevantExp,
        summary,
        isEmployed,
        workedOverseas,
        overseasCountries,
        highestQualification,
        fieldOfStudy,
        institutionName,
        graduationYear,
        hasLicences,
        licencesList,
        englishTest,
        overallScore,
        testDate,
        visaStatus,
        legalWorkRights,
        openToRelocation,
        appliedAusVisa,
        visaTypeApplied,
        visaRefusal,
        visaRefusalDetails,
        relocateAloneOrFamily,
        validPassport,
        passportExpiry,
        medicalBackgroundCheck,
        criminalConvictions,
        criminalDetails,
        passportUrl,
        visaUrl,
        eduCertUrl,
        empCertUrl,
        englishTestUrl,
        licenceUrl,
        declarationTrue,
        declarationConsent,
      } = dto;

      const locationJson = location
        ? {
          city: location.split(',')[0]?.trim() || '',
          country: location.split(',')[1]?.trim() || '',
        }
        : undefined;

      return this.prisma.talentProfile.update({
        where: { userId },
        data: {
          fullName,
          location: locationJson as any,
          phone,
          educations: educations as any,
          skills,
          experiences: experiences as any,
          resumeUrl,
          avatarUrl,
          dob,
          age,
          gender,
          nationality,
          countryOfResidence,
          whatsapp,
          linkedin,
          opportunityType,
          preferredIndustry,
          preferredRole,
          preferredSalary,
          startDate,
          jobTitle,
          employerName,
          employmentCountry,
          totalExp,
          relevantExp,
          summary,
          isEmployed,
          workedOverseas,
          overseasCountries,
          highestQualification,
          fieldOfStudy,
          institutionName,
          graduationYear,
          hasLicences,
          licencesList,
          englishTest,
          overallScore,
          testDate,
          visaStatus,
          legalWorkRights,
          openToRelocation,
          appliedAusVisa,
          visaTypeApplied,
          visaRefusal,
          visaRefusalDetails,
          relocateAloneOrFamily,
          validPassport,
          passportExpiry,
          medicalBackgroundCheck,
          criminalConvictions,
          criminalDetails,
          passportUrl,
          visaUrl,
          eduCertUrl,
          empCertUrl,
          englishTestUrl,
          licenceUrl,
          declarationTrue,
          declarationConsent,
        },
      });
    } else {
      const {
        firstName,
        lastName,
        businessPhone,
        companyName,
        jobTitle,
        jobTitleToHire,
        zipCode,
        positionType,
        companyLogo,
      } = dto;

      return this.prisma.employerProfile.update({
        where: { userId },
        data: {
          firstName,
          lastName,
          businessPhone,
          companyName,
          jobTitle,
          jobTitleToHire,
          zipCode,
          positionType,
          companyLogo,
        },
      });
    }
  }

  async addResume(userId: string, dto: { fileName: string; fileUrl: string; isDefault?: boolean }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { talentProfile: true },
    });

    if (!user || user.role !== UserRole.TALENT || !user.talentProfile) {
      throw new BadRequestException('Only talent users can upload resumes');
    }

    const talentId = user.talentProfile.id;

    const count = await this.prisma.resume.count({ where: { talentId } });
    if (count >= 5) {
      throw new BadRequestException('Maximum 5 resumes allowed. Please delete an existing resume first.');
    }

    const isFirst = count === 0;
    const makeDefault = dto.isDefault || isFirst;

    if (makeDefault) {
      await this.prisma.resume.updateMany({
        where: { talentId },
        data: { isDefault: false },
      });
      await this.prisma.talentProfile.update({
        where: { id: talentId },
        data: { resumeUrl: dto.fileUrl },
      });
    }

    const atsScore = Math.floor(Math.random() * 15) + 82; // 82 - 96

    return this.prisma.resume.create({
      data: {
        talentId,
        fileName: dto.fileName,
        fileUrl: dto.fileUrl,
        isDefault: makeDefault,
        atsScore,
      },
    });
  }

  async setDefaultResume(userId: string, resumeId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { talentProfile: true },
    });

    if (!user || user.role !== UserRole.TALENT || !user.talentProfile) {
      throw new BadRequestException('Only talent users can manage resumes');
    }

    const talentId = user.talentProfile.id;

    const resume = await this.prisma.resume.findFirst({
      where: { id: resumeId, talentId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    await this.prisma.resume.updateMany({
      where: { talentId },
      data: { isDefault: false },
    });

    await this.prisma.resume.update({
      where: { id: resumeId },
      data: { isDefault: true },
    });

    await this.prisma.talentProfile.update({
      where: { id: talentId },
      data: { resumeUrl: resume.fileUrl },
    });

    return { message: 'Default resume updated successfully' };
  }

  async deleteResume(userId: string, resumeId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { talentProfile: true },
    });

    if (!user || user.role !== UserRole.TALENT || !user.talentProfile) {
      throw new BadRequestException('Only talent users can manage resumes');
    }

    const talentId = user.talentProfile.id;

    const resume = await this.prisma.resume.findFirst({
      where: { id: resumeId, talentId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    await this.prisma.resume.delete({
      where: { id: resumeId },
    });

    if (resume.isDefault) {
      const remaining = await this.prisma.resume.findFirst({
        where: { talentId },
        orderBy: { createdAt: 'desc' },
      });

      if (remaining) {
        await this.prisma.resume.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
        await this.prisma.talentProfile.update({
          where: { id: talentId },
          data: { resumeUrl: remaining.fileUrl },
        });
      } else {
        await this.prisma.talentProfile.update({
          where: { id: talentId },
          data: { resumeUrl: null },
        });
      }
    }

    return { message: 'Resume deleted successfully' };
  }
}
