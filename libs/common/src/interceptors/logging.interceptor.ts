/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, ip, body } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    this.logger.log(`Incoming → ${method} ${url} - ${ip} - ${userAgent}`);

    if (body && typeof body === 'object' && Object.keys(body).length > 0) {
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(`Request Body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `Outgoing ← ${method} ${url} ${response.statusCode} - ${duration}ms`,
          );
        },
        error: (error: Error & { status?: number }) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `Error ✗ ${method} ${url} ${error.status || 500} - ${duration}ms - ${error.message}`,
          );
        },
      }),
    );
  }

  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    const sensitiveFields = ['password', 'token', 'secret', 'authorization'];
    const sanitized = { ...body };

    sensitiveFields.forEach((field) => {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}
