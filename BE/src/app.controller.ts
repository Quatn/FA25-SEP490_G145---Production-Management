import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AppService } from "./app.service";
import { OptionalJwtAuthGuard } from "./common/guards/optional-jwt-auth.guard";
import type { AuthenticatedRequest } from "./common/interfaces/authenticated-request";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";

@Controller()
@ApiBearerAuth("access-token")
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: "Display a welcome message based on authentication status.",
  })
  getWelcomeMessage(@Req() req: AuthenticatedRequest): string {
    return this.appService.getWelcomeMessage(req.user);
  }
}
