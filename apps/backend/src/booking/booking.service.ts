import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.booking.findMany({
      include: {
        asset: true,
        user: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { asset: true, user: true },
    });
    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }
    return booking;
  }

  /**
   * TASK 2 — Resource Booking with Overlap Validation
   * Rejects any booking where Existing Start < Requested End AND Existing End > Requested Start.
   * Returns HTTP 409 payload with Existing Booking, Existing User, and Existing Time Slot.
   */
  async createBooking(data: {
    assetId: string;
    userId: string;
    startTime: Date | string;
    endTime: Date | string;
  }) {
    const reqStart = new Date(data.startTime);
    const reqEnd = new Date(data.endTime);

    return this.prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({
        where: { id: data.assetId },
      });
      if (!asset) {
        throw new NotFoundException(`Asset ${data.assetId} not found`);
      }

      // Overlap query: Existing Start < Requested End AND Existing End > Requested Start
      const existingBooking = await tx.booking.findFirst({
        where: {
          assetId: data.assetId,
          status: { not: 'CANCELLED' },
          AND: [
            { startTime: { lt: reqEnd } },
            { endTime: { gt: reqStart } },
          ],
        },
        include: {
          user: true,
          asset: true,
        },
      });

      if (existingBooking) {
        throw new ConflictException({
          statusCode: 409,
          message: `Resource ${asset.name} (${asset.assetTag}) is already booked during the requested time slot.`,
          existingBooking: {
            id: existingBooking.id,
            assetId: existingBooking.assetId,
            status: existingBooking.status,
          },
          existingUser:
            existingBooking.user?.name ||
            existingBooking.user?.email ||
            existingBooking.userId,
          existingTimeSlot: {
            startTime: existingBooking.startTime,
            endTime: existingBooking.endTime,
          },
        });
      }

      const booking = await tx.booking.create({
        data: {
          assetId: data.assetId,
          userId: data.userId,
          startTime: reqStart,
          endTime: reqEnd,
          status: 'UPCOMING',
        },
        include: {
          asset: true,
          user: true,
        },
      });

      return booking;
    });
  }
}
