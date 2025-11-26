// sub-purchase-order.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  NotFoundException,
  Patch,
  Delete,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { SubPurchaseOrderService } from "./sub-purchase-order.service";
import { CreateSubFromProductsDto } from "./dto/create-sub-from-products.dto";
import { UpdateSubPurchaseOrderDto } from "./dto/update-sub-purchase-order.dto";
import { PaginationQueryDto } from "../purchase-order/dto/pagination-query.dto";

@Controller("sub-purchase-order")
@ApiTags("SubPurchaseOrder")
export class SubPurchaseOrderController {
  constructor(private readonly svc: SubPurchaseOrderService) { }

  @Post("create-from-products")
  @ApiOperation({
    summary:
      "Create sub-purchase-orders from selected products (bulk). Also creates PO items for each ware in product.",
  })
  async createFromProducts(@Body() payload: CreateSubFromProductsDto) {
    return this.svc.createFromProducts(payload);
  }

  @Get()
  @ApiOperation({ summary: "List sub purchase orders, filter by purchaseOrderId" })
  async findAll(@Query("purchaseOrderId") purchaseOrderId?: string) {
    const docs = await this.svc.findAll({ purchaseOrderId });
    return { success: true, message: "Fetch successful", data: docs };
  }

  @Get("detail/:id")
  @ApiOperation({ summary: "Get sub purchase order by id (populated)" })
  async getDetail(@Param("id") id: string) {
    const doc = await this.svc.findOneById(id);
    if (!doc) throw new NotFoundException("SubPurchaseOrder not found");
    return { success: true, message: "Fetch successful", data: doc };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get sub-PO detail with items populated" })
  findOne(@Param("id") id: string) {
    return this.svc.findOneById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update sub-PO (patch)" })
  update(@Param("id") id: string, @Body() payload: UpdateSubPurchaseOrderDto) {
    return this.svc.update(id, payload);
  }

  @Delete("delete-soft/:id")
  @ApiOperation({ summary: "Soft delete sub-PO" })
  remove(@Param("id") id: string) {
    return this.svc.softRemove(id);
  }

  @Get("deleted")
  async findDeleted(@Query() q: PaginationQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    return this.svc.findDeleted(page, limit);
  }

  @Patch("restore/:id")
  async restore(@Param("id") id: string) {
    return this.svc.restore(id);
  }
}
