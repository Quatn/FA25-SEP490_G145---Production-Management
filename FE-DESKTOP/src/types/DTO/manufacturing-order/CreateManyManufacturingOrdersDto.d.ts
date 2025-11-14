import { CreateManufacturingOrderRequestDto } from "./CreateManufacturingOrdersRequest";

export class CreateManyManufacturingOrdersRequestDto {
  orders: CreateManufacturingOrderRequestDto[];
}

export class CreateManyManufacturingOrdersResponseDto extends BaseResponse<
  CreateResult<{ codes: string[] }>
> {}
