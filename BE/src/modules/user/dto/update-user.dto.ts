import { PatchResult } from "@/common/dto/patch-result.dto";
import { BaseResponse } from "@/common/dto/response.dto";
import { ALL_ACCESS_PRIVILEGE_VALUES } from "@/config/access-privileges-list";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsString } from "class-validator";
import mongoose from "mongoose";

export class UpdateUserRequestDto {
  @ApiProperty({
    description: "Id of the user",
  })
  @IsMongoId()
  id: mongoose.Types.ObjectId;

  @ApiProperty({ example: "admin", description: "User login name" })
  @IsString()
  code?: string;

  @ApiProperty({ example: "Klmnop123", description: "User password" })
  @IsString()
  password?: string;

  @ApiProperty({ example: "admin", description: "User login name" })
  @IsEnum(ALL_ACCESS_PRIVILEGE_VALUES, { each: true })
  accessPrivileges?: mongoose.Types.ObjectId[];
}

export class UpdateUserResponseDto extends BaseResponse<
  PatchResult<{
    code: string;
  }>
> { }
