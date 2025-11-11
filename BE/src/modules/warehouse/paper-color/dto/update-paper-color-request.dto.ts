import { PartialType } from "@nestjs/mapped-types";
import { CreatePaperColorRequestDto } from "./create-paper-color-request.dto";

export class UpdatePaperColorRequestDto extends PartialType(CreatePaperColorRequestDto) { }
