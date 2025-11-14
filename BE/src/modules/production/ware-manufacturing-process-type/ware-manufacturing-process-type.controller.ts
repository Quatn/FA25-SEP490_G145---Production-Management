import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { WareManufacturingProcessTypeService } from './ware-manufacturing-process-type.service';
import { CreateWareManufacturingProcessTypeDto } from './dto/create-ware-manufacturing-process-type.dto';
import { UpdateWareManufacturingProcessTypeDto } from './dto/update-ware-manufacturing-process-type.dto';
import { WareManufacturingProcessType } from '../schemas/ware-manufacturing-process-type.schema';
import { BaseResponse } from '@/common/dto/response.dto';
import { PaginatedList } from '@/common/dto/paginatedList.dto';

@Controller('ware-manufacturing-process-type')
export class WareManufacturingProcessTypeController {
  constructor(private readonly service: WareManufacturingProcessTypeService) { }

  @Get('list')
  @ApiOperation({ summary: 'List paginated ware manufacturing process types' })
  async findPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<BaseResponse<PaginatedList<WareManufacturingProcessType>>> {
    const docs = await this.service.findPaginated(page, limit, search);
    return {
      success: true,
      message: 'Fetch successful',
      data: docs,
    };
  }

  @Get('list-all')
  @ApiOperation({ summary: 'List ware manufacturing process types' })
  async findAll(): Promise<BaseResponse<WareManufacturingProcessType[]>> {
    const docs = await this.service.findAll();
    return {
      success: true,
      message: 'Fetch successful',
      data: docs,
    };
  }

  @Get('detail/:id')
  @ApiOperation({ summary: 'Ware manufacturing process type detail' })
  async findOne(@Param('id') id: string): Promise<BaseResponse<WareManufacturingProcessType>> {
    const doc = await this.service.findOne(id);
    return {
      success: true,
      message: 'Fetch successful',
      data: doc,
    };
  }

  @Post('create')
  @ApiOperation({ summary: 'Create new ware manufacturing process type' })
  async create(@Body() dto: CreateWareManufacturingProcessTypeDto): Promise<BaseResponse<WareManufacturingProcessType>> {
    const doc = await this.service.createOne(dto);
    return {
      success: true,
      message: `Created type ${doc.code} - ${doc.name} successfully`,
      data: doc,
    };
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update ware manufacturing process type' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWareManufacturingProcessTypeDto,
  ): Promise<BaseResponse<WareManufacturingProcessType>> {
    const doc = await this.service.updateOne(id, dto);
    return {
      success: true,
      message: `Updated type ${doc.code} - ${doc.name} successfully`,
      data: doc,
    };
  }

  @Delete('delete-soft/:id')
  @ApiOperation({ summary: 'Soft delete ware manufacturing process type' })
  async softDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.service.softDelete(id);
    return {
      success: true,
      message: 'Soft deleted successfully',
      data: null,
    };
  }

  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restore ware manufacturing process type' })
  async restore(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.service.restore(id);
    return {
      success: true,
      message: 'Restored successfully',
      data: null,
    };
  }

  @Delete('delete-hard/:id')
  @ApiOperation({ summary: 'Hard delete ware manufacturing process type' })
  async hardDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.service.removeHard(id);
    return {
      success: true,
      message: 'Permanently deleted successfully',
      data: null,
    };
  }
}
