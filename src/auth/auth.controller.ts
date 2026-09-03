import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Query,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpTalentDto } from './dto/signup-talent.dto';
import { SignUpEmployerDto } from './dto/signup-employer.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser, AuthenticatedUser } from './decorators/current-user.decorator';
import { ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto/password-reset.dto';
import { SpamGuard } from '../common/guards/spam-guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // ─── POST /auth/signup/talent ─────────────────────────────────────────────
  @Post('signup/talent')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(SpamGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 signups per minute per IP
  @ApiOperation({ summary: 'Register a new Talent account' })
  @ApiResponse({ status: 201, description: 'Talent registered successfully' })
  @ApiResponse({ status: 403, description: 'Spam detected' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @ApiResponse({ status: 422, description: 'Validation error' })
  signUpTalent(@Body() dto: SignUpTalentDto) {
    return this.authService.signUpTalent(dto);
  }

  // ─── POST /auth/signup/employer ───────────────────────────────────────────
  @Post('signup/employer')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(SpamGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 signups per minute per IP
  @ApiOperation({ summary: 'Register a new Employer account' })
  @ApiResponse({ status: 201, description: 'Employer registered successfully' })
  @ApiResponse({ status: 403, description: 'Spam detected' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @ApiResponse({ status: 422, description: 'Validation error' })
  signUpEmployer(@Body() dto: SignUpEmployerDto) {
    return this.authService.signUpEmployer(dto);
  }

  // ─── POST /auth/signin ────────────────────────────────────────────────────
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute per IP (brute-force defense)
  @ApiOperation({ summary: 'Sign in as Talent or Employer' })
  @ApiResponse({ status: 200, description: 'Sign in successful — returns access + refresh tokens' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  // ─── POST /auth/refresh ───────────────────────────────────────────────────
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Rotate refresh token — returns a new token pair' })
  @ApiResponse({ status: 200, description: 'New token pair issued' })
  @ApiResponse({ status: 403, description: 'Invalid or expired refresh token' })
  refresh(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.refreshTokens(user);
  }

  // ─── POST /auth/signout ───────────────────────────────────────────────────
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Sign out — invalidates the refresh token' })
  @ApiResponse({ status: 200, description: 'Signed out successfully' })
  signOut(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.signOut(user.id);
  }

  // ─── POST /auth/forgot-password ───────────────────────────────────────────
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 2, ttl: 60000 } }) // 2 requests per minute per IP
  @ApiOperation({ summary: 'Request password reset link' })
  @ApiResponse({ status: 200, description: 'Reset link sent if email exists' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  // ─── POST /auth/reset-password ────────────────────────────────────────────
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  // ─── GET /auth/verify-email ───────────────────────────────────────────────
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email using token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  verifyEmail(@Query() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  // ─── POST /auth/resend-verification ────────────────────────────────────────
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  resendVerification(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.resendVerification(user.id);
  }
}
