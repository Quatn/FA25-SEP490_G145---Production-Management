import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import type { Response as ExpressResponse } from "express";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { BaseResponse } from "@/common/dto/response.dto";
import { accessTokenSignOptions } from "@/config/jwt.config";
import check from "check-types";
import ms from "ms";
import type { AuthenticatedRequest } from "@/common/interfaces/authenticated-request";
import { LoginRequestDto, LoginResponseDto } from "./dto/login.dto";

@Controller("auth")
@ApiBearerAuth("access-token") // IMPORTANT: Include this or else Swagger wont include the access token when testing
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post("login")
  @ApiOperation({
    summary:
      "Login with username and password. Return an access token if login successful on development environment",
  })
  async login(
    @Body() body: LoginRequestDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<BaseResponse<LoginResponseDto>> {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );

    const token = await this.authService.login(user);

    const cookieMaxAge = check.undefined(accessTokenSignOptions.expiresIn)
      ? undefined
      : check.string(accessTokenSignOptions.expiresIn)
        ? ms(accessTokenSignOptions.expiresIn)
        : accessTokenSignOptions.expiresIn * 1000;

    res.cookie("access_token", token.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only over HTTPS in prod
      sameSite: "strict",
      maxAge: cookieMaxAge,
    });

    const loginResponse: BaseResponse<LoginResponseDto> = {
      success: true,
      message: "Login successful",
    };

    // For swagger testing, should be removed once security becomes a more pressing concern
    if (process.env.NODE_ENV === "development") {
      loginResponse.data = { access_token: token.access_token };
    }

    return loginResponse;
  }

  @Get("test-protected-route")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Can only be accessed by authenticated users" })
  getProtected(@Req() req: AuthenticatedRequest): string {
    return `SAND FOR USER '${req.user.username}'`;
  }
}
