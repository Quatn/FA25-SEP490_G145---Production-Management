import { PartialType } from "@nestjs/mapped-types";
import { CreateManufacturingOrderRequestDto } from "./create-order-request.dto";

// Makes update dto have the exact same fields as create dto, except everything is optional
export class UpdateManufacturingOrderRequestDto extends PartialType(CreateManufacturingOrderRequestDto) { }
