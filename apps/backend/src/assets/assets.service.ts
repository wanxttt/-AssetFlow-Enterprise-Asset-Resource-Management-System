import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { AllocateAssetDto } from './dto/allocate-asset.dto';
import { TransferAssetDto } from './dto/transfer-asset.dto';
import { ReturnAssetDto } from './dto/return-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.asset.findMany({
      include: {
        category: true,
      },
    });
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        category: true,
        allocations: {
          orderBy: { allocatedAt: 'desc' },
          take: 5,
        },
        maintenance: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }
    return asset;
  }

  async create(data: CreateAssetDto | any) {
    const tag =
      data.assetTag ||
      `AF-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0')}`;

    // Verify category exists
    let categoryId = data.categoryId;
    if (categoryId) {
      const categoryExists = await this.prisma.assetCategory.findUnique({
        where: { id: categoryId },
      });
      if (!categoryExists) {
        throw new BadRequestException(`AssetCategory ${categoryId} does not exist`);
      }
    } else {
      let category = await this.prisma.assetCategory.findFirst();
      if (!category) {
        category = await this.prisma.assetCategory.create({
          data: { name: 'General Hardware' },
        });
      }
      categoryId = category.id;
    }

    return this.prisma.asset.create({
      data: {
        assetTag: tag,
        name: data.name || 'New Asset',
        serialNumber: data.serialNumber || undefined,
        acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate) : undefined,
        acquisitionCost: data.acquisitionCost || undefined,
        status: 'AVAILABLE',
        categoryId,
        location: data.location || 'HQ',
        condition: data.condition || 'GOOD',
        isBookable: data.isBookable ?? false,
      },
    });
  }

  /**
   * TASK 2 — Transactional Asset Allocation
   * Both Allocation creation and Asset status update succeed together or rollback.
   */
  async allocateAsset(dto: AllocateAssetDto) {
    return this.prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({
        where: { id: dto.assetId },
      });
      if (!asset) {
        throw new NotFoundException(`Asset ${dto.assetId} not found`);
      }
      if (asset.status !== 'AVAILABLE') {
        throw new ConflictException(
          `Asset ${asset.assetTag} is currently ${asset.status} and cannot be allocated directly.`,
        );
      }

      const allocation = await tx.allocation.create({
        data: {
          assetId: dto.assetId,
          userId: dto.userId || null,
          departmentId: dto.departmentId || null,
          expectedReturn: dto.expectedReturn ? new Date(dto.expectedReturn) : null,
          status: 'ACTIVE',
        },
      });

      const updatedAsset = await tx.asset.update({
        where: { id: dto.assetId },
        data: { status: 'ALLOCATED' },
      });

      return { allocation, asset: updatedAsset };
    });
  }

  /**
   * TASK 2 — Transactional Asset Transfer
   */
  async transferAsset(dto: TransferAssetDto) {
    return this.prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({
        where: { id: dto.assetId },
      });
      if (!asset) {
        throw new NotFoundException(`Asset ${dto.assetId} not found`);
      }

      // Close current active allocation if any
      await tx.allocation.updateMany({
        where: {
          assetId: dto.assetId,
          status: 'ACTIVE',
        },
        data: {
          returnedAt: new Date(),
          status: 'RETURNED',
          returnNotes: `Transferred: ${dto.transferReason || 'No reason provided'}`,
        },
      });

      // Create new allocation
      const newAllocation = await tx.allocation.create({
        data: {
          assetId: dto.assetId,
          userId: dto.toUserId || null,
          departmentId: dto.toDepartmentId || null,
          status: 'ACTIVE',
        },
      });

      const updatedAsset = await tx.asset.update({
        where: { id: dto.assetId },
        data: { status: 'ALLOCATED' },
      });

      return { allocation: newAllocation, asset: updatedAsset };
    });
  }

  /**
   * TASK 2 — Transactional Asset Return
   */
  async returnAsset(dto: ReturnAssetDto) {
    return this.prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({
        where: { id: dto.assetId },
      });
      if (!asset) {
        throw new NotFoundException(`Asset ${dto.assetId} not found`);
      }

      await tx.allocation.updateMany({
        where: {
          assetId: dto.assetId,
          status: 'ACTIVE',
        },
        data: {
          returnedAt: new Date(),
          status: 'RETURNED',
          returnNotes: dto.returnNotes || null,
        },
      });

      const updatedAsset = await tx.asset.update({
        where: { id: dto.assetId },
        data: {
          status: 'AVAILABLE',
          condition: dto.condition || asset.condition,
        },
      });

      return { asset: updatedAsset };
    });
  }

  /**
   * TASK 2 — Transactional Maintenance Workflow
   * 1. Create MaintenanceRequest
   * 2. Update Asset Status to UNDER_MAINTENANCE
   */
  async moveToMaintenance(
    assetId: string,
    requesterId: string,
    description: string,
    priority = 'MEDIUM',
  ) {
    return this.prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({ where: { id: assetId } });
      if (!asset) {
        throw new NotFoundException(`Asset ${assetId} not found`);
      }

      const maintenanceRequest = await tx.maintenanceRequest.create({
        data: {
          assetId,
          requesterId,
          description,
          priority,
          status: 'PENDING',
        },
      });

      const updatedAsset = await tx.asset.update({
        where: { id: assetId },
        data: { status: 'UNDER_MAINTENANCE' },
      });

      return { maintenanceRequest, asset: updatedAsset };
    });
  }

  /**
   * TASK 2 — Transactional Booking Workflow
   * Checks for overlapping bookings and creates the booking atomically.
   */
  async createBooking(assetId: string, userId: string, startTime: Date, endTime: Date) {
    return this.prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({ where: { id: assetId } });
      if (!asset) {
        throw new NotFoundException(`Asset ${assetId} not found`);
      }

      const conflict = await tx.booking.findFirst({
        where: {
          assetId,
          status: { in: ['UPCOMING', 'ONGOING'] },
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } },
          ],
        },
      });

      if (conflict) {
        throw new ConflictException(
          `Asset ${asset.assetTag} is already booked during the specified interval.`,
        );
      }

      const booking = await tx.booking.create({
        data: {
          assetId,
          userId,
          startTime,
          endTime,
          status: 'UPCOMING',
        },
      });

      return booking;
    });
  }

  /**
   * TASK 2 — Transactional Audit Completion
   */
  async completeAuditRecord(recordId: string, status: string, notes?: string) {
    return this.prisma.$transaction(async (tx) => {
      const record = await tx.auditRecord.findUnique({
        where: { id: recordId },
      });
      if (!record) {
        throw new NotFoundException(`AuditRecord ${recordId} not found`);
      }

      const updatedRecord = await tx.auditRecord.update({
        where: { id: recordId },
        data: {
          status,
          notes: notes || record.notes,
        },
      });

      // If missing or damaged, update asset status/condition
      if (status === 'MISSING') {
        await tx.asset.update({
          where: { id: record.assetId },
          data: { status: 'LOST' },
        });
      } else if (status === 'DAMAGED') {
        await tx.asset.update({
          where: { id: record.assetId },
          data: { condition: 'DAMAGED' },
        });
      }

      return updatedRecord;
    });
  }
}
