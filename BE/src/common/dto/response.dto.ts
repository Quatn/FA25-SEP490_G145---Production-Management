import { ApiProperty } from "@nestjs/swagger";

export class BaseResponse<TData = object, TError = object> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  data?: TData;

  @ApiProperty({ required: false })
  error?: TError;
}
