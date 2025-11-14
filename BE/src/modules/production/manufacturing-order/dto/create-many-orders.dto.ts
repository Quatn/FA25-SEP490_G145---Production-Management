import { CreateManufacturingOrderRequestDto } from "./create-order-request.dto";

export class CreateManyManufacturingOrdersRequestDto {
  orders: CreateManufacturingOrderRequestDto[];
}
