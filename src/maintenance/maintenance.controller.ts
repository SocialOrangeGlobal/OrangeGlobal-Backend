import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';

@ApiTags('Maintenance')
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) { }

  @Delete('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset System (DEVELOPMENT ONLY)',
    description: 'Wipes all data from the database and clears all Supabase storage buckets (resumes, profile pictures, logos). This action is irreversible.'
  })
  @ApiResponse({ status: 200, description: 'System reset successfully.' })
  @ApiResponse({ status: 500, description: 'Internal server error during reset.' })
  async resetAll() {
    return this.maintenanceService.resetAll();
  }
}
