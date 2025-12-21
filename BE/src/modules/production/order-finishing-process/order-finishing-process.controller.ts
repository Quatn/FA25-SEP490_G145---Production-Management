import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { OrderFinishingProcessService } from './order-finishing-process.service';
import { CreateOrderFinishingProcessDto } from './dto/create-order-finishing-process.dto';
import { UpdateOrderFinishingProcessDto } from './dto/update-order-finishing-process.dto';
import { GetOrderFinishingProcessDto } from './dto/get-order-finishing-process.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BaseResponse } from '@/common/dto/response.dto';
import { PaginatedList } from '@/common/dto/paginatedList.dto';
import { OrderFinishingProcess, OrderFinishingProcessDocument } from '../schemas/order-finishing-process.schema';
import { FindManyOrderFinishingProcessesByManufacturingOrderIdsRequestDto } from './dto/find-many-by-manufacturing-order-ids.dto';
import { BulkUpdateOrderFinishingProcessDto } from './dto/bulk-update-order-finishing-process.dto';
import { PrivilegedJwtAuthGuard } from '@/common/guards/privileged-jwt-auth.guard';
import { orderFinishingProcessAdminPrivileges, orderFinishingProcessCreatePrivileges, orderFinishingProcessGetPrivileges, orderFinishingProcessUpdatePrivileges } from './order-finishing-process-module-access-privileges';

const OrderFinishingProcessGetRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: orderFinishingProcessGetPrivileges,
});

const OrderFinishingProcessCreateRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: orderFinishingProcessCreatePrivileges,
});

const OrderFinishingProcessUpdateRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: orderFinishingProcessUpdatePrivileges,
});

const OrderFinishingProcessAdminRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: orderFinishingProcessAdminPrivileges,
});

@ApiBearerAuth("access-token")
@Controller('order-finishing-process')
export class OrderFinishingProcessController {
  constructor(
    private readonly service: OrderFinishingProcessService,
  ) { }

  // @UseGuards(OrderFinishingProcessGetRequestGuard)
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

  // @UseGuards(OrderFinishingProcessGetRequestGuard)
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

  // @UseGuards(OrderFinishingProcessGetRequestGuard)
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

  @UseGuards(OrderFinishingProcessCreateRequestGuard)
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

  @UseGuards(OrderFinishingProcessUpdateRequestGuard)
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

  @UseGuards(OrderFinishingProcessUpdateRequestGuard)
  @Patch('update-many')
  @ApiOperation({ summary: 'Update many finishing processes' })
  async updateMany(
    @Body() bulkDto: BulkUpdateOrderFinishingProcessDto,
  ): Promise<BaseResponse<any>> {

    const { ids, data } = bulkDto;

    const result = await this.service.updateMany(ids, data);

    return {
      success: true,
      message: 'Updated successfully',
      data: result,
    };
  }

  @UseGuards(OrderFinishingProcessUpdateRequestGuard)
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

  @UseGuards(OrderFinishingProcessAdminRequestGuard)
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

  @UseGuards(OrderFinishingProcessAdminRequestGuard)
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

  // @UseGuards(OrderFinishingProcessGetRequestGuard)
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

