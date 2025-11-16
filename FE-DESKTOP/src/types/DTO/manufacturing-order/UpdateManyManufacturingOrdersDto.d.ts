import { PatchResult } from "../PatchResult";
import { UpdateManufacturingOrderRequestDto } from "./UpdateManufacturingOrdersRequest";

export class UpdateManyManufacturingOrdersRequestDto {
  orders: Serialized<UpdateManufacturingOrderRequestDto>[];
}

export class UpdateManyManufacturingOrdersResponseDto extends BaseResponse<
  PatchResult<{ codes: string[] }>
> { }
