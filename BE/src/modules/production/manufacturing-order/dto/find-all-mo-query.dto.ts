import { Type } from "class-transformer";
import { IsOptional, IsString, IsNumber, Min, IsDate } from "class-validator";

export class FindAllMoQueryDto {
  // 1. Search theo code
  @IsOptional()
  @IsString()
  search_code?: string;

  // 2. Filter theo corrugatorLine
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  corrugatorLine?: number;

  @IsOptional()
  @IsString()
  overallStatus?: string;

  // 2.1. Filter theo trạng thái quy trình sóng
  @IsOptional()
  @IsString()
  corrugatorProcessStatus?: string;

  // 3. Filter theo ngày sản xuất (manufacturingDate)
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  mfg_date_from?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  mfg_date_to?: Date;

  // 4. Filter theo ngày yêu cầu (requestedDatetime)
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  req_date_from?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  req_date_to?: Date;

  // 5. Phân trang
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
