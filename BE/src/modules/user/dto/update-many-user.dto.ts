import { PatchResult } from "@/common/dto/patch-result.dto";
import { BaseResponse } from "@/common/dto/response.dto";
import { ApiProperty } from "@nestjs/swagger";
import { UpdateUserRequestDto } from "./update-user.dto";
import { IsArray } from "class-validator";

export class UpdateManyUsersRequestDto {
  @ApiProperty({
    description: "Id of the user",
  })
  @IsArray()
  users: UpdateUserRequestDto[];
}

export class UpdateManyUsersResponseDto extends BaseResponse<
  PatchResult<{
    codes: string[];
  }>
> { }
