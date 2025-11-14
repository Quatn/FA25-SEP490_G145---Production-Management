import { ApiProperty } from "@nestjs/swagger";

export class ErrorResponse<T = object> {
  @ApiProperty()
  status: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  stack?: T;
}
