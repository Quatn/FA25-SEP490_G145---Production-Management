import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { SemiFinishedGoodTransactionService } from './semi-finished-good-transaction.service';
import { CreateSemiFinishedGoodTransactionDto } from './dto/create-semi-finished-good-transaction.dto';
import { UpdateSemiFinishedGoodTransactionDto } from './dto/update-semi-finished-good-transaction.dto';
import { BaseResponse } from '@/common/dto/response.dto';
import { ApiOperation } from '@nestjs/swagger';
import { PaginatedList } from '@/common/dto/paginatedList.dto';
import { SemiFinishedGoodTransaction } from '../schemas/semi-finished-good-transaction.schema';

export type DailyReportDto= {
  date: string;
  totalImport: number;
  totalExport: number;
  net: number;
  data: SemiFinishedGoodTransaction[];
}

@Controller('semi-finished-good-transaction')
export class SemiFinishedGoodTransactionController {
  constructor(private readonly semiFinishedGoodTransactionService: SemiFinishedGoodTransactionService) { }

  @Get('list')
  @ApiOperation({ summary: 'List paginated semi finished transactions' })
  async findPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('semiFinishedGoodId') semiFinishedGoodId?: string,
  ): Promise<BaseResponse<PaginatedList<SemiFinishedGoodTransaction>>> {
    const docs = await this.semiFinishedGoodTransactionService.findPaginated(page, limit, search, semiFinishedGoodId);
    return { success: true, message: 'Fetch successful', data: docs };
  }

  @Get('list-all')
  @ApiOperation({ summary: 'List all semi finished transactions' })
  async findAll(): Promise<BaseResponse<SemiFinishedGoodTransaction[]>> {
    const docs = await this.semiFinishedGoodTransactionService.findAll();
    return { success: true, message: 'Fetch successful', data: docs };
  }

  @Get('detail/:id')
  @ApiOperation({ summary: 'Transaction detail' })
  async findOne(@Param('id') id: string): Promise<BaseResponse<SemiFinishedGoodTransaction>> {
    const doc = await this.semiFinishedGoodTransactionService.findOne(id);
    return { success: true, message: 'Fetch successful', data: doc };
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new transaction (by manufacturingOrderId)' })
  async create(@Body() dto: CreateSemiFinishedGoodTransactionDto): Promise<BaseResponse<SemiFinishedGoodTransaction>> {
    const doc = await this.semiFinishedGoodTransactionService.createOne(dto);
    return { success: true, message: 'Created successfully', data: doc };
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update a transaction' })
  async update(@Param('id') id: string, @Body() dto: UpdateSemiFinishedGoodTransactionDto): Promise<BaseResponse<SemiFinishedGoodTransaction>> {
    const doc = await this.semiFinishedGoodTransactionService.updateOne(id, dto);
    return { success: true, message: 'Updated successfully', data: doc };
  }

  @Get('report/daily')
  @ApiOperation({ summary: 'Get daily report of transactions' })
  async getDailyReport(
    @Query('date') date: string,
  ): Promise<BaseResponse<DailyReportDto>> {
    const docs = await this.semiFinishedGoodTransactionService.getDailyReport(date);
    return { success: true, message: 'Fetch successful', data: docs };
  }

  @Delete('delete-soft/:id')
  @ApiOperation({ summary: 'Soft delete transaction' })
  async softDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.semiFinishedGoodTransactionService.softDelete(id);
    return { success: true, message: 'Soft deleted successfully', data: null };
  }

  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restore transaction' })
  async restore(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.semiFinishedGoodTransactionService.restore(id);
    return { success: true, message: 'Restored successfully', data: null };
  }

  @Delete('delete-hard/:id')
  @ApiOperation({ summary: 'Hard delete transaction' })
  async hardDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.semiFinishedGoodTransactionService.removeHard(id);
    return { success: true, message: 'Permanently deleted successfully', data: null };
  }
}
