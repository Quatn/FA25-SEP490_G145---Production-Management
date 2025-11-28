import { UserState } from "@/types/UserState";
import { BaseResponse } from "../BaseResponse";

export class LoginResponseDto extends BaseResponse<{
  userState: UserState;
}> { }
