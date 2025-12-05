import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OrderFinishingProcessService } from './order-finishing-process.service';
import { CreateOrderFinishingProcessDto } from './dto/create-order-finishing-process.dto';
import { UpdateOrderFinishingProcessDto } from './dto/update-order-finishing-process.dto';
import { GetOrderFinishingProcessDto } from './dto/get-order-finishing-process.dto';
import { ApiOperation } from '@nestjs/swagger';
import { BaseResponse } from '@/common/dto/response.dto';
import { PaginatedList } from '@/common/dto/paginatedList.dto';
import { OrderFinishingProcess, OrderFinishingProcessDocument } from '../schemas/order-finishing-process.schema';
import { FindManyOrderFinishingProcessesByManufacturingOrderIdsRequestDto } from './dto/find-many-by-manufacturing-order-ids.dto';

@Controller('order-finishing-process')
export class OrderFinishingProcessController {
  constructor(
    private readonly service: OrderFinishingProcessService,
  ) { }

  @Get('list')
  @ApiOperation({ summary: 'List paginated finishing processes' })
  async findPaginated(
    @Query() query: GetOrderFinishingProcessDto,
  ): Promise<BaseResponse<PaginatedList<OrderFinishingProcessDocument>>> {
    const data = await this.service.findPaginated(query);

    return {
      success: true,
      message: 'Fetch successful',
      data,
    };
  }


  @Get('list-all')
  @ApiOperation({ summary: 'List all finishing processes' })
  async findAll(): Promise<BaseResponse<OrderFinishingProcessDocument[]>> {
    const data = await this.service.findAll();

    return {
      success: true,
      message: 'Fetch successful',
      data,
    };
  }

  @Get('detail/:id')
  @ApiOperation({ summary: 'Get finishing process detail' })
  async findOne(
    @Param('id') id: string,
  ): Promise<BaseResponse<OrderFinishingProcessDocument>> {
    const data = await this.service.findOne(id);

    return {
      success: true,
      message: 'Fetch successful',
      data,
    };
  }

  @Post('create')
  @ApiOperation({ summary: 'Create new finishing process' })
  async create(
    @Body() dto: CreateOrderFinishingProcessDto,
  ): Promise<BaseResponse<OrderFinishingProcessDocument>> {
    const data = await this.service.create(dto);

    return {
      success: true,
      message: 'Created successfully',
      data,
    };
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update finishing process' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderFinishingProcessDto,
  ): Promise<BaseResponse<OrderFinishingProcessDocument>> {
    const data = await this.service.update(id, dto);

    return {
      success: true,
      message: 'Updated successfully',
      data,
    };
  }

  @Delete('delete-soft/:id')
  @ApiOperation({ summary: 'Soft delete finishing process' })
  async softDelete(
    @Param('id') id: string,
  ): Promise<BaseResponse<null>> {
    await this.service.softRemove(id);

    return {
      success: true,
      message: 'Soft deleted successfully',
      data: null,
    };
  }

  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restore soft-deleted finishing process' })
  async restore(
    @Param('id') id: string,
  ): Promise<BaseResponse<null>> {
    await this.service.restore(id);

    return {
      success: true,
      message: 'Restored successfully',
      data: null,
    };
  }

  @Delete('delete-hard/:id')
  @ApiOperation({ summary: 'Hard delete finishing process' })
  async hardDelete(
    @Param('id') id: string,
  ): Promise<BaseResponse<null>> {
    await this.service.hardRemove(id);

    return {
      success: true,
      message: 'Permanently deleted successfully',
      data: null,
    };
  }


  @Get("find-by-manufacturing-order-id")
  @ApiOperation({ summary: "Find all order finishing process that have which have mo ids in the query" })
  async findByManufacturingOrderId(
    @Query() query: FindManyOrderFinishingProcessesByManufacturingOrderIdsRequestDto,
  ): Promise<BaseResponse<OrderFinishingProcess[]>> {
    const res = await this.service.findManyByManufacturingOrderIds(query.orders);

    return {
      success: true,
      message: "Fetch successful",
      data: res,
    };
  }
}

