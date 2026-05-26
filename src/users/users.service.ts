import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole, TalentProfile, EmployerProfile, AdminProfile } from '@prisma/client';

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
              orderBy: { uploadedAt: 'desc' },
            },
          },
        },
        employerProfile: true,
        adminProfile: true,
      },
    }) as any;

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
    } else if (user.role === UserRole.ADMIN) {
      if (!user.adminProfile) {
        user.adminProfile = await this.prisma.adminProfile.create({
          data: {
            userId: user.id,
            firstName: 'Orange',
            lastName: 'Global',
          },
        });
      }
      fullName = [user.adminProfile.firstName, user.adminProfile.lastName].filter(Boolean).join(' ');
      avatarUrl = user.adminProfile.avatarUrl || '';
      const p = user.adminProfile;
      if (p.firstName && p.lastName) profileScore += 20;
      if (p.phone) profileScore += 20;
      if (p.bio) profileScore += 20;
      if (p.avatarUrl) profileScore += 20;
      if (p.country && p.cityState) profileScore += 20;
    }

    const profileData = user.role === UserRole.TALENT
      ? (user.talentProfile ? { ...user.talentProfile, profileScore } : null)
      : user.role === UserRole.EMPLOYER
        ? (user.employerProfile ? { ...user.employerProfile, profileScore } : null)
        : (user.adminProfile ? { ...user.adminProfile, profileScore } : null);

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
        city,
        state,
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

      let locationJson: any = undefined;
      if (city !== undefined || state !== undefined || countryOfResidence !== undefined) {
        locationJson = {
          city: city || '',
          state: state || '',
          country: countryOfResidence || '',
        };
      } else if (location && typeof location === 'string') {
        const parts = location.split(',');
        locationJson = {
          city: parts[0]?.trim() || '',
          state: '',
          country: parts[1]?.trim() || '',
        };
      } else if (location && typeof location === 'object') {
        locationJson = location;
      }

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
    } else if (user.role === UserRole.EMPLOYER) {
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
    } else if (user.role === UserRole.ADMIN) {
      const {
        firstName,
        lastName,
        phone,
        bio,
        avatarUrl,
        facebook,
        twitter,
        linkedin,
        instagram,
        country,
        cityState,
        postalCode,
        taxId,
      } = dto;

      return this.prisma.adminProfile.upsert({
        where: { userId },
        create: {
          userId,
          firstName: firstName || '',
          lastName: lastName || '',
          phone,
          bio,
          avatarUrl,
          facebook,
          twitter,
          linkedin,
          instagram,
          country,
          cityState,
          postalCode,
          taxId,
        },
        update: {
          firstName,
          lastName,
          phone,
          bio,
          avatarUrl,
          facebook,
          twitter,
          linkedin,
          instagram,
          country,
          cityState,
          postalCode,
          taxId,
        },
      });
    } else {
      throw new BadRequestException('Invalid user role');
    }
  }

  async addResume(userId: string, dto: { fileName: string; fileUrl: string; isDefault?: boolean }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { talentProfile: true },
    }) as any;

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
        atsBaseScore: atsScore,
      },
    });
  }

  async setDefaultResume(userId: string, resumeId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { talentProfile: true },
    }) as any;

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
    }) as any;

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
        orderBy: { uploadedAt: 'desc' },
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

  async findAllTalents(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { workEmail: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.talentProfile.count({ where }),
      this.prisma.talentProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              isActive: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      items,
    };
  }

  async findAllEmployers(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { businessEmail: { contains: search, mode: 'insensitive' } },
        { businessPhone: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.employerProfile.count({ where }),
      this.prisma.employerProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              isActive: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      items,
    };
  }

  async findOneUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        talentProfile: true,
        employerProfile: true,
        adminProfile: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const { passwordHash, refreshTokenHash, ...safeUser } = user;
    return safeUser;
  }

  async adminUpdateUser(id: string, dto: any) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        talentProfile: true,
        employerProfile: true,
      },
    }) as any;

    if (!user) throw new NotFoundException('User not found');

    const { email, isActive, profileData } = dto;

    // Update User
    await this.prisma.user.update({
      where: { id },
      data: {
        email: email !== undefined ? email : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    if (user.role === UserRole.TALENT && profileData) {
      let locationJson: any = undefined;
      if (profileData.city !== undefined || profileData.state !== undefined || profileData.countryOfResidence !== undefined) {
        locationJson = {
          city: profileData.city || '',
          state: profileData.state || '',
          country: profileData.countryOfResidence || '',
        };
      } else if (typeof profileData.location === 'string' && profileData.location) {
        locationJson = {
          city: profileData.location.split(',')[0]?.trim() || '',
          country: profileData.location.split(',')[1]?.trim() || '',
        };
      } else if (profileData.location && typeof profileData.location === 'object') {
        locationJson = profileData.location;
      }

      // Strip out internal read-only keys, plus transient/virtual fields
      const {
        id: _tId,
        userId: _uId,
        createdAt: _cAt,
        updatedAt: _uAt,
        resumes: _res,
        user: _usr,
        state: _state,
        city: _city,
        location: _loc,
        ...fieldsToUpdate } = profileData;

      // Handle skills array formatting if received as a comma-separated string
      if (typeof fieldsToUpdate.skills === 'string') {
        fieldsToUpdate.skills = fieldsToUpdate.skills
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);
      }

      await this.prisma.talentProfile.update({
        where: { userId: id },
        data: {
          ...fieldsToUpdate,
          location: locationJson !== undefined ? locationJson : undefined,
        },
      });
    } else if (user.role === UserRole.EMPLOYER && profileData) {
      // Strip out internal read-only keys
      const { id: _eId, userId: _uId, createdAt: _cAt, updatedAt: _uAt, user: _usr, ...fieldsToUpdate } = profileData;

      await this.prisma.employerProfile.update({
        where: { userId: id },
        data: {
          ...fieldsToUpdate,
        },
      });
    }

    return this.findOneUser(id);
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.delete({ where: { id } });
    return { success: true, message: 'User deleted successfully' };
  }
}
