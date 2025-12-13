import { BaseResponse } from "./BaseResponse";
import { PaginatedList } from "./PaginatedList";

export class PageResponse<T> extends BaseResponse<PaginatedList<T>> { }
