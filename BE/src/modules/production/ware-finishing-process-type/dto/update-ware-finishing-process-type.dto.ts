import { PartialType } from '@nestjs/swagger';
import { CreateWareFinishingProcessTypeDto } from './create-ware-finishing-process-type.dto';

export class UpdateWareFinishingProcessTypeDto extends PartialType(CreateWareFinishingProcessTypeDto) {}