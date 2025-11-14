import { PageRequest } from "@/common/dto/page.request.dto";
import { PageResponse } from "@/common/dto/page.response.dto";
import { PurchaseOrder } from "../../schemas/purchase-order.schema";

export class QueryListPurchaseOrderRequestDto extends PageRequest { }

export class QueryListPurchaseOrderResponseDto extends PageResponse<PurchaseOrder> { }
