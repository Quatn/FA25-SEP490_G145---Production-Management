import { IsArray, ArrayNotEmpty, IsOptional, IsString, IsEnum, IsDateString, IsMongoId } from 'class-validator';

export class CreateDeliveryNoteDto {
  @IsOptional()
  code?: number;


  @IsString()
  @IsMongoId()
  customer!: string;

  @IsArray()
  @ArrayNotEmpty()
  poitems!: any[];


  @IsEnum(['PENDINGAPPROVAL', 'APPROVED', 'EXPORTED', 'CANCELLED'])
  status!: 'PENDINGAPPROVAL' | 'APPROVED' | 'EXPORTED' | 'CANCELLED';


  @IsOptional()
  @IsDateString()
  date?: string;
}