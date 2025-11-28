import { PatchResult } from "@/common/dto/patch-result.dto";
import { BaseResponse } from "@/common/dto/response.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsString } from "class-validator";
import mongoose from "mongoose";

export class ChangePasswordRequestDto {
  @ApiProperty({
    description: "Id of the user",
  })
  @IsMongoId()
  id: mongoose.Types.ObjectId;

  @ApiProperty({ example: "Klmnop123", description: "User current password" })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: "Klmnop123", description: "New password" })
  @IsString()
  newPassword: string;
}

export class ChangePasswordResponseDto extends BaseResponse<
  PatchResult<{
    code: string;
  }>
> { }
