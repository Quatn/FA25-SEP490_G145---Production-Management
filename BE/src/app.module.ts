import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./modules/auth/auth.module";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./modules/auth/jwt.strategy";
import { ConfigModule } from "@nestjs/config";
import { validateEnvs } from "./config/env.validation";
import { ApiBearerAuth } from "@nestjs/swagger";

@ApiBearerAuth("access-token")
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvs,
      envFilePath: `.env.${process.env.NODE_ENV || "development"}`,
    }),
    PassportModule.register({ defaultStrategy: "jwt" }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule { }
