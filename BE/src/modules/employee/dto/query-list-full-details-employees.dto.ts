import { PageRequest } from "@/common/dto/page.request.dto";
import { PageResponse } from "@/common/dto/page.response.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { FullDetailEmployeeDto } from "./full-details-employees.dto";

export class QueryListFullDetailsEmployeeRequestDto extends PageRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  query?: string;
}

export class QueryListFullDetailsEmployeeResponseDto extends PageResponse<FullDetailEmployeeDto> { }
