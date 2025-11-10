import { PageRequest } from "@/common/dto/page.request.dto";
import { PageResponse } from "@/common/dto/page.response.dto";
import { FullDetailManufacturingOrderDto } from "./full-details-orders.dto";

export class QueryListFullDetailsManufacturingOrderRequestDto extends PageRequest { }

export class QueryListFullDetailsManufacturingOrderResponseDto extends PageResponse<FullDetailManufacturingOrderDto> { }
