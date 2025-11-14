import { Body, Controller, Patch, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { BaseResponse } from '@/common/dto/response.dto';
import { ManufacturingOrderProcessService } from './manufacturing-order-process.service';
import { UpdateManufacturingOrderProcessDto } from './dto/update-manufacturing-order-process.dto';
import { ManufacturingOrderProcess } from '../schemas/manufacturing-order-process.schema';

@Controller('manufacturing-order-process')
export class ManufacturingOrderProcessController {
  constructor(private mopService: ManufacturingOrderProcessService) {}

  @Patch(':id') // Endpoint: PATCH /manufacturing-order-process/some-process-id
  @ApiOperation({ summary: 'Update status/amount of one process' })
  async updateOne(
    @Param('id') id: string,
    @Body() body: UpdateManufacturingOrderProcessDto,
  ): Promise<BaseResponse<ManufacturingOrderProcess>> {
    const result = await this.mopService.updateOneProcess(id, body);
    return {
      success: true,
      message: 'Cập nhật công đoạn thành công',
      data: result,
    };
  }
}