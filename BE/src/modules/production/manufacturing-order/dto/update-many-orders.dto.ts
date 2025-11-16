import { PatchResult } from "@/common/dto/patch-result.dto";
import { BaseResponse } from "@/common/dto/response.dto";
import { IsArray } from "class-validator";
import { UpdateManufacturingOrderRequestDto } from "./update-order-request.dto";

export class UpdateManyManufacturingOrdersRequestDto {
  @IsArray()
  orders: UpdateManufacturingOrderRequestDto[];
}

export class UpdateManyManufacturingOrdersResponseDto extends BaseResponse<
  PatchResult<{ codes: string[] }>
> { }
