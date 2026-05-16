import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data: { message?: string;[key: string]: unknown } | T) => {
        // Allow services to embed a custom message in the response
        const payload = data as Record<string, unknown>;
        const message =
          typeof payload?.message === 'string'
            ? payload.message
            : 'Request successful';

        // Remove top-level 'message' from data to avoid duplication
        if (payload?.message) {
          const { message: _msg, ...rest } = payload;
          return {
            success: true as const,
            statusCode: response.statusCode,
            message,
            data: rest as T,
          };
        }

        return {
          success: true as const,
          statusCode: response.statusCode,
          message,
          data: data as T,
        };
      }),
    );
  }
}
