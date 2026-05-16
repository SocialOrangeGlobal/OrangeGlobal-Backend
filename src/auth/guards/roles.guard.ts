import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No role restriction on this route
    }

    const { user } = context.switchToHttp().getRequest<{ user: { role: string } }>();

    if (!requiredRoles.includes(user?.role)) {
      throw new ForbiddenException(
        `This endpoint requires one of the following roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
