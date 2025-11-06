import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { accessTokenSignOptions } from "@/config/jwt.config";
import { UserModule } from "../user/user.module";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // using ConfigService instead of just taking the secret from process.env bc module load order and stuff
        secret: config.get<string>("JWT_SECRET"),
        signOptions: accessTokenSignOptions,
      }),
    }),
    UserModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule { }
