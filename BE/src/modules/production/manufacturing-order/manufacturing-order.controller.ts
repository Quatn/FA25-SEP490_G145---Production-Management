import { Body, Controller, Get, Post, Param, Patch, Query } from '@nestjs/common'; // Thêm Query
import { ManufacturingOrderService } from './manufacturing-order.service';
import { ApiOperation } from '@nestjs/swagger';
import { BaseResponse } from '@/common/dto/response.dto';
import {
  ManufacturingOrder,
  ManufacturingOrderDocument,
} from './schemas/manufacturing-order.schema';
import { CreateManufacturingOrderRequestDto } from './dto/create-order-request.dto';
import { UpdateOverallStatusDto } from './dto/update-overall-status.dto';
import { FindAllMoQueryDto } from './dto/find-all-mo-query.dto'; // Import DTO truy vấn mới

@Controller('manufacturing-order')
export class ManufacturingOrderController {
  constructor(private moService: ManufacturingOrderService) {}

  @Get('tracking-list')
  @ApiOperation({
    summary: 'List all manufacturing orders (populated, filtered, paginated)',
  })
  async findAll(
    // 1. Dùng @Query() để nhận DTO chứa các tham số filter/pagination
    @Query() queryDto: FindAllMoQueryDto,
  ): Promise<BaseResponse<any>> { // 2. Cập nhật kiểu trả về (hoặc dùng 'any')
    
    // 3. Truyền DTO vào service
    const paginatedResult = await this.moService.findAllPopulated(queryDto);
    
    return {
      success: true,
      message: 'Fetch successful',
      // 4. Trả về toàn bộ đối tượng phân trang (data, total, page, limit)
      data: paginatedResult,
    };
  }

  @Patch(':id/status') // Endpoint mới: PATCH /manufacturing-order/some-id/status
  @ApiOperation({ summary: 'Update MO overall status (Pause/Cancel)' })
  async updateOverallStatus(
    @Param('id') id: string,
    @Body() body: UpdateOverallStatusDto,
  ): Promise<BaseResponse<ManufacturingOrderDocument>> {
    const result = await this.moService.updateOverallStatus(id, body);
    return {
      success: true,
      message: 'Cập nhật trạng thái tổng thể thành công',
      data: result,
    };
  }

  // Giữ nguyên endpoint 'create' của bạn
  @Post('create')
  @ApiOperation({ summary: 'Create one manufacturing order' })
  async createOne(
    @Body() body: CreateManufacturingOrderRequestDto,
  ): Promise<BaseResponse<ManufacturingOrder>> {
    const result = await this.moService.createOne(body);
    return {
      success: true,
      message: 'Fetch successful',
      data: result,
    };
  }
}