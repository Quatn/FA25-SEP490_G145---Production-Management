import { BaseResponse } from "@/common/dto/response.dto";
import { IsArray, IsMongoId } from "class-validator";
import { OrderFinishingProcess } from "../../schemas/order-finishing-process.schema";
import { Types } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { BadRequestException } from "@nestjs/common";

export class FindManyOrderFinishingProcessesByManufacturingOrderIdsRequestDto {
  @ApiProperty({ type: [String], example: ["6745a4e9f1...", "6745a4f7c9..."] })
  @Transform(({ value }) => {
    const arr = Array.isArray(value)
      ? value
      : String(value).split(",").filter(Boolean);
    try {
      return arr.map((v) => new Types.ObjectId(v as string));
    } catch (_e) {
      throw new BadRequestException(`Invalid ObjectId in "orders" parameter`);
    }
  })
  @IsArray()
  orders: Types.ObjectId[];
}

export class FindManyOrderFinishingProcessesByManufacturingOrderIdsResponseDto extends BaseResponse<
  OrderFinishingProcess[]
> { }
