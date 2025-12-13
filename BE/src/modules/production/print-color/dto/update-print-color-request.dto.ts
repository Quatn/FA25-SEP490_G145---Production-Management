import { PartialType } from '@nestjs/mapped-types';
import { CreatePrintColorRequestDto } from './create-print-color-request.dto';

export class UpdatePrintColorRequestDto extends PartialType(CreatePrintColorRequestDto) {}
