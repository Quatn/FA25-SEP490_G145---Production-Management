import { JwtPayload } from "@/common/interfaces/jwt-payload.interface";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("JWT_SECRET"),
    });
  }

  // Can be async
  validate(payload: JwtPayload) {
    // Everything thing function returns will be put into the 'user' field of the request returned by @Req when jwt authentication is successful

    // Perform extra checks here if needed like:
    // - Check if user still exists
    // - Check if user is active
    // - Enrich with extra data

    // console.log(payload);
    return payload;
  }
}
