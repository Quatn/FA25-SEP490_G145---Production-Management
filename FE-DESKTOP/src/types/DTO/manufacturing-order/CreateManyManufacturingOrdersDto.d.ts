import { BaseResponse } from "../BaseResponse";
import { CreateResult } from "../CreateResult";
import { CreateManufacturingOrderRequestDto } from "./CreateManufacturingOrdersRequest";

export class CreateManyManufacturingOrdersRequestDto {
  orders: Serialized<CreateManufacturingOrderRequestDto>[];
}

export class CreateManyManufacturingOrdersResponseDto extends BaseResponse<
  CreateResult<{ codes: string[] }>
> { }
