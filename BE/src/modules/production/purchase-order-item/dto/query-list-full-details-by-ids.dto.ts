import { PageRequest } from "@/common/dto/page.request.dto";
import { PageResponse } from "@/common/dto/page.response.dto";
import { PurchaseOrderItem } from "../../schemas/purchase-order-item.schema";
import mongoose, { isValidObjectId } from "mongoose";
import { BaseResponse } from "@/common/dto/response.dto";
import { FullDetailPurchaseOrderItemDto } from "./full-details-orders.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import check from "check-types";
import { IsArray, IsMongoId, IsOptional } from "class-validator";
import { BadRequestException } from "@nestjs/common";

export class QueryListFullDetailsPurchaseOrderItemByIdsRequestDto {
  @ApiProperty({ type: [String], example: ["6745a4e9f1...", "6745a4f7c9..."] })
  @Transform(({ value }) => {
    const arr = Array.isArray(value)
      ? value
      : String(value).split(",").filter(Boolean);
    try {
      return arr.map((v) => new mongoose.Types.ObjectId(v as string));
    } catch (_e) {
      throw new BadRequestException(`Invalid ObjectId in "ids" parameter`);
    }
  })
  @IsArray()
  ids: mongoose.Types.ObjectId[];
}

export class QueryListFullDetailsPurchaseOrderItemByIdsResponseDto extends BaseResponse<
  FullDetailPurchaseOrderItemDto[]
> { }
