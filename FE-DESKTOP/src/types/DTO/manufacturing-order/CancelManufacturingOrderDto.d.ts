import { BaseResponse } from "../BaseResponse";
import { PatchResult } from "../PatchResult";

export class CancelManufacturingOrderRequestDto {
  id: string;
}

export class CancelManufacturingOrderResponseDto extends BaseResponse<
  PatchResult<{
    code: string;
    orderProcessUpdateResult: PatchResult;
  }>
> { }

