import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import check from "check-types";
import { Request } from "express";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers["authorization"];

    // Checks for either the authHeader and or the access_token, which means the guards in this project accept both auth header and token based method
    // I don't know the implication of this haphazard auth setup, I don't have time anymore
    if (!authHeader && !check.string(request.cookies.access_token)) {
      return false;
    }

    // If the authHeader is not available, use the cookie token instead. This means authHeader is the default and should allow some funky maneuvers that can get me killed by hammer over security concerns, idk
    if (!authHeader) {
      request.headers.authorization = "Bearer " + request.cookies.access_token;
    }

    return super.canActivate(context);
  }
}
