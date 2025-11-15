// src/modules/production/corrugator-process/dto/run-corrugator-processes.dto.ts
import { IsArray, IsMongoId } from "class-validator";

export class CorrugatorProcessesDto {
  @IsArray()
  @IsMongoId({ each: true })
  moIds: string[]; // Danh sách các ID của ManufacturingOrder
}
