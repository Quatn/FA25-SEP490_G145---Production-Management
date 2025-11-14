import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { OrderStatus } from "../../schemas/manufacturing-order.schema";

export class UpdateOverallStatusDto {
  @ApiProperty({
    example: "PAUSED",
    description: "Trạng thái tổng thể mới (chỉ PAUSED hoặc CANCELLED)",
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
