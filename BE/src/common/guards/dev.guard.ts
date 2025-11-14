import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class DevOnlyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) { }

  canActivate(_context: ExecutionContext): boolean {
    const env = this.configService.get<string>("NODE_ENV");
    if (env !== "development") {
      throw new ForbiddenException(
        "This route is only available in development.",
      );
    }
    return true;
  }
}
