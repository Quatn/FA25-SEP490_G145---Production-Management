// src/modules/production/corrugator-process/corrugator-process.controller.ts

import { Controller, Patch, Body, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { BaseResponse } from '@/common/dto/response.dto';
import { CorrugatorProcessService } from './corrugator-process.service';
import { CorrugatorProcessesDto } from './dto/corrugator-processes.dto';
import { UpdateCorrugatorProcessDto } from './dto/update-corrugator-process.dto';
import { UpdateManyCorrugatorProcessesDto } from './dto/update-many-corrugator-processes.dto';
import { CorrugatorProcess } from '../schemas/corrugator-process.schema';

@Controller('corrugator-process')
export class CorrugatorProcessController {
  constructor(private readonly cpService: CorrugatorProcessService) {}

  @Patch('run') // Endpoint: PATCH /corrugator-process/run
  @ApiOperation({ summary: 'Chuyển trạng thái nhiều quy trình sóng sang RUNNING dựa trên MO' })
  async runProcesses(@Body() dto: CorrugatorProcessesDto): Promise<BaseResponse<any>> {
    const result = await this.cpService.runSelectedProcesses(dto.moIds);
    return {
      success: true,
      message: `Đã cập nhật ${result.modifiedCount} quy trình sóng sang trạng thái RUNNING.`,
      data: result,
    };
  }

  @Patch('update-many')
  @ApiOperation({ summary: 'Cập nhật trạng thái cho nhiều quy trình sóng cùng lúc' })
  async updateMany(
    @Body() dto: UpdateManyCorrugatorProcessesDto,
  ): Promise<BaseResponse<any>> {
    const result = await this.cpService.updateManyProcesses(dto);
    return {
      success: true,
      message: `Đã cập nhật ${result.successCount} quy trình sóng. ${result.failedCount > 0 ? `${result.failedCount} quy trình thất bại.` : ''}`,
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật trạng thái hoặc số lượng cho một quy trình sóng' })
  async updateOne(
    @Param('id') id: string,
    @Body() dto: UpdateCorrugatorProcessDto,
  ): Promise<BaseResponse<CorrugatorProcess>> {
    const result = await this.cpService.updateOneProcess(id, dto);
    return {
      success: true,
      message: 'Cập nhật quy trình sóng thành công',
      data: result,
    };
  }
}