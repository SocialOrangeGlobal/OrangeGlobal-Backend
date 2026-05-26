import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
import { SignInDto } from './dto/signin.dto';
import { SignUpTalentDto } from './dto/signup-talent.dto';
import { SignUpEmployerDto } from './dto/signup-employer.dto';
import { AuthenticatedUser } from './decorators/current-user.decorator';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

const BCRYPT_ROUNDS = 12;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends TokenPair {
  user: {
    id: string;
    email: string;
    role: UserRole;
    fullName?: string;
    avatarUrl?: string;
  };
  message: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) { }

  // ─── Sign Up: Talent ──────────────────────────────────────────────────────

  async signUpTalent(dto: SignUpTalentDto): Promise<AuthResult> {
    await this.assertEmailNotTaken(dto.email);

    try {
      const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

      const user = await this.prisma.$transaction(async (tx) => {
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const newUser = await tx.user.create({
          data: {
            email: dto.email,
            passwordHash,
            role: UserRole.TALENT,
            emailVerificationToken: verificationToken,
            emailVerificationExpires: verificationExpires,
          },
        });

        await tx.talentProfile.create({
          data: {
            userId: newUser.id,
            fullName: dto.fullName,
            workEmail: dto.email,
            location: dto.location
              ? {
                city: dto.location.split(',')[0]?.trim() || '',
                country: dto.location.split(',')[1]?.trim() || ''
              }
              : undefined,
            phone: dto.phone ?? null,
            educations: (dto.educations as any) ?? [],
            skills: dto.skills ?? [],
            experiences: (dto.experiences as any) ?? [],
            resumeUrl: dto.resumeUrl ?? null,
            avatarUrl: dto.avatarUrl ?? null,
            dob: dto.dob ?? null,
            age: dto.age ?? null,
            gender: dto.gender ?? null,
            nationality: dto.nationality ?? null,
            countryOfResidence: dto.countryOfResidence ?? null,
            whatsapp: dto.whatsapp ?? null,
            linkedin: dto.linkedin ?? null,
            opportunityType: dto.opportunityType ?? null,
            preferredIndustry: dto.preferredIndustry ?? null,
            preferredRole: dto.preferredRole ?? null,
            preferredSalary: dto.preferredSalary ?? null,
            startDate: dto.startDate ?? null,
            jobTitle: dto.jobTitle ?? null,
            employerName: dto.employerName ?? null,
            employmentCountry: dto.employmentCountry ?? null,
            totalExp: dto.totalExp ?? null,
            relevantExp: dto.relevantExp ?? null,
            summary: dto.summary ?? null,
            isEmployed: dto.isEmployed ?? null,
            workedOverseas: dto.workedOverseas ?? null,
            overseasCountries: dto.overseasCountries ?? null,
            highestQualification: dto.highestQualification ?? null,
            fieldOfStudy: dto.fieldOfStudy ?? null,
            institutionName: dto.institutionName ?? null,
            graduationYear: dto.graduationYear ?? null,
            hasLicences: dto.hasLicences ?? null,
            licencesList: dto.licencesList ?? null,
            englishTest: dto.englishTest ?? null,
            overallScore: dto.overallScore ?? null,
            testDate: dto.testDate ?? null,
            visaStatus: dto.visaStatus ?? null,
            legalWorkRights: dto.legalWorkRights ?? null,
            openToRelocation: dto.openToRelocation ?? null,
            appliedAusVisa: dto.appliedAusVisa ?? null,
            visaTypeApplied: dto.visaTypeApplied ?? null,
            visaRefusal: dto.visaRefusal ?? null,
            visaRefusalDetails: dto.visaRefusalDetails ?? null,
            relocateAloneOrFamily: dto.relocateAloneOrFamily ?? null,
            validPassport: dto.validPassport ?? null,
            passportExpiry: dto.passportExpiry ?? null,
            medicalBackgroundCheck: dto.medicalBackgroundCheck ?? null,
            criminalConvictions: dto.criminalConvictions ?? null,
            criminalDetails: dto.criminalDetails ?? null,
            passportUrl: dto.passportUrl ?? null,
            visaUrl: dto.visaUrl ?? null,
            eduCertUrl: dto.eduCertUrl ?? null,
            empCertUrl: dto.empCertUrl ?? null,
            englishTestUrl: dto.englishTestUrl ?? null,
            licenceUrl: dto.licenceUrl ?? null,
            declarationTrue: dto.declarationTrue ?? null,
            declarationConsent: dto.declarationConsent ?? null,
          },
        });

        return { newUser, verificationToken };
      });

      const tokens = await this.generateTokens(user.newUser);
      await this.storeRefreshTokenHash(user.newUser.id, tokens.refreshToken);

      // Send verification email asynchronously
      this.mailService.sendVerificationEmail(user.newUser.email, user.verificationToken).catch(err => {
        this.logger.error(`Failed to send verification email to ${user.newUser.email}: ${err.message}`);
      });

      this.logger.log(`New TALENT registered: ${user.newUser.email}`);

      return {
        ...tokens,
        user: { id: user.newUser.id, email: user.newUser.email, role: user.newUser.role },
        message: 'Talent account created successfully. Please verify your email.',
      };
    } catch (err) {
      this.logger.error(`Failed to register talent: ${err.message}`);
      throw err;
    }
  }

  // ─── Sign Up: Employer ────────────────────────────────────────────────────

  async signUpEmployer(dto: SignUpEmployerDto): Promise<AuthResult> {
    await this.assertEmailNotTaken(dto.email);

    try {
      const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

      const user = await this.prisma.$transaction(async (tx) => {
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const newUser = await tx.user.create({
          data: {
            email: dto.email,
            passwordHash,
            role: UserRole.EMPLOYER,
            emailVerificationToken: verificationToken,
            emailVerificationExpires: verificationExpires,
          },
        });

        await tx.employerProfile.create({
          data: {
            userId: newUser.id,
            firstName: dto.firstName,
            lastName: dto.lastName,
            businessEmail: dto.email,
            businessPhone: dto.businessPhone ?? null,
            companyName: dto.companyName,
            jobTitle: dto.jobTitle ?? null,
            jobTitleToHire: dto.jobTitleToHire ?? null,
            zipCode: dto.zipCode ?? null,
            positionType: dto.positionType ?? null,
            companyLogo: dto.companyLogo ?? null,
          },
        });

        return { newUser, verificationToken };
      });

      const tokens = await this.generateTokens(user.newUser);
      await this.storeRefreshTokenHash(user.newUser.id, tokens.refreshToken);

      // Send verification email asynchronously
      this.mailService.sendVerificationEmail(user.newUser.email, user.verificationToken).catch(err => {
        this.logger.error(`Failed to send verification email to ${user.newUser.email}: ${err.message}`);
      });

      this.logger.log(`New EMPLOYER registered: ${user.newUser.email}`);

      return {
        ...tokens,
        user: { id: user.newUser.id, email: user.newUser.email, role: user.newUser.role },
        message: 'Employer account created successfully. Please verify your email.',
      };
    } catch (err) {
      this.logger.error(`Failed to register employer: ${err.message}`);
      throw err;
    }
  }

  // ─── Sign In ──────────────────────────────────────────────────────────────

  async signIn(dto: SignInDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
      include: {
        talentProfile: true,
        employerProfile: true,
        adminProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role !== dto.role) {
      if (user.role === UserRole.ADMIN) {
        throw new ForbiddenException('Please log in via the Admin Panel.');
      } else if (dto.role === UserRole.ADMIN) {
        throw new ForbiddenException('You are not authorized to access the Admin Panel.');
      } else {
        throw new ForbiddenException(`Please log in as ${user.role.charAt(0) + user.role.slice(1).toLowerCase()}.`);
      }
    }



    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before signing in. Check your inbox for the verification link.',
      );
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    this.logger.log(`User signed in: ${user.email} (${user.role})`);

    let fullName = '';
    let avatarUrl = '';
    if (user.role === UserRole.TALENT && user.talentProfile) {
      fullName = user.talentProfile.fullName || '';
      avatarUrl = user.talentProfile.avatarUrl || '';
    } else if (user.role === UserRole.EMPLOYER && user.employerProfile) {
      fullName = [user.employerProfile.firstName, user.employerProfile.lastName].filter(Boolean).join(' ');
      avatarUrl = user.employerProfile.companyLogo || '';
    } else if (user.role === UserRole.ADMIN) {
      fullName = [user.adminProfile?.firstName, user.adminProfile?.lastName].filter(Boolean).join(' ');
      avatarUrl = user.adminProfile?.avatarUrl || '';
    }

    return {
      ...tokens,
      user: { id: user.id, email: user.email, role: user.role, fullName, avatarUrl },
      message: 'Sign in successful',
    };
  }

  // ─── Refresh Tokens ───────────────────────────────────────────────────────

  async refreshTokens(currentUser: AuthenticatedUser): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
      include: {
        talentProfile: true,
        employerProfile: true,
      },
    });

    if (!user || !user.refreshTokenHash || !currentUser.refreshToken) {
      throw new ForbiddenException('Access denied');
    }

    const tokenMatches = await bcrypt.compare(
      currentUser.refreshToken,
      user.refreshTokenHash,
    );

    if (!tokenMatches) {
      throw new ForbiddenException('Access denied — token mismatch');
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    let fullName = '';
    let avatarUrl = '';
    if (user.role === UserRole.TALENT && user.talentProfile) {
      fullName = user.talentProfile.fullName || '';
      avatarUrl = user.talentProfile.avatarUrl || '';
    } else if (user.role === UserRole.EMPLOYER && user.employerProfile) {
      fullName = [user.employerProfile.firstName, user.employerProfile.lastName].filter(Boolean).join(' ');
      avatarUrl = user.employerProfile.companyLogo || '';
    } else if (user.role === UserRole.ADMIN) {
      fullName = 'Administrator';
      avatarUrl = '';
    }

    return {
      ...tokens,
      user: { id: user.id, email: user.email, role: user.role, fullName, avatarUrl },
      message: 'Tokens refreshed successfully',
    };
  }

  // ─── Sign Out ─────────────────────────────────────────────────────────────

  async signOut(userId: string): Promise<{ message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
    this.logger.log(`User signed out: ${userId}`);
    return { message: 'Signed out successfully' };
  }

  // ─── Email Verification ───────────────────────────────────────────────────

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid verification token');
    }

    if (user.isEmailVerified) {
      return { message: 'Email is already verified. You can now sign in.' };
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      throw new UnauthorizedException('Verification token has expired. Please request a new one.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        // Retain emailVerificationToken so subsequent clicks or StrictMode double-triggers return success gracefully
      },
    });

    this.logger.log(`Email verified for user: ${user.email}`);
    return { message: 'Email verified successfully. You can now sign in.' };
  }

  async resendVerification(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.isEmailVerified) {
      return { message: 'Email is already verified' };
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    await this.mailService.sendVerificationEmail(user.email, verificationToken);

    return { message: 'Verification email resent' };
  }

  // ─── Password Reset ────────────────────────────────────────────────────────

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal if user exists for security
      return { message: 'If an account with that email exists, we have sent a reset link.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If an account with that email exists, we have sent a reset link.' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    this.logger.log(`Password reset for user: ${user.email}`);
    return { message: 'Password has been reset successfully' };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async assertEmailNotTaken(email: string): Promise<void> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException(
        'An account with this email already exists',
      );
    }
  }

  private async generateTokens(user: User): Promise<TokenPair> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessExpiry = user.role === UserRole.ADMIN
      ? '7d'
      : this.config.get<string>('jwt.accessExpiry');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('jwt.accessSecret')!,
        expiresIn: accessExpiry as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('jwt.refreshSecret')!,
        expiresIn: this.config.get<string>('jwt.refreshExpiry') as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshTokenHash(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    });
  }
}
