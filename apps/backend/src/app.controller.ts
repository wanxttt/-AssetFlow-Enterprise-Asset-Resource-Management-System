import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getHello(): string {
    return 'AssetFlow ERP API is running';
  }

  @Get('notifications')
  async getNotifications() {
    try {
      const notifs = await this.prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      if (notifs.length > 0) {
        return notifs.map((n) => ({
          id: n.id,
          type: n.type || 'Alerts',
          message: n.message,
          time: 'Recently',
        }));
      }
    } catch {
      // fallback
    }
    return [
      { id: 1, type: 'Alerts', message: 'Asset AF-0201 requires immediate maintenance.', time: '10 mins ago' },
      { id: 2, type: 'Approvals', message: 'Pending transfer request from Priya Shah.', time: '1 hour ago' },
      { id: 3, type: 'Bookings', message: 'Conference Room A booked by Aditi Rao.', time: '2 hours ago' },
      { id: 4, type: 'Alerts', message: '3 assets overdue for return.', time: '1 day ago' },
    ];
  }
}
