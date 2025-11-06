import { JwtPayload } from '@/common/interfaces/jwt-payload.interface';
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

  async validate(payload: JwtPayload) {
    // Everything thing function returns will be put into the 'user' field of the request returned by @Req

    // Perform extra checks here if needed like:
    // - Check if user still exists
    // - Check if user is active
    // - Enrich with extra data

    // console.log(payload);
    return payload;
  }
}
