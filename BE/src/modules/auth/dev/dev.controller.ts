import { DevOnlyGuard } from "@/common/guards/dev.guard";
import { CryptoService } from "@/common/services/crypto.service";
import { Controller, Get, Query, UseGuards } from "@nestjs/common";

@UseGuards(DevOnlyGuard)
@Controller("auth-dev")
export class AuthDevController {
  constructor(private cryptoService: CryptoService) {}

  @Get("hash")
  async hash(@Query("value") value: string) {
    const hashed = await this.cryptoService.hash(value);
    return { value, hashed };
  }
}
