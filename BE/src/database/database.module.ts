import { Global, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [],
      useFactory: () => ({
        uri: process.env.DB_URI,
        dbName: process.env.DB_NAME,
        // optional settings
        retryAttempts: 3,
        retryDelay: 3000,
      }),
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule { }
