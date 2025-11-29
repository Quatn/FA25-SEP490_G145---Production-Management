import { BaseResponse } from "../BaseResponse";
import { PatchResult } from "../PatchResult";

export class ChangePasswordResponseDto extends BaseResponse<
  PatchResult<{
    code: string;
  }>
> { }
