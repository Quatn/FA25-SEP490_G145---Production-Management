import { IsEnum, IsNumber, IsOptional, Min } from "class-validator";
import { CorrugatorProcessStatus } from "../../schemas/manufacturing-order.schema";

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
