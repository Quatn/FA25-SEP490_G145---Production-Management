import { BaseResponse } from "../BaseResponse";
import { PatchResult } from "../PatchResult";

export class UpdateManyUsersResponseDto extends BaseResponse<
  PatchResult<{
    codes: string[];
  }>
> { }
