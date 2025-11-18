// src/modules/production/corrugator-process/dto/update-corrugator-process.dto.ts

import { IsEnum, IsNumber, IsOptional, Min } from "class-validator";
import { CorrugatorProcessStatus } from "../../schemas/manufacturing-order.schema";

/**
 * DTO (Data Transfer Object) để cập nhật
 * số lượng hoặc trạng thái cho một Quy trình sóng.
 */
export class UpdateCorrugatorProcessDto {
  @IsOptional()
  @IsNumber({}, { message: "manufacturedAmount phải là một con số." })
  @Min(0, { message: "manufacturedAmount không được là số âm." })
  manufacturedAmount?: number;

  @IsOptional()
  @IsEnum(CorrugatorProcessStatus, {
    message: `Trạng thái không hợp lệ. Phải là một trong các giá trị: ${Object.values(
      CorrugatorProcessStatus,
    ).join(", ")}`,
  })
  status?: CorrugatorProcessStatus;
}
