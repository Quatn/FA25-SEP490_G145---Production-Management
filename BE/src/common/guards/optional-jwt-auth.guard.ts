import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";

// Specialized guard for cases where an endpoint or controller needs to act differently based on whether or not the user is authenticated
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers["authorization"];

    if (!authHeader) {
      return true;
    }

    // Continure default JWT guard logic
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(
    err: any,
    user: TUser,
    _info: unknown,
    _context?: ExecutionContext,
  ): TUser | null {
    if (err) throw err; // still throw actual errors (e.g., invalid signature)
    // Return the user if available, otherwise null
    return user || null;
  }
}
