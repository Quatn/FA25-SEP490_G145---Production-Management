import { BaseResponse } from "@/common/dto/response.dto";
import { CreateManufacturingOrderRequestDto } from "./create-order-request.dto";
import { CreateResult } from "@/common/dto/create-result.dto";

export class CreateManyManufacturingOrdersRequestDto {
  orders: CreateManufacturingOrderRequestDto[];
}

export class CreateManyManufacturingOrdersResponseDto extends BaseResponse<
  CreateResult<{ codes: string[] }>
> { }
