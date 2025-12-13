import { BaseResponse } from "@/common/dto/response.dto";
import { CreateManufacturingOrderRequestDto } from "./create-order-request.dto";
import { CreateResult } from "@/common/dto/create-result.dto";
import { IsArray } from "class-validator";

export class CreateManyManufacturingOrdersRequestDto {
  @IsArray()
  orders: CreateManufacturingOrderRequestDto[];
}

export class CreateManyManufacturingOrdersResponseDto extends BaseResponse<
  CreateResult<{
    codes: string[];
    processesCreateResult: CreateResult<{ codes: string[] }>;
  }>
> { }
