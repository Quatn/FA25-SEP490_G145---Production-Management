import { BaseResponse } from "../BaseResponse";
import { CreateResult } from "../CreateResult";

export class CreateUserResponseDto extends BaseResponse<
  CreateResult<{
    code: string;
  }>
> { }
