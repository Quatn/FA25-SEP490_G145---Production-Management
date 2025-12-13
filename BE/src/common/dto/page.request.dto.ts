import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional } from "class-validator";

export class PageRequest {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit: number = 20;
}
