import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT token' })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    const token = await this.authService.login(user);

    // Set the token as an HTTP-only cookie
    res.cookie('access_token', token.access_token, {
      httpOnly: true, // cannot be accessed by JS
      secure: process.env.NODE_ENV === 'production', // only over HTTPS in prod
      sameSite: 'strict',
      maxAge: 1000 * 60 * 15, // 15 minutes
    });

    const loginResponse = {
      message: 'Login successful',
    };

    // For swagger testing, should be removed soon
    if (process.env.NODE_ENV === 'development') {
      loginResponse.access_token = token.access_token;
    }

    return loginResponse;
  }

  @Get('protected')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Can only be accessed by authenticated users' })
  getProtected(): string {
    return 'SAND!!!';
  }
}
