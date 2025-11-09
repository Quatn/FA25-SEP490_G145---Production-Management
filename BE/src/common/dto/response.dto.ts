import { ApiProperty } from "@nestjs/swagger";

export class BaseResponse<T = object> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  data?: T;
}
