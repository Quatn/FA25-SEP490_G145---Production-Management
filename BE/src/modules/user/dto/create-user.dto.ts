import { CreateResult } from "@/common/dto/create-result.dto";
import { BaseResponse } from "@/common/dto/response.dto";
import { ALL_ACCESS_PRIVILEGE_VALUES } from "@/config/access-privileges-list";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsString } from "class-validator";
import mongoose from "mongoose";

export class CreateUserRequestDto {
  @ApiProperty({ example: "admin", description: "User login name" })
  @IsString()
  code: string;

  @ApiProperty({ example: "Klmnop123", description: "User password" })
  @IsString()
  password: string;

  @ApiProperty({
    example: "6926c834c0637050c69dc2a3",
    description: "Employee id",
  })
  @IsMongoId()
  employee: mongoose.Types.ObjectId;

  @ApiProperty({ example: "admin", description: "User login name" })
  @IsEnum(ALL_ACCESS_PRIVILEGE_VALUES, { each: true })
  accessPrivileges: mongoose.Types.ObjectId[];
}

export class CreateUserResponseDto extends BaseResponse<
  CreateResult<{
    code: string;
  }>
> { }
