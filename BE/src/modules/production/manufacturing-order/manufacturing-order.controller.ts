import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { ManufacturingOrderService } from "./manufacturing-order.service";
import { ApiOperation } from "@nestjs/swagger";
import { BaseResponse } from "@/common/dto/response.dto";
import {
  ManufacturingOrder,
  ManufacturingOrderDocument,
} from "../schemas/manufacturing-order.schema";
import { CreateManufacturingOrderRequestDto } from "./dto/create-order-request.dto";

@Controller("manufacturing-order")
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
