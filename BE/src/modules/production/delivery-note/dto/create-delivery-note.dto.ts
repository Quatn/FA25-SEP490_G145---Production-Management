// production/delivery-note/dto/create-delivery-note.dto.ts
import { IsArray, ArrayNotEmpty, IsOptional, IsString, IsEnum, IsDateString, IsMongoId } from 'class-validator';

export class CreateDeliveryNoteDto {
  @IsOptional()
  code?: number;

  @IsString()
  @IsMongoId()
  customer!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  poitems!: string[]; 

  @IsEnum(['PENDINGAPPROVAL', 'APPROVED', 'CONFIRMEDAPPROVAL'])
  status!: 'PENDINGAPPROVAL' | 'APPROVED' | 'CONFIRMEDAPPROVAL';

  @IsOptional()
  @IsDateString()
  date?: string;
}
