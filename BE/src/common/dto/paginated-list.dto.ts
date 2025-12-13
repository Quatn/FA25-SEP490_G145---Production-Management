import { ApiProperty } from "@nestjs/swagger";
import { Pagination } from "./pagination.dto";

export class PaginatedList<T> extends Pagination {
  @ApiProperty()
  data: T[];
}
