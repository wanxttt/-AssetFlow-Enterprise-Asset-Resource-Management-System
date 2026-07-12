import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('audit')
@UseGuards(RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async findAllAssets() {
    return this.auditService.findAllAssetsForAudit();
  }

  @Get('cycles')
  async findCycles() {
    return this.auditService.findAuditCycles();
  }

  @Post('cycle')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  async createCycle(@Body() body: { name: string }) {
    return this.auditService.createAuditCycle(body.name || 'Q3 Audit Cycle');
  }

  @Post('discrepancy')
  async createDiscrepancy(
    @Body()
    body: {
      auditCycleId: string;
      assetId: string;
      discrepancyType: string;
      notes: string;
    },
  ) {
    return this.auditService.createDiscrepancyReport(body);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.auditService.updateAssetAuditStatus(id, body?.status || 'GOOD');
  }

  @Post('close')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  async closeActiveCycle() {
    return this.auditService.closeAuditCycle();
  }

  @Post('cycles/:id/close')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  async closeCycleById(@Param('id') id: string) {
    return this.auditService.closeAuditCycle(id);
  }
}
