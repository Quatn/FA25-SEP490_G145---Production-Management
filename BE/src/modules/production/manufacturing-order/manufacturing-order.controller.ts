import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ManufacturingOrderService } from "./manufacturing-order.service";
import { ApiBearerAuth, ApiExtraModels, ApiOperation } from "@nestjs/swagger";
import { BaseResponse } from "@/common/dto/response.dto";
import {
  ManufacturingOrder,
  ManufacturingOrderDocument,
} from "../schemas/manufacturing-order.schema";
import {
  AssembledCreateManufacturingOrderRequestDto,
  CreateManufacturingOrderRequestDto,
} from "./dto/create-order-request.dto";
import { QueryListManufacturingOrderResponseDto } from "./dto/query-list.dto";
import { FullDetailManufacturingOrderDto } from "./dto/full-details-orders.dto";
import { ApiResponseWith } from "@/common/decorators/swagger-response-docs";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PurchaseOrderItemService } from "../purchase-order-item/purchase-order-item.service";
import { QueryListFullDetailsPurchaseOrderItemByIdsRequestDto } from "../purchase-order-item/dto/query-list-full-details-by-ids.dto";
import {
  CreateManyManufacturingOrdersRequestDto,
  CreateManyManufacturingOrdersResponseDto,
} from "./dto/create-many-orders.dto";
import { DeleteResult } from "@/common/dto/delete-result.dto";
import { DeleteManufacturingOrderRequestDto } from "./dto/delete-order-request.dto";
import { PatchResult } from "@/common/dto/patch-result.dto";
import {
  UpdateManyManufacturingOrdersRequestDto,
  UpdateManyManufacturingOrdersResponseDto,
} from "./dto/update-many-orders.dto";
import { AssembledUpdateManufacturingOrderRequestDto } from "./dto/update-order-request.dto";
import { QueryListFullDetailsManufacturingOrderRequestDto } from "./dto/query-list-full-details.dto";
import check from "check-types";
import { PrivilegedJwtAuthGuard } from "@/common/guards/privileged-jwt-auth.guard";
import { manufacturingOrderGetPrivileges } from "./manufacturing-order-module-access-privileges";
import { buildFullDetailsMOFilterFromDto } from "./utils/buildFullDetailsFilterFromDto";

const ManufacturingOrderGetRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: manufacturingOrderGetPrivileges,
});

@ApiBearerAuth("access-token")
@Controller("manufacturing-order")
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

  @UseGuards(ManufacturingOrderGetRequestGuard)
  @Get("list-all")
  @ApiOperation({ summary: "List manufacturing orders" })
  async listAll(): Promise<BaseResponse<ManufacturingOrderDocument[]>> {
    const docs = await this.moService.findAll();
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
    @Query() query: QueryListFullDetailsManufacturingOrderRequestDto,
  ): Promise<QueryListManufacturingOrderResponseDto> {
    const docs = await this.moService.queryListFullDetails({
      ...query,
      filter: buildFullDetailsMOFilterFromDto(query),
    });
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
      message: "Fetch successful",
      data: result,
    };
  }

  @Post("create-many")
  @ApiOperation({ summary: "Create many manufacturing orders" })
  // @ApiResponseWith(FullDetailManufacturingOrderDto)
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

  @Patch("update-many")
  @ApiOperation({ summary: "Update many manufacturing orders" })
  // @ApiResponseWith(FullDetailManufacturingOrderDto)
  async updateMany(
    @Body() body: UpdateManyManufacturingOrdersRequestDto,
  ): Promise<UpdateManyManufacturingOrdersResponseDto> {
    const assembledDto: AssembledUpdateManufacturingOrderRequestDto[] =
      body.orders.map((mo, _i) => ({
        ...mo,
        // purchaseOrderItem: pois[i],
      }));

    const docs = await this.moService.updateMany(assembledDto);
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  @Delete("id/:id")
  @ApiOperation({ summary: "Delete one manufacturing order" })
  async deleteOne(@Param() param: DeleteManufacturingOrderRequestDto): Promise<
    BaseResponse<
      DeleteResult<{
        code: string;
        orderProcessDeleteResult: DeleteResult;
      }>
    >
  > {
    const result = await this.moService.deleteOne(param.id);
    return {
      success: true,
      message: "Fetch successful",
      data: result,
    };
  }

  @Patch("restore/:id")
  @ApiOperation({ summary: "Create one manufacturing order" })
  async RestoreOne(
    @Param() param: DeleteManufacturingOrderRequestDto,
  ): Promise<BaseResponse<PatchResult<{ code: string }>>> {
    const result = await this.moService.restoreOne(param.id);
    return {
      success: true,
      message: "Restore successful",
      data: result,
    };
  }
}
