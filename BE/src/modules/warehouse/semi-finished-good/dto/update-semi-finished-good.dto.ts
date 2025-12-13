import { PartialType } from '@nestjs/swagger';
import { CreateSemiFinishedGoodDto } from './create-semi-finished-good.dto';

export class UpdateSemiFinishedGoodDto extends PartialType(CreateSemiFinishedGoodDto) { }
