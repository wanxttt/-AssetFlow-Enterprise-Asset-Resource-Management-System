import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MaintenanceStatus, AssetState } from '@prisma/client';

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.maintenanceRequest.findMany({
      include: {
        asset: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { asset: true },
    });
    if (!request) {
      throw new NotFoundException(`Maintenance request ${id} not found`);
    }
    return request;
  }

  /**
   * TASK 3 — Create Maintenance Request (Status: PENDING)
   */
  async createRequest(data: {
    assetId: string;
    description: string;
    priority?: string;
    requesterId?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({
        where: { id: data.assetId },
      });
      if (!asset) {
        throw new NotFoundException(`Asset ${data.assetId} not found`);
      }

      let requesterId = data.requesterId;
      if (!requesterId) {
        const defaultUser = await tx.user.findFirst();
        requesterId = defaultUser?.id || 'admin-uuid';
      }

      const req = await tx.maintenanceRequest.create({
        data: {
          assetId: data.assetId,
          requesterId,
          description: data.description,
          priority: data.priority || 'MEDIUM',
          status: MaintenanceStatus.PENDING,
        },
      });

      return req;
    });
  }

  /**
   * TASK 3 — Atomically transition Maintenance Request Status inside Prisma Transaction
   * PENDING -> APPROVED -> TECHNICIAN_ASSIGNED -> IN_PROGRESS -> RESOLVED
   * Business Rules:
   * When status becomes Approved: Automatically Update Asset Status -> Under Maintenance
   * When status becomes Resolved: Automatically Update Asset Status -> Available
   */
  async updateStatus(id: string, newStatus: MaintenanceStatus) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.maintenanceRequest.findUnique({
        where: { id },
        include: { asset: true },
      });
      if (!existing) {
        throw new NotFoundException(`Maintenance request ${id} not found`);
      }

      const updatedReq = await tx.maintenanceRequest.update({
        where: { id },
        data: {
          status: newStatus,
          resolvedAt:
            newStatus === MaintenanceStatus.RESOLVED ? new Date() : undefined,
        },
      });

      // Synchronize Asset Lifecycle State Machine atomically inside transaction
      if (newStatus === MaintenanceStatus.APPROVED || newStatus === MaintenanceStatus.IN_PROGRESS || (newStatus as string) === 'TECHNICIAN_ASSIGNED') {
        await tx.asset.update({
          where: { id: existing.assetId },
          data: { status: AssetState.UNDER_MAINTENANCE },
        });
      } else if (newStatus === MaintenanceStatus.RESOLVED) {
        await tx.asset.update({
          where: { id: existing.assetId },
          data: { status: AssetState.AVAILABLE },
        });
      }

      return updatedReq;
    });
  }

  /**
   * Helper shortcut for approving a request (PENDING -> APPROVED)
   */
  async approveRequest(id: string) {
    return this.updateStatus(id, MaintenanceStatus.APPROVED);
  }
}
