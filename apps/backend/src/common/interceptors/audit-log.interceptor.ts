import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const method = request.method;

    // Only log state-mutating requests
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const path = request.originalUrl || request.url || '';
    const ipAddress =
      request.headers['x-forwarded-for'] ||
      request.ip ||
      request.connection?.remoteAddress ||
      '127.0.0.1';
    const userId = request.user?.id || null;

    // Extract module and entity from path, e.g. /api/assets -> module: 'assets', entity: 'Asset'
    const parts = path.split('/').filter(Boolean);
    const moduleName = parts[1] || parts[0] || 'app';
    const entityName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
    const entityId = request.params?.id || null;

    return next.handle().pipe(
      tap(async (responseBody) => {
        try {
          const targetEntityId =
            entityId || responseBody?.id || responseBody?.asset?.id || null;
          await this.prisma.auditLog.create({
            data: {
              userId,
              httpMethod: method,
              module: moduleName,
              entity: entityName,
              entityId: targetEntityId ? String(targetEntityId) : null,
              previousValues: null,
              newValues: responseBody
                ? JSON.stringify(responseBody, null, 2)
                : JSON.stringify(request.body, null, 2),
              ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : String(ipAddress),
            },
          });
        } catch (error) {
          this.logger.error(`Failed to record automatic AuditLog: ${error.message}`);
        }
      }),
    );
  }
}
