import { PartialType } from '@nestjs/swagger';
import { CreateFluteCombinationDto } from './create-flute-combination.dto';

export class UpdateFluteCombinationDto extends PartialType(CreateFluteCombinationDto) {}
