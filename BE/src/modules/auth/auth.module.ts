import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { accessTokenSignOptions } from '@/config/jwt.config';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecretkey',
      signOptions: accessTokenSignOptions,
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule { }
