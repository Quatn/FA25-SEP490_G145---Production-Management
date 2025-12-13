import { PartialType } from '@nestjs/swagger';
import { CreateWareManufacturingProcessTypeDto } from './create-ware-manufacturing-process-type.dto';

export class UpdateWareManufacturingProcessTypeDto extends PartialType(CreateWareManufacturingProcessTypeDto) {}
