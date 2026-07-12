import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { OrgService } from './org.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('org')
@UseGuards(RolesGuard)
export class OrgController {
  constructor(private readonly orgService: OrgService) {}

  @Get('departments')
  async getDepartments() {
    return this.orgService.getDepartments();
  }

  @Post('departments')
  @Roles(Role.ADMIN)
  async createDepartment(@Body() body: { name: string }) {
    return this.orgService.createDepartment(body.name);
  }

  @Get('users')
  async getUsers() {
    return this.orgService.getUsers();
  }

  @Post('users')
  @Roles(Role.ADMIN)
  async createUser(
    @Body()
    body: {
      email: string;
      name: string;
      role: Role;
      departmentId?: string;
    },
  ) {
    return this.orgService.createUser(body);
  }
}
