import { PageRequest } from "@/common/dto/page.request.dto";
import { PageResponse } from "@/common/dto/page.response.dto";
import { ManufacturingOrder } from "../../schemas/manufacturing-order.schema";

export class QueryListManufacturingOrderRequestDto extends PageRequest {}

export class QueryListManufacturingOrderResponseDto extends PageResponse<ManufacturingOrder> {}

