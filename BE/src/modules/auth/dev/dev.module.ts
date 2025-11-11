import { Module } from "@nestjs/common";
import { AuthDevController } from "./dev.controller";
import { CommonServicesModule } from "@/common/services/services.module";
import { APP_GUARD } from "@nestjs/core";
import { DevOnlyGuard } from "@/common/guards/dev.guard";

// IMPORTANT: This module is only available in development mode and should only be imported conditionally.
// It does use a guard that blocks access in non-development mode, but the best practice would be to not import it in the first place.
@Module({
  imports: [CommonServicesModule],
  controllers: [AuthDevController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: DevOnlyGuard,
    },
  ],
})
export class AuthDevModule { }
