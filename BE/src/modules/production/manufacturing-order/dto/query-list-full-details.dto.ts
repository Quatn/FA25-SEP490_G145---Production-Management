import { PageRequest } from "@/common/dto/page.request.dto";
import { PageResponse } from "@/common/dto/page.response.dto";
import { FullDetailManufacturingOrderDto } from "./full-details-orders.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";
import {
  CorrugatorLine,
  CorrugatorProcessStatus,
  ManufacturingOrderApprovalStatus,
} from "../../schemas/manufacturing-order.schema";
import { Transform } from "class-transformer";
import { BadRequestException } from "@nestjs/common";

export enum QueryListFullDetailsManufacturingOrderRequestSortOptions {
  Code = "code",
  Directive = "directive",
  ApprovalStatus = "approval_status",
  OperativeStatus = "operative_status",
  Amount = "amount",
  Inventory = "inventory",
  OrderDate = "order_date",
  DeliveryDate = "delivery_date",
  ManufacturingDate = "manufacturing_date"
}

export class QueryListFullDetailsManufacturingOrderRequestDto extends PageRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => {
    const arr = Array.isArray(value)
      ? value
      : String(value).split(",").filter(Boolean);
    return arr.map((v) => {
      if (
        Object.values(ManufacturingOrderApprovalStatus).includes(
          v as ManufacturingOrderApprovalStatus,
        )
      )
        return v as ManufacturingOrderApprovalStatus;

      throw new BadRequestException(
        `Every approvalStatuses query values must be one of the following: ${Object.values(ManufacturingOrderApprovalStatus).join(", ")}`,
      );
    });
  })
  @IsArray()
  @IsArray()
  approvalStatuses?: ManufacturingOrderApprovalStatus[];

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => {
    const arr = Array.isArray(value)
      ? value
      : String(value).split(",").filter(Boolean);
    return arr.map((v) => {
      if (Object.values(CorrugatorLine).includes(v as CorrugatorLine))
        return v as CorrugatorLine;

      throw new BadRequestException(
        `Every corrugatorLines query values must be one of the following: ${Object.values(CorrugatorLine).join(", ")}`,
      );
    });
  })
  @IsArray()
  @IsArray()
  corrugatorLines?: CorrugatorLine[];

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => {
    const arr = Array.isArray(value)
      ? value
      : String(value).split(",").filter(Boolean);
    return arr.map((v) => {
      if (
        Object.values(CorrugatorProcessStatus).includes(
          v as CorrugatorProcessStatus,
        )
      )
        return v as CorrugatorProcessStatus;

      throw new BadRequestException(
        `Every corrugatorProcessStatuses query values must be one of the following: ${Object.values(CorrugatorProcessStatus).join(", ")}`,
      );
    });
  })
  @IsArray()
  @IsArray()
  corrugatorProcessStatuses?: CorrugatorProcessStatus[];
}

export class QueryListFullDetailsManufacturingOrderResponseDto extends PageResponse<FullDetailManufacturingOrderDto> { }
