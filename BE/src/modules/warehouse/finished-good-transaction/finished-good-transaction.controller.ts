import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FinishedGoodTransactionService } from './finished-good-transaction.service';
import { CreateFinishedGoodTransactionDto } from './dto/create-finished-good-transaction.dto';
import { UpdateFinishedGoodTransactionDto } from './dto/update-finished-good-transaction.dto';
import { FinishedGoodTransaction } from '../schemas/finished-good-transaction.schema';
import { ApiOperation } from '@nestjs/swagger';
import { BaseResponse } from '@/common/dto/response.dto';
import { PaginatedList } from '@/common/dto/paginated-list.dto';

export type DailyReportDto = {
  date: string;
  totalImport: number;
  totalExport: number;
  net: number;
  data: FinishedGoodTransaction[];
}
@Controller('finished-good-transaction')
export class FinishedGoodTransactionController {
  constructor(private readonly finishedGoodTransactionService: FinishedGoodTransactionService) { }

  @Get('list')
  @ApiOperation({ summary: 'List paginated finished good transactions' })
  async findPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('finishedGoodId') finishedGoodId?: string,
  ): Promise<BaseResponse<PaginatedList<FinishedGoodTransaction>>> {
    const docs = await this.finishedGoodTransactionService.findPaginated(page, limit, search, finishedGoodId);
    return { success: true, message: 'Fetch successful', data: docs };
  }

  @Get('list-all')
  @ApiOperation({ summary: 'List all finished good transactions' })
  async findAll(): Promise<BaseResponse<FinishedGoodTransaction[]>> {
    const docs = await this.finishedGoodTransactionService.findAll();
    return { success: true, message: 'Fetch successful', data: docs };
  }

  @Get('detail/:id')
  @ApiOperation({ summary: 'Transaction detail' })
  async findOne(@Param('id') id: string): Promise<BaseResponse<FinishedGoodTransaction>> {
    const doc = await this.finishedGoodTransactionService.findOne(id);
    return { success: true, message: 'Fetch successful', data: doc };
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new transaction (by manufacturingOrderId)' })
  async create(@Body() dto: CreateFinishedGoodTransactionDto): Promise<BaseResponse<FinishedGoodTransaction>> {
    const doc = await this.finishedGoodTransactionService.createOne(dto);
    return { success: true, message: 'Created successfully', data: doc };
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update a transaction' })
  async update(@Param('id') id: string, @Body() dto: UpdateFinishedGoodTransactionDto): Promise<BaseResponse<FinishedGoodTransaction>> {
    const doc = await this.finishedGoodTransactionService.updateOne(id, dto);
    return { success: true, message: 'Updated successfully', data: doc };
  }

  @Get('report/daily')
  @ApiOperation({ summary: 'Get daily report of transactions' })
  async getDailyReport(
    @Query('date') date: string,
  ): Promise<BaseResponse<DailyReportDto>> {
    const docs = await this.finishedGoodTransactionService.getDailyReport(date);
    return { success: true, message: 'Fetch successful', data: docs };
  }

  @Delete('delete-soft/:id')
  @ApiOperation({ summary: 'Soft delete transaction' })
  async softDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.finishedGoodTransactionService.softDelete(id);
    return { success: true, message: 'Soft deleted successfully', data: null };
  }

  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restore transaction' })
  async restore(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.finishedGoodTransactionService.restore(id);
    return { success: true, message: 'Restored successfully', data: null };
  }

  @Delete('delete-hard/:id')
  @ApiOperation({ summary: 'Hard delete transaction' })
  async hardDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.finishedGoodTransactionService.removeHard(id);
    return { success: true, message: 'Permanently deleted successfully', data: null };
  }
}
