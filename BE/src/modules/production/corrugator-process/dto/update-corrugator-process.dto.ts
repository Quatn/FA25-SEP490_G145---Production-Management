// src/modules/production/corrugator-process/dto/update-corrugator-process.dto.ts

import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { CorrugatorProcessStatus } from '../../schemas/corrugator-process.schema';

/**
 * DTO (Data Transfer Object) để cập nhật
 * số lượng hoặc trạng thái cho một Quy trình sóng.
 */
export class UpdateCorrugatorProcessDto {
  /**
   * Số lượng đã sản xuất.
   * Phải là số, không âm, và là tùy chọn.
   */
  @IsOptional()
  @IsNumber({}, { message: 'manufacturedAmount phải là một con số.' })
  @Min(0, { message: 'manufacturedAmount không được là số âm.' })
  manufacturedAmount?: number;

  /**
   * Trạng thái mới của quy trình sóng.
   * Phải là một trong các giá trị của enum CorrugatorProcessStatus, và là tùy chọn.
   */
  @IsOptional()
  @IsEnum(CorrugatorProcessStatus, {
    message: `Trạng thái không hợp lệ. Phải là một trong các giá trị: ${Object.values(
      CorrugatorProcessStatus,
    ).join(', ')}`,
  })
  status?: CorrugatorProcessStatus;
}