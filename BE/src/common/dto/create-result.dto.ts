import { ApiProperty } from "@nestjs/swagger";

export class CreateResult<T = object> {
  @ApiProperty()
  requestedAmount: number = 1;

  @ApiProperty()
  createdAmount: number = 1;

  @ApiProperty({ required: false })
  echo?: T;
}
