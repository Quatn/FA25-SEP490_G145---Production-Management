import { BaseResponse } from "../BaseResponse";

export class LogoutResponseDto extends BaseResponse<{
  code?: string;
}> { }
