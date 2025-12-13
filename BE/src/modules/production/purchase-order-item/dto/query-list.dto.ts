import { PageRequest } from "@/common/dto/page.request.dto";
import { PageResponse } from "@/common/dto/page.response.dto";
import { PurchaseOrderItem } from "../../schemas/purchase-order-item.schema";

export class QueryListPurchaseOrderItemRequestDto extends PageRequest { }

export class QueryListPurchaseOrderItemResponseDto extends PageResponse<PurchaseOrderItem> { }
