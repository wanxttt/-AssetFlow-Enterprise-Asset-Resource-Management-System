import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssetState, MaintenanceStatus } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all assets formatted for Screen 8 Audit verification list
   */
  async findAllAssetsForAudit() {
    const assets = await this.prisma.asset.findMany({
      orderBy: { assetTag: 'asc' },
    });
    return assets.map((a) => ({
      id: a.id,
      assetTag: a.assetTag,
      name: a.name,
      location: a.location || 'Warehouse',
      status: a.condition || 'GOOD',
    }));
  }

  /**
   * Get all Audit Cycles with their 1-to-Many AuditRecords (Discrepancy Reports)
   */
  async findAuditCycles() {
    return this.prisma.auditCycle.findMany({
      include: {
        records: {
          include: {
            asset: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create an Audit Cycle and automatically generate initial AuditRecords for all assets
   */
  async createAuditCycle(name: string) {
    return this.prisma.$transaction(async (tx) => {
      const cycle = await tx.auditCycle.create({
        data: {
          name,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
          status: 'IN_PROGRESS',
        },
      });

      const assets = await tx.asset.findMany();
      if (assets.length > 0) {
        await tx.auditRecord.createMany({
          data: assets.map((a) => ({
            auditCycleId: cycle.id,
            assetId: a.id,
            status: 'PENDING',
          })),
        });
      }

      return tx.auditCycle.findUnique({
        where: { id: cycle.id },
        include: { records: true },
      });
    });
  }

  /**
   * Create Discrepancy Report (1-to-Many linked to Audit Cycle)
   */
  async createDiscrepancyReport(data: {
    auditCycleId: string;
    assetId: string;
    discrepancyType: string;
    notes: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const cycle = await tx.auditCycle.findUnique({
        where: { id: data.auditCycleId },
      });
      if (!cycle) {
        throw new NotFoundException(
          `Audit Cycle ${data.auditCycleId} not found`,
        );
      }

      const record = await tx.auditRecord.create({
        data: {
          auditCycleId: data.auditCycleId,
          assetId: data.assetId,
          status: 'DISCREPANCY',
          isDiscrepancy: true,
          discrepancyType: data.discrepancyType,
          notes: data.notes,
        },
      });

      return record;
    });
  }

  /**
   * Atomically update Audit verification status and underlying Asset condition
   */
  async updateAssetAuditStatus(assetId: string, status: string) {
    return this.prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({ where: { id: assetId } });
      if (!asset) {
        throw new NotFoundException(`Asset ${assetId} not found`);
      }

      const updatedAsset = await tx.asset.update({
        where: { id: assetId },
        data: {
          condition: status,
        },
      });

      // Synchronize with active AuditCycle record if one exists
      const activeCycle = await tx.auditCycle.findFirst({
        where: { status: 'IN_PROGRESS' },
        orderBy: { createdAt: 'desc' },
      });

      if (activeCycle) {
        const isDiscrepant =
          status.toUpperCase() === 'MISSING' ||
          status.toUpperCase() === 'DAMAGED';
        const record = await tx.auditRecord.findFirst({
          where: { auditCycleId: activeCycle.id, assetId },
        });

        if (record) {
          await tx.auditRecord.update({
            where: { id: record.id },
            data: {
              status,
              isDiscrepancy: isDiscrepant,
              discrepancyType: isDiscrepant ? status.toUpperCase() : null,
            },
          });
        } else {
          await tx.auditRecord.create({
            data: {
              auditCycleId: activeCycle.id,
              assetId,
              status,
              isDiscrepancy: isDiscrepant,
              discrepancyType: isDiscrepant ? status.toUpperCase() : null,
            },
          });
        }
      }

      return { success: true, id: assetId, status: updatedAsset.condition };
    });
  }

  /**
   * TASK 4 — Close Audit Cycle & Discrepancy Reporting
   * Compares Auditor Verification vs System Records.
   * - Missing Assets: Automatically update Asset Status -> LOST
   * - Damaged Assets: Automatically create Maintenance Request
   * Generates comprehensive Discrepancy Report and stores complete audit history inside a transaction.
   */
  async closeAuditCycle(auditCycleId?: string) {
    return this.prisma.$transaction(async (tx) => {
      let cycle = auditCycleId
        ? await tx.auditCycle.findUnique({ where: { id: auditCycleId }, include: { records: { include: { asset: true } } } })
        : await tx.auditCycle.findFirst({
            where: { status: 'IN_PROGRESS' },
            orderBy: { createdAt: 'desc' },
            include: { records: { include: { asset: true } } },
          });

      if (!cycle) {
        throw new NotFoundException(
          auditCycleId
            ? `Audit Cycle ${auditCycleId} not found`
            : 'No active IN_PROGRESS Audit Cycle found to close',
        );
      }

      const discrepancies: any[] = [];
      let missingCount = 0;
      let damagedCount = 0;
      let verifiedCount = 0;

      // Reconcile all assets against audit records / auditor verifications
      const allAssets = await tx.asset.findMany();

      for (const asset of allAssets) {
        const cond = (asset.condition || '').toUpperCase();
        if (cond === 'MISSING') {
          missingCount++;
          // Automatically update Asset Status -> LOST
          await tx.asset.update({
            where: { id: asset.id },
            data: { status: AssetState.LOST },
          });

          discrepancies.push({
            assetId: asset.id,
            assetTag: asset.assetTag,
            name: asset.name,
            discrepancyType: 'MISSING',
            actionTaken: 'Asset status updated to LOST',
          });
        } else if (cond === 'DAMAGED') {
          damagedCount++;
          const defaultUser = await tx.user.findFirst();
          // Automatically create Maintenance Request
          const newMaintenance = await tx.maintenanceRequest.create({
            data: {
              assetId: asset.id,
              requesterId: defaultUser?.id || 'admin-uuid',
              description: `Automated Request from Audit Cycle (${cycle.name}): Asset reported DAMAGED`,
              priority: 'HIGH',
              status: MaintenanceStatus.PENDING,
            },
          });

          discrepancies.push({
            assetId: asset.id,
            assetTag: asset.assetTag,
            name: asset.name,
            discrepancyType: 'DAMAGED',
            actionTaken: `Maintenance Request ${newMaintenance.id} created automatically`,
          });
        } else {
          verifiedCount++;
        }
      }

      const closedCycle = await tx.auditCycle.update({
        where: { id: cycle.id },
        data: { status: 'CLOSED' },
      });

      return {
        auditCycle: closedCycle,
        discrepancyReport: discrepancies,
        summary: {
          verifiedCount,
          missingCount,
          damagedCount,
          totalAudited: allAssets.length,
          closedAt: new Date(),
        },
      };
    });
  }
}
