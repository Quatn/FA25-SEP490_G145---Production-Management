import { Module } from "@nestjs/common";
import { AuthDevController } from "./dev.controller";
import { CommonServicesModule } from "@/common/services/services.module";

// IMPORTANT: This module is only available in development mode and should only be imported conditionally.
// Its controller does use a guard that blocks access in non-development mode, but the best practice would be to not import it in the first place.
@Module({
  imports: [CommonServicesModule],
  controllers: [AuthDevController],
})
export class AuthDevModule { }
