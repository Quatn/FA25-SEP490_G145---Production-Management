import { ApiProperty } from "@nestjs/swagger";

export class PatchResult<T = object> {
  @ApiProperty()
  requestedAmount: number = 1;

  @ApiProperty()
  patchedAmount: number = 1;

  @ApiProperty({ required: false })
  echo?: T;
}
