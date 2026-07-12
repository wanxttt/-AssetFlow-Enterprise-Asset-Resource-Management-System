import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    // Use request.user.role or x-user-role header; fallback to ADMIN in development/hackathon demo mode
    const userRole =
      request.user?.role ||
      (request.headers['x-user-role'] as string)?.toUpperCase() ||
      'ADMIN';

    return requiredRoles.some((role) => userRole === role || userRole === 'ADMIN');
  }
}
