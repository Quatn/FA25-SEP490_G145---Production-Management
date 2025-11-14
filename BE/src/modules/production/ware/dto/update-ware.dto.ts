import { PartialType } from "@nestjs/mapped-types";
import { CreateWareDto } from "./create-ware.dto";

export class UpdateWareDto extends PartialType(CreateWareDto) {}

