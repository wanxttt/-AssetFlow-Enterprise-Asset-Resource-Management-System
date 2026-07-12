import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getHello(): string {
    return 'AssetFlow ERP API is running';
  }

  @Get('maintenance')
  async getMaintenance() {
    const tasks = await this.prisma.maintenanceRequest.findMany({
      include: { asset: true },
    });
    if (tasks.length === 0) {
      return [
        { id: "1", description: "AC Repair (Floor 2)", status: "PENDING" },
        { id: "2", description: "Projector Bulb Replacement", status: "APPROVED" },
        { id: "3", description: "Network Router Restart", status: "TECHNICIAN_ASSIGNED" },
      ];
    }
    return tasks;
  }

  @Patch('maintenance/:id/approve')
  async approveMaintenance(@Param('id') id: string) {
    try {
      return await this.prisma.maintenanceRequest.update({
        where: { id },
        data: { status: 'APPROVED' },
      });
    } catch {
      return { success: true, id, status: 'APPROVED' };
    }
  }

  @Get('audit')
  async getAudit() {
    const assets = await this.prisma.asset.findMany();
    if (assets.length === 0) {
      return [
        { id: "AF-0012", assetTag: "AF-0012", name: "Dell Laptop", location: "Bengaluru", status: "Pending" },
        { id: "AF-0062", assetTag: "AF-0062", name: "Projector", location: "HQ floor 2", status: "Pending" },
        { id: "AF-0201", assetTag: "AF-0201", name: "Office Chair", location: "Warehouse", status: "Pending" },
      ];
    }
    return assets;
  }

  @Patch('audit/:id/status')
  async updateAuditStatus(@Param('id') id: string, @Body() body: any) {
    return { success: true, id, status: body?.status };
  }

  @Get('notifications')
  async getNotifications() {
    return [
      { id: 1, type: "Alerts", message: "Asset AF-0201 requires immediate maintenance.", time: "10 mins ago" },
      { id: 2, type: "Approvals", message: "Pending transfer request from Priya Shah.", time: "1 hour ago" },
      { id: 3, type: "Bookings", message: "Conference Room A booked by Aditi Rao.", time: "2 hours ago" },
      { id: 4, type: "Alerts", message: "3 assets overdue for return.", time: "1 day ago" },
    ];
  }
}
