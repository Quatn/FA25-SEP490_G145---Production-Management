import { CryptoService } from "@/common/services/crypto.service";
import { Controller, Get, Query } from "@nestjs/common";

@Controller("auth-dev")
export class AuthDevController {
  constructor(private cryptoService: CryptoService) {}

  @Get("hash")
  async hash(@Query("value") value: string) {
    const hashed = await this.cryptoService.hash(value);
    return { value, hashed };
  }
}
