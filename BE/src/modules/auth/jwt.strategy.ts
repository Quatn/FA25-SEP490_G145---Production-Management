import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecretkey',
    });
  }

  async validate(payload: any) {
    // payload is what you put into the token when signing it
    // e.g. { userId, email, role }

    // Perform extra checks here if needed:
    // - Check if user still exists
    // - Check if user is active
    // - Enrich with extra data

    console.log(payload)

    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
