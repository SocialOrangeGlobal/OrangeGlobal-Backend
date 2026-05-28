import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    // If there is an authentication error or no user is logged in,
    // simply return null instead of throwing an UnauthorizedException.
    if (err || !user) {
      return null;
    }
    return user;
  }
}
