import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ManufacturingOrderService } from "./manufacturing-order.service";
import { ApiExtraModels, ApiOperation } from "@nestjs/swagger";
import { BaseResponse } from "@/common/dto/response.dto";
import {
  ManufacturingOrder,
  ManufacturingOrderDocument,
} from "../schemas/manufacturing-order.schema";
import { CreateManufacturingOrderRequestDto } from "./dto/create-order-request.dto";
import {
  QueryListManufacturingOrderRequestDto,
  QueryListManufacturingOrderResponseDto,
} from "./dto/query-list.dto";
import { FullDetailManufacturingOrderDto } from "./dto/full-details-orders.dto";
import { ApiResponseWith } from "@/common/decorators/swagger-response-docs";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";

@Controller("manufacturing-order")
// The decorator below is used to configure swagger to display accurate schema and example, don't bother with it if you don't care about documenting on swagger
@ApiExtraModels(
  BaseResponse,
  ManufacturingOrder,
  FullDetailManufacturingOrderDto,
)
export class ManufacturingOrderController {
  constructor(private moService: ManufacturingOrderService) { }

  // @UseGuards(JwtAuthGuard)
  @Get("list-all")
  @ApiOperation({ summary: "List manufacturing orders" })
  async findAll(): Promise<BaseResponse<ManufacturingOrderDocument[]>> {
    const docs = await this.moService.findAll();
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  @Get("query")
  @ApiOperation({ summary: "Query manufacturing orders" })
  // The decorator below is used to configure swagger to display accurate schema and example, don't bother with it if you don't care about documenting on swagger
  @ApiResponseWith(ManufacturingOrder, { paginated: true })
  async queryList(
    @Query() query: QueryListManufacturingOrderRequestDto,
  ): Promise<QueryListManufacturingOrderResponseDto> {
    const docs = await this.moService.queryList(query);
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
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

  // @UseGuards(JwtAuthGuard)
  @Post("create")
  @ApiOperation({ summary: "Create one manufacturing order" })
  async createOne(
    @Body() body: CreateManufacturingOrderRequestDto,
  ): Promise<BaseResponse<ManufacturingOrder>> {
    const result = await this.moService.createOne(body);
    return {
      success: true,
      message: "Fetch successul",
      data: result,
    };
  }
}
