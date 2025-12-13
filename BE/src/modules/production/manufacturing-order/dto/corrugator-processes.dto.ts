import { IsArray, IsMongoId } from "class-validator";

/** @deprecated Will be removed when proper dtos are implemented */
export class CorrugatorProcessesDto {
  @IsArray()
  @IsMongoId({ each: true })
  moIds: string[]; // Danh sách các ID của ManufacturingOrder
}
