import { IsArray, IsMongoId, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateOrderFinishingProcessDto } from './update-order-finishing-process.dto'; 

export class BulkUpdateOrderFinishingProcessDto {
    @IsArray()
    @IsMongoId({ each: true })
    ids: string[];

    @ValidateNested()
    @Type(() => UpdateOrderFinishingProcessDto)
    data: UpdateOrderFinishingProcessDto;
}