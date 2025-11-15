import { BaseResponse } from "@/common/dto/response.dto";
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiExtraModels, ApiOperation } from "@nestjs/swagger";
import { PurchaseOrder } from "../schemas/purchase-order.schema";
import { PurchaseOrderService } from "./purchase-order.service";
import { ApiResponseWith } from "@/common/decorators/swagger-response-docs";
import {
  QueryListPurchaseOrderRequestDto,
  QueryListPurchaseOrderResponseDto,
} from "./dto/query-list.dto";
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto";
import { UpdatePurchaseOrderDto } from "./dto/update-purchase-order.dto";
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

  @Get('detail/:id')
  @ApiOperation({ summary: 'Purchase order detail' })
  async findOne(@Param('id') id: string): Promise<BaseResponse<PurchaseOrder>> {
    const doc = await this.poService.findOne(id);
    return { success: true, message: 'Fetch successful', data: doc };
  }

  @Post('create')
  @ApiOperation({ summary: 'Create new purchase order' })
  async create(@Body() dto: CreatePurchaseOrderDto): Promise<BaseResponse<PurchaseOrder>> {
    const doc = await this.poService.create(dto);
    return { success: true, message: `Created purchase order ${doc.code} successfully`, data: doc };
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update purchase order' })
  async update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto): Promise<BaseResponse<PurchaseOrder>> {
    const doc = await this.poService.updateOne(id, dto);
    return { success: true, message: `Updated purchase order ${doc.code} successfully`, data: doc };
  }

  @Delete('delete-soft/:id')
  @ApiOperation({ summary: 'Soft delete purchase order' })
  async softDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.poService.softDelete(id);
    return { success: true, message: 'Soft deleted successfully', data: null };
  }

  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restore purchase order' })
  async restore(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.poService.restore(id);
    return { success: true, message: 'Restored successfully', data: null };
  }

  @Delete('delete-hard/:id')
  @ApiOperation({ summary: 'Hard delete purchase order' })
  async hardDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.poService.removeHard(id);
    return { success: true, message: 'Permanently deleted successfully', data: null };
  }

  @Get("detailwithsub/:id")
  @ApiOperation({ summary: "Get purchase order with sub-POs and items (populated)" })
  async detailWithSubs(@Param("id") id: string): Promise<BaseResponse<any>> {
    const doc = await this.poService.getDetailWithSubs(id);
    return {
      success: true,
      message: "Fetch successful",
      data: doc,
    };
  }
}
