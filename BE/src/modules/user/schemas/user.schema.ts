import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsEnum } from "class-validator";
import { Document } from "mongoose";

export enum UserRole {
  Admin = "admin",
  Guest = "guest",
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  username: string;

  // Not encrypted yet
  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  @IsEnum(UserRole)
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
