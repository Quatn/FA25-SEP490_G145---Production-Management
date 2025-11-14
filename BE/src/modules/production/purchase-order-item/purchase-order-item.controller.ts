import { Controller, Get, Query } from "@nestjs/common";
import { ApiExtraModels, ApiOperation } from "@nestjs/swagger";
import { PurchaseOrderItem } from "../schemas/purchase-order-item.schema";
import { BaseResponse } from "@/common/dto/response.dto";
import { ApiResponseWith } from "@/common/decorators/swagger-response-docs";
import {
  QueryListPurchaseOrderItemRequestDto,
  QueryListPurchaseOrderItemResponseDto,
} from "./dto/query-list.dto";
import { PurchaseOrderItemService } from "./purchase-order-item.service";
import { FullDetailPurchaseOrderItemDto } from "./dto/full-details-orders.dto";
import {
  QueryListFullDetailsPurchaseOrderItemByIdsRequestDto,
  QueryListFullDetailsPurchaseOrderItemByIdsResponseDto,
} from "./dto/query-list-full-details-by-ids.dto";

@Controller("purchase-order-item")
// The decorator below is used to configure swagger to display accurate schema and example, don't bother with it if you don't care about documenting on swagger
@ApiExtraModels(BaseResponse, PurchaseOrderItem)
export class PurchaseOrderItemController {
  constructor(private poiService: PurchaseOrderItemService) { }

  @Get("query")
  @ApiOperation({ summary: "Query purchase order items" })
  // The decorator below is used to configure swagger to display accurate schema and example, don't bother with it if you don't care about documenting on swagger
  @ApiResponseWith(PurchaseOrderItem, { paginated: true })
  async queryList(
    @Query() query: QueryListPurchaseOrderItemRequestDto,
  ): Promise<QueryListPurchaseOrderItemResponseDto> {
    const docs = await this.poiService.queryList(query);
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  @Get("query/full-details")
  @ApiOperation({ summary: "Query fully populated purchase order items" })
  // The decorator below is used to configure swagger to display accurate schema and example, don't bother with it if you don't care about documenting on swagger
  @ApiResponseWith(FullDetailPurchaseOrderItemDto, { paginated: true })
  async queryListFullDetails(
    @Query() query: QueryListPurchaseOrderItemRequestDto,
  ): Promise<QueryListPurchaseOrderItemResponseDto> {
    const docs = await this.poiService.queryListFullDetails(query);
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  @Get("query/full-details/by-ids")
  @ApiOperation({
    summary: "Query fully populated purchase order items by their ids",
  })
  @ApiResponseWith(QueryListFullDetailsPurchaseOrderItemByIdsResponseDto)
  async queryListFullDetailsByIds(
    @Query() query: QueryListFullDetailsPurchaseOrderItemByIdsRequestDto,
  ): Promise<QueryListFullDetailsPurchaseOrderItemByIdsResponseDto> {
    const docs = await this.poiService.queryListFullDetailsByIds(query);
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }
}
