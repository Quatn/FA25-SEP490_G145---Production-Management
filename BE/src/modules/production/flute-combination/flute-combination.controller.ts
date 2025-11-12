import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FluteCombinationService } from './flute-combination.service';
import { CreateFluteCombinationDto } from './dto/create-flute-combination.dto';
import { UpdateFluteCombinationDto } from './dto/update-flute-combination.dto';
import { BaseResponse } from '@/common/dto/response.dto';
import { PaginatedList } from '@/common/dto/paginated-list.dto';
import { FluteCombination } from '../schemas/flute-combination.schema';
import { ApiOperation } from '@nestjs/swagger';

@Controller('flute-combination')
export class FluteCombinationController {
  constructor(private readonly service: FluteCombinationService) { }

  @Get('list')
  @ApiOperation({ summary: 'List paginated flute combinations' })
  async findPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<BaseResponse<PaginatedList<FluteCombination>>> {
    const docs = await this.service.findPaginated(page, limit, search);
    return {
      success: true,
      message: 'Fetch successful',
      data: docs,
    };
  }

  @Get('list-all')
  @ApiOperation({ summary: 'List flute combinations' })
  async findAll(): Promise<BaseResponse<FluteCombination[]>> {
    const docs = await this.service.findAll();
    return {
      success: true,
      message: 'Fetch successful',
      data: docs,
    };
  }

  @Get('detail/:id')
  @ApiOperation({ summary: 'flute combination detail' })
  async findOne(@Param('id') id: string): Promise<BaseResponse<FluteCombination>> {
    const doc = await this.service.findOne(id);
    return {
      success: true,
      message: 'Fetch successful',
      data: doc,
    };
  }

  @Post('create')
  @ApiOperation({ summary: 'Create new flute combination' })
  async create(@Body() dto: CreateFluteCombinationDto): Promise<BaseResponse<FluteCombination>> {
    const doc = await this.service.createOne(dto);
    return {
      success: true,
      message: `Created flute combination ${doc.code} successfully`,
      data: doc,
    };
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update flute combination' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFluteCombinationDto,
  ): Promise<BaseResponse<FluteCombination>> {
    const doc = await this.service.updateOne(id, dto);
    return {
      success: true,
      message: `Updated flute combination ${doc.code} successfully`,
      data: doc,
    };
  }

  @Delete('delete-soft/:id')
  @ApiOperation({ summary: 'Soft delete flute combination' })
  async softDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.service.softDelete(id);
    return {
      success: true,
      message: 'Soft deleted successfully',
      data: null,
    };
  }

  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restore flute combination' })
  async restore(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.service.restore(id);
    return {
      success: true,
      message: 'Restored successfully',
      data: null,
    };
  }

  @Delete('delete-hard/:id')
  @ApiOperation({ summary: 'Hard delete flute combination' })
  async hardDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.service.removeHard(id);
    return {
      success: true,
      message: 'Permanently deleted successfully',
      data: null,
    };
  }
}
