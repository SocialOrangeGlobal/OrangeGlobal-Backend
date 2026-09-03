import { Controller, Delete, HttpCode, HttpStatus, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ConfigService } from '@nestjs/config';

@ApiTags('Maintenance')
@ApiBearerAuth('access-token')
@Controller('maintenance')
export class MaintenanceController {
  constructor(
    private readonly maintenanceService: MaintenanceService,
    private readonly config: ConfigService,
  ) { }

  @Delete('reset')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset System (DEVELOPMENT ADMIN ONLY)',
    description: 'Wipes all data from the database and clears all Supabase storage buckets (resumes, profile pictures, logos). This action is irreversible.'
  })
  @ApiResponse({ status: 200, description: 'System reset successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden in production.' })
  @ApiResponse({ status: 500, description: 'Internal server error during reset.' })
  async resetAll() {
    const isProduction = this.config.get<string>('env') === 'production';
    if (isProduction) {
      throw new ForbiddenException('System reset is disabled in production environments.');
    }
    return this.maintenanceService.resetAll();
  }
}
