// sub-purchase-order/dto/update-sub-purchase-order.dto.ts
import { PartialType } from "@nestjs/swagger";
import { CreateSubPurchaseOrderDto } from "./create-sub-purchase-order.dto";

export class UpdateSubPurchaseOrderDto extends PartialType(CreateSubPurchaseOrderDto) {}
