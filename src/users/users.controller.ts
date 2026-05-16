import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('me')
  @ApiOperation({ summary: 'Get the current authenticated user with their profile' })
  @ApiResponse({ status: 200, description: 'Current user + profile data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findMe(user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Post('resumes')
  @ApiOperation({ summary: 'Add a new resume (max 5)' })
  @ApiResponse({ status: 201, description: 'Resume added successfully' })
  addResume(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: { fileName: string; fileUrl: string; isDefault?: boolean },
  ) {
    return this.usersService.addResume(user.id, dto);
  }

  @Patch('resumes/:id/default')
  @ApiOperation({ summary: 'Set a resume as default' })
  @ApiResponse({ status: 200, description: 'Default resume set successfully' })
  setDefaultResume(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') resumeId: string,
  ) {
    return this.usersService.setDefaultResume(user.id, resumeId);
  }

  @Delete('resumes/:id')
  @ApiOperation({ summary: 'Delete a resume' })
  @ApiResponse({ status: 200, description: 'Resume deleted successfully' })
  deleteResume(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') resumeId: string,
  ) {
    return this.usersService.deleteResume(user.id, resumeId);
  }
}
