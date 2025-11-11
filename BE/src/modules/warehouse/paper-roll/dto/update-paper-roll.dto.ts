import { PartialType } from '@nestjs/swagger';
import { CreatePaperRollDto } from './create-paper-roll.dto';

export class UpdatePaperRollDto extends PartialType(CreatePaperRollDto) {}
