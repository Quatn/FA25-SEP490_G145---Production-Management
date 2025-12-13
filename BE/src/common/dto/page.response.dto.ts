import { BaseResponse } from "./response.dto";
import { PaginatedList } from "./paginated-list.dto";

export class PageResponse<T> extends BaseResponse<PaginatedList<T>> { }
