import { ApiProperty } from "@nestjs/swagger";

export class DeleteResult<T = object> {
  @ApiProperty()
  requestedAmount: number = 1;

  @ApiProperty()
  deletedAmount: number = 1;

  @ApiProperty({ required: false })
  echo?: T;
}
