import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { UserState } from "./user-state.dto";

export class LoginRequestDto {
  @ApiProperty({ example: "admin", description: "User login name" })
  @IsString()
  code: string;

  @ApiProperty({ example: "password123", description: "User password" })
  @IsString()
  password: string;
}

export class LoginResponseDto {
  "access_token"?: string;
  userState: UserState;
}
