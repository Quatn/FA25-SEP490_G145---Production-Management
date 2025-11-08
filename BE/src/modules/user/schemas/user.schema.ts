import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsEnum } from "class-validator";
import { HydratedDocument } from "mongoose";

export enum UserRole {
  Admin = "admin",
  Guest = "guest",
}

@Schema({ timestamps: true })
export class User extends BaseSchema {
  @Prop({ required: true })
  username: string;

  // Not encrypted yet
  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  @IsEnum(UserRole)
  role: UserRole;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User).plugin(
  softDeletePlugin,
);
