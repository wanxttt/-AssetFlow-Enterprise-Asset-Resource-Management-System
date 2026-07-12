import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class OrgService {
  constructor(private readonly prisma: PrismaService) {}

  async getDepartments() {
    return this.prisma.department.findMany({
      include: {
        employees: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async createDepartment(name: string) {
    const trimmedName = name.trim();
    const existing = await this.prisma.department.findUnique({
      where: { name: trimmedName },
    });
    if (existing) {
      return existing;
    }
    return this.prisma.department.create({
      data: {
        name: trimmedName,
      },
    });
  }

  async getUsers() {
    return this.prisma.user.findMany({
      include: {
        department: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async createUser(data: {
    email: string;
    name: string;
    role: Role;
    departmentId?: string;
  }) {
    const email = data.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return this.prisma.user.update({
        where: { email },
        data: {
          name: data.name,
          role: data.role || existing.role,
          departmentId: data.departmentId || existing.departmentId,
        },
      });
    }
    return this.prisma.user.create({
      data: {
        email,
        name: data.name,
        role: data.role || Role.EMPLOYEE,
        departmentId: data.departmentId || null,
        password: 'DEMO_HASH_DEFAULT',
      },
    });
  }
}
