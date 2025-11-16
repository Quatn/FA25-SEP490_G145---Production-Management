import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FinishedGoodService } from './finished-good.service';
import { CreateFinishedGoodDto } from './dto/create-finished-good.dto';
import { UpdateFinishedGoodDto } from './dto/update-finished-good.dto';
import { ApiOperation } from '@nestjs/swagger';
import { BaseResponse } from '@/common/dto/response.dto';
import { PaginatedList } from '@/common/dto/paginated-list.dto';
import { FinishedGood } from '../schemas/finished-good.schema';

@Controller('finished-good')
export class FinishedGoodController {
  constructor(private readonly finishedGoodService: FinishedGoodService) { }

  @Get('list')
  @ApiOperation({ summary: 'List paginated finished goods' })
  async findPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<BaseResponse<PaginatedList<FinishedGood>>> {
    const docs = await this.finishedGoodService.findPaginated(page, limit, search);
    return { success: true, message: 'Fetch successful', data: docs };
  }

  @Get('list-all')
  @ApiOperation({ summary: 'List all finished goods' })
  async findAll(): Promise<BaseResponse<FinishedGood[]>> {
    const docs = await this.finishedGoodService.findAll();
    return { success: true, message: 'Fetch successful', data: docs };
  }

  @Get('detail/:id')
  @ApiOperation({ summary: 'Finished good detail' })
  async findOne(@Param('id') id: string): Promise<BaseResponse<FinishedGood>> {
    const doc = await this.finishedGoodService.findOne(id);
    return { success: true, message: 'Fetch successful', data: doc };
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new finished good' })
  async create(@Body() dto: CreateFinishedGoodDto): Promise<BaseResponse<FinishedGood>> {
    const doc = await this.finishedGoodService.create(dto);
    return { success: true, message: 'Created successfully', data: doc };
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update a finished good' })
  async update(@Param('id') id: string, @Body() dto: UpdateFinishedGoodDto): Promise<BaseResponse<FinishedGood>> {
    const doc = await this.finishedGoodService.update(id, dto);
    return { success: true, message: 'Updated successfully', data: doc };
  }

  @Delete('delete-soft/:id')
  @ApiOperation({ summary: 'Soft delete finished good' })
  async softDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.finishedGoodService.softDelete(id);
    return { success: true, message: 'Soft deleted successfully', data: null };
  }

  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restore finished good' })
  async restore(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.finishedGoodService.restore(id);
    return { success: true, message: 'Restored successfully', data: null };
  }

  @Delete('delete-hard/:id')
  @ApiOperation({ summary: 'Hard delete finished good' })
  async hardDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.finishedGoodService.removeHard(id);
    return { success: true, message: 'Permanently deleted successfully', data: null };
  }
}
