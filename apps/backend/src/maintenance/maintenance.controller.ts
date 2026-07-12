import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, MaintenanceStatus } from '@prisma/client';

@Controller('maintenance')
@UseGuards(RolesGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  async findAll() {
    const tasks = await this.maintenanceService.findAll();
    return tasks.map((t) => ({
      id: t.id,
      description:
        t.description || `Maintenance on ${t.asset?.name || 'Asset'}`,
      status: t.status,
      asset: t.asset,
      priority: t.priority,
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Post()
  async create(
    @Body()
    body: {
      assetId: string;
      description: string;
      priority?: string;
      requesterId?: string;
    },
  ) {
    return this.maintenanceService.createRequest(body);
  }

  /**
   * Protected by RBAC: Only Asset Manager or Admin can approve maintenance requests
   */
  @Patch(':id/approve')
  @Roles(Role.ASSET_MANAGER, Role.ADMIN)
  async approve(@Param('id') id: string) {
    return this.maintenanceService.approveRequest(id);
  }

  /**
   * Transition Maintenance Status atomically
   */
  @Patch(':id/status')
  @Roles(Role.ASSET_MANAGER, Role.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: MaintenanceStatus },
  ) {
    return this.maintenanceService.updateStatus(id, body.status);
  }
}
