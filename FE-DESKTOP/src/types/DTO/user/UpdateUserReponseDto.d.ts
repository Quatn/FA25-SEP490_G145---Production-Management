import { BaseResponse } from "../BaseResponse";
import { PatchResult } from "../PatchResult";

export class UpdateUserResponseDto extends BaseResponse<
  PatchResult<{
    code: string;
  }>
> { }
