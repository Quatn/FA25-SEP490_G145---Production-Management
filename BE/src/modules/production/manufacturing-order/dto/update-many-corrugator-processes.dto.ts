import { IsArray, IsEnum, IsMongoId } from "class-validator";
import { CorrugatorProcessStatus } from "../../schemas/manufacturing-order.schema";

export class UpdateManyCorrugatorProcessesDto {
  @IsArray()
  @IsMongoId({ each: true })
  moIds: string[];

  @IsEnum(CorrugatorProcessStatus, {
    message: `Trạng thái không hợp lệ. Phải là một trong các giá trị: RUNNING, PAUSED, CANCELLED, COMPLETED`,
  })
  status: CorrugatorProcessStatus;
}

