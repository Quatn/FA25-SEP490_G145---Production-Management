import { PartialType } from "@nestjs/mapped-types";
import { CreateCustomerRequestDto } from "./create-customer-request.dto";

export class UpdateCustomerRequestDto extends PartialType(CreateCustomerRequestDto) { }
