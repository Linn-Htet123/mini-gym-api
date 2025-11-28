/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Request, Response as ExpressResponse } from 'express';
import { ApiResponseDto, PaginatedResponseDto } from '@app/common';

interface ResponseData<T = any> {
  message?: string;
  data?: T;
  total?: number;
  page?: number;
  limit?: number;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponseDto<T> | PaginatedResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseDto<T> | PaginatedResponseDto<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<ExpressResponse>();

    return next.handle().pipe(
      map((data: ResponseData<T>) => {
        const now = new Date().toISOString();

        // If it has pagination fields, wrap in PaginatedResponseDto
        if (
          data &&
          typeof data === 'object' &&
          'total' in data &&
          'page' in data &&
          'limit' in data &&
          Array.isArray(data.data)
        ) {
          return new PaginatedResponseDto(
            data.data,
            data.total as number,
            data.page as number,
            data.limit as number,
            data.message || 'Success',
          );
        }

        return {
          statusCode: response.statusCode,
          message: data?.message || 'Success',
          data: data?.data !== undefined ? data.data : data,
          timestamp: now,
          path: request.url,
        } as ApiResponseDto<T>;
      }),
    );
  }
}
