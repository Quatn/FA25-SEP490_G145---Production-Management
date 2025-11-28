import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import check from "check-types";
import { JwtAuthGuard } from "./jwt-auth.guard";

export function PrivilegedJwtAuthGuard(options?: {
  requiredPrivileges?: string[];
}) {
  @Injectable()
  class MixinJwtAuthGuard extends JwtAuthGuard {
    handleRequest<TUser = any>(
      err: any,
      user: TUser,
      _info: unknown,
      _context?: ExecutionContext,
    ): TUser | null {
      if (err || !user) throw err || new UnauthorizedException("Unauthorized");

      if (options?.requiredPrivileges?.length) {
        const userPrivileges = (
          user as unknown as JwtPayload
        ).accessPrivileges.split(",");

        if (!check.array.of.string(userPrivileges)) {
          throw new ForbiddenException("Unable to read privileges");
        }

        const hasAny = options.requiredPrivileges.find((p) =>
          userPrivileges.includes(p),
        );

        if (!hasAny) {
          throw new ForbiddenException("Missing required privileges");
        }
      }

      return user;
    }
  }

  return MixinJwtAuthGuard;
}
