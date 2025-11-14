import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./modules/auth/auth.module";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./modules/auth/jwt.strategy";
import { ConfigModule } from "@nestjs/config";
import { validateEnvs } from "./config/env.validation";
import { ApiBearerAuth } from "@nestjs/swagger";
import { UserModule } from "./modules/user/user.module";
import { DatabaseModule } from "./database/database.module";
import { CommonServicesModule } from "./common/services/services.module";
import { ProductionModule } from './modules/production/production.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { ProductModule } from "./modules/production/product/product.module";
import { WareModule } from "./modules/production/ware/ware.module";
import { PaperTypeModule } from "./modules/warehouse/paper-type/paper-type.module";
import { ProductTypeModule } from "./modules/production/product-type/product-type.module";

@ApiBearerAuth("access-token")
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvs,
      envFilePath: `.env.${process.env.NODE_ENV || "development"}`,
    }),
    DatabaseModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    CommonServicesModule,
    AuthModule,
    UserModule,
    ProductionModule,
    WarehouseModule,
    ProductModule,
    WareModule,
    PaperTypeModule,
    ProductTypeModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule { }
