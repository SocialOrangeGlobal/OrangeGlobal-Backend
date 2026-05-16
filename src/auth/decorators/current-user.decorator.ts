import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export class AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  refreshToken?: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<Request & { user: AuthenticatedUser }>();
    return request.user;
  },
);
