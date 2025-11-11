import { PartialType } from "@nestjs/mapped-types";
import { CreatePaperSupplierRequestDto } from "./create-paper-supplier-request.dto";

export class UpdatePaperSupplierRequestDto extends PartialType(CreatePaperSupplierRequestDto) { }
