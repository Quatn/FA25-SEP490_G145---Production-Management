import { BaseResponse } from "../BaseResponse";
import { DeleteResult } from "../DeleteResult";

export class DeleteManufacturingOrderRequestDto {
  id: string;
}

export class DeleteManufacturingOrderResponseDto extends BaseResponse<
  DeleteResult<{ code: string }>
> { }

