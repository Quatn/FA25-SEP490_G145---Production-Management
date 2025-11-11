import { ApiProperty } from "@nestjs/swagger";

export class Pagination {
  @ApiProperty({ required: false, default: 1 })
  page: number = 1;

  @ApiProperty({ required: false, default: 20 })
  limit: number = 20;

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPrevPage: boolean;
}
