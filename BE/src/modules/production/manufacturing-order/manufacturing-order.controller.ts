import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ManufacturingOrderService } from "./manufacturing-order.service";
import { ApiExtraModels, ApiOperation } from "@nestjs/swagger";
import { BaseResponse } from "@/common/dto/response.dto";
import {
  ManufacturingOrder,
  ManufacturingOrderDocument,
} from "../schemas/manufacturing-order.schema";
import {
  AssembledCreateManufacturingOrderRequestDto,
  CreateManufacturingOrderRequestDto,
} from "./dto/create-order-request.dto";
import {
  QueryListManufacturingOrderRequestDto,
  QueryListManufacturingOrderResponseDto,
} from "./dto/query-list.dto";
import { FullDetailManufacturingOrderDto } from "./dto/full-details-orders.dto";
import { ApiResponseWith } from "@/common/decorators/swagger-response-docs";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PurchaseOrderItemService } from "../purchase-order-item/purchase-order-item.service";
import { QueryListFullDetailsPurchaseOrderItemByIdsRequestDto } from "../purchase-order-item/dto/query-list-full-details-by-ids.dto";
import {
  CreateManyManufacturingOrdersRequestDto,
  CreateManyManufacturingOrdersResponseDto,
} from "./dto/create-many-orders.dto";
import mongoose from "mongoose";
import { FindAllMoQueryDto } from "./dto/find-all-mo-query.dto";
import { UpdateOverallStatusDto } from "./dto/update-overall-status.dto";

@Controller("manufacturing-order")
// The decorator below is used to configure swagger to display accurate schema and example, don't bother with it if you don't care about documenting on swagger
@ApiExtraModels(
  BaseResponse,
  ManufacturingOrder,
  FullDetailManufacturingOrderDto,
)
export class ManufacturingOrderController {
  constructor(
    private moService: ManufacturingOrderService,
    private poiService: PurchaseOrderItemService,
  ) { }

  @Get('tracking-list')
  @ApiOperation({
    summary: 'List all manufacturing orders (populated, filtered, paginated)',
  })
  async findAll(
    // 1. Dùng @Query() để nhận DTO chứa các tham số filter/pagination
    @Query() queryDto: FindAllMoQueryDto,
  ): Promise<BaseResponse<any>> { // 2. Cập nhật kiểu trả về (hoặc dùng 'any')
    
    // 3. Truyền DTO vào service
    const paginatedResult = await this.moService.findAllPopulated(queryDto);
    
    return {
      success: true,
      message: 'Fetch successful',
      // 4. Trả về toàn bộ đối tượng phân trang (data, total, page, limit)
      data: paginatedResult,
    };
  }

  @Patch(':id/status') // Endpoint mới: PATCH /manufacturing-order/some-id/status
  @ApiOperation({ summary: 'Update MO overall status (Pause/Cancel)' })
  async updateOverallStatus(
    @Param('id') id: string,
    @Body() body: UpdateOverallStatusDto,
  ): Promise<BaseResponse<ManufacturingOrderDocument>> {
    const result = await this.moService.updateOverallStatus(id, body);
    return {
      success: true,
      message: 'Cập nhật trạng thái tổng thể thành công',
      data: result,
    };
  }

  // @UseGuards(JwtAuthGuard)
  @Get("query/full-details")
  @ApiOperation({ summary: "Query fully populated manufacturing orders" })
  // The decorator below is used to configure swagger to display accurate schema and example, don't bother with it if you don't care about documenting on swagger
  @ApiResponseWith(FullDetailManufacturingOrderDto, { paginated: true })
  async queryListFullDetails(
    @Query() query: QueryListManufacturingOrderRequestDto,
  ): Promise<QueryListManufacturingOrderResponseDto> {
    const docs = await this.moService.queryListFullDetails(query);
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  @Get("draft-orders-by-poi-ids")
  @ApiOperation({ summary: "Query fully populated manufacturing orders" })
  @ApiResponseWith(FullDetailManufacturingOrderDto, { paginated: true })
  async draftOrderByPoisIds(
    @Query() query: QueryListFullDetailsPurchaseOrderItemByIdsRequestDto,
  ): Promise<BaseResponse<FullDetailManufacturingOrderDto[]>> {
    const pois = await this.poiService.queryListFullDetailsByIds(query);

    const docs = await this.moService.draftOrderByFullDetailsPois({
      purchaseOrderItems: pois,
    });
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  // @UseGuards(JwtAuthGuard)
  @Post("create")
  @ApiOperation({ summary: "Create one manufacturing order" })
  async createOne(
    @Body() body: CreateManufacturingOrderRequestDto,
  ): Promise<BaseResponse<ManufacturingOrder>> {
    const result = await this.moService.createOne(body);
    return {
      success: true,
      message: 'Fetch successful',
      data: result,
    };
  }

  @Post("create-many")
  @ApiOperation({ summary: "Query fully populated manufacturing orders" })
  @ApiResponseWith(FullDetailManufacturingOrderDto)
  async createMany(
    @Body() body: CreateManyManufacturingOrdersRequestDto,
  ): Promise<CreateManyManufacturingOrdersResponseDto> {
    const ids = body.orders.map((order) => order.purchaseOrderItemId);

    const pois = await this.poiService.queryListFullDetailsByIds({ ids: ids });

    if (body.orders.length !== pois.length) {
      throw new BadRequestException(
        `Length mismatch between the amount of manufacturing orders to create and the amount of purchase purchase order items found: ${body.orders.length} vs ${pois.length}. Is is possible that some manufacturing order's purchaseOrderItemCode did not point to real or non-deleted purchase order items`,
      );
    }

    const assembledDto: AssembledCreateManufacturingOrderRequestDto[] =
      body.orders.map((mo, i) => ({
        ...mo,
        purchaseOrderItem: pois[i],
      }));

    const docs = await this.moService.createMany(assembledDto);
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }
}
