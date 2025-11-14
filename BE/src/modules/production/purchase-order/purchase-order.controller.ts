import { BaseResponse } from "@/common/dto/response.dto";
import { Controller, Get, Query } from "@nestjs/common";
import { ApiExtraModels, ApiOperation } from "@nestjs/swagger";
import { PurchaseOrder } from "../schemas/purchase-order.schema";
import { PurchaseOrderService } from "./purchase-order.service";
import { ApiResponseWith } from "@/common/decorators/swagger-response-docs";
import {
  QueryListPurchaseOrderRequestDto,
  QueryListPurchaseOrderResponseDto,
} from "./dto/query-list.dto";
import { PaginatedList } from "@/common/dto/paginated-list.dto";
import {
  QueryOrdersWithUnmanufacturedItemsRequestDto,
  QueryOrdersWithUnmanufacturedItemsResponseDto,
} from "./dto/query-orders-with-unmanufactured-items.dto";

@Controller("purchase-order")
// The decorator below is used to configure swagger to display accurate schema and example, don't bother with it if you don't care about documenting on swagger
@ApiExtraModels(BaseResponse, PurchaseOrder)
export class PurchaseOrderController {
  constructor(private poService: PurchaseOrderService) { }

  @Get("query")
  @ApiOperation({ summary: "Query purchase order items" })
  // The decorator below is used to configure swagger to display accurate schema and example, don't bother with it if you don't care about documenting on swagger
  @ApiResponseWith(PurchaseOrder, { paginated: true })
  async queryList(
    @Query() query: QueryListPurchaseOrderRequestDto,
  ): Promise<QueryListPurchaseOrderResponseDto> {
    const docs = await this.poService.queryList(query);
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  @Get("query/not-fully-scheduled")
  @ApiOperation({ summary: "Query purchase order items" })
  @ApiResponseWith(PurchaseOrder, { paginated: true })
  async queryOrdersWithUnmanufacturedItems(
    @Query() query: QueryOrdersWithUnmanufacturedItemsRequestDto,
  ): Promise<
    BaseResponse<PaginatedList<QueryOrdersWithUnmanufacturedItemsResponseDto>>
  > {
    const docs = await this.poService.queryOrdersWithUnmanufacturedItems(query);
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }
}
