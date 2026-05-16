import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.refreshSecret')!,
      passReqToCallback: true,
    } as any);
  }

  validate(req: Request, payload: { sub: string; email: string; role: string }) {
    // Attach the raw refresh token from the body so the service can verify it
    const refreshToken = (req.body as { refreshToken: string }).refreshToken;
    return { id: payload.sub, email: payload.email, role: payload.role, refreshToken };
  }
}
