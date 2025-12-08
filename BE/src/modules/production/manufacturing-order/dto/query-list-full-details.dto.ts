import { PageRequest } from "@/common/dto/page.request.dto";
import { PageResponse } from "@/common/dto/page.response.dto";
import { FullDetailManufacturingOrderDto } from "./full-details-orders.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";
import { CorrugatorProcessStatus } from "../../schemas/manufacturing-order.schema";
import { Transform } from "class-transformer";
import { BadRequestException } from "@nestjs/common";

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
