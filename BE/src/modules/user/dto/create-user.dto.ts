import { CreateResult } from "@/common/dto/create-result.dto";
import { BaseResponse } from "@/common/dto/response.dto";
import { BadRequestException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsMongoId, IsString } from "class-validator";
import mongoose from "mongoose";

export class CreateUserRequestDto {
  @ApiProperty({ example: "admin", description: "User login name" })
  @IsString()
  code: string;

  @ApiProperty({ example: "Klmnop123", description: "User password" })
  @IsString()
  password: string;

  @ApiProperty({ example: "admin", description: "User login name" })
  @IsMongoId()
  employee: mongoose.Types.ObjectId;

  @ApiProperty({ example: "admin", description: "User login name" })
  @Transform(({ value }) => {
    const arr = Array.isArray(value)
      ? value
      : String(value).split(",").filter(Boolean);
    try {
      return arr.map((v) => new mongoose.Types.ObjectId(v as string));
    } catch (_e) {
      throw new BadRequestException(`Invalid ObjectId in "ids" parameter`);
    }
  })
  @IsArray()
  accessPrivileges: mongoose.Types.ObjectId[];
}

export class CreateUserResponseDto extends BaseResponse<
  CreateResult<{
    code: string;
  }>
> { }
