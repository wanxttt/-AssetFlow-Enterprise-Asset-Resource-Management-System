import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('bookings')
@UseGuards(RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  async findAll() {
    return this.bookingService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }

  @Post()
  async create(
    @Body()
    body: {
      assetId: string;
      userId: string;
      startTime: string;
      endTime: string;
    },
  ) {
    return this.bookingService.createBooking(body);
  }
}
