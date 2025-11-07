import { Module } from "@nestjs/common";
import { AuthDevController } from "./dev.controller";
import { CommonServicesModule } from "@/common/services/services.module";

@Module({
  imports: [CommonServicesModule],
  controllers: [AuthDevController],
})
export class AuthDevModule { }
