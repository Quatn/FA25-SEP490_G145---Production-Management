import { PartialType } from "@nestjs/mapped-types";
import { CreatePaperTypeRequestDto } from "./create-paper-type-request.dto";

export class UpdatePaperTypeRequestDto extends PartialType(CreatePaperTypeRequestDto) { }
