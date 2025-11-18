import { PageRequest } from "@/common/dto/page.request.dto";
import { PageResponse } from "@/common/dto/page.response.dto";
import { FullDetailManufacturingOrderDto } from "./full-details-orders.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class QueryListFullDetailsManufacturingOrderRequestDto extends PageRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  query?: string;
}

export class QueryListFullDetailsManufacturingOrderResponseDto extends PageResponse<FullDetailManufacturingOrderDto> { }
