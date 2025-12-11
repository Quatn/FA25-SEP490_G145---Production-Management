import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FinishedGoodTransactionService } from './finished-good-transaction.service';
import { CreateFinishedGoodTransactionDto } from './dto/create-finished-good-transaction.dto';
import { UpdateFinishedGoodTransactionDto } from './dto/update-finished-good-transaction.dto';
import { FinishedGoodTransaction } from '../schemas/finished-good-transaction.schema';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseResponse } from '@/common/dto/response.dto';
import { GetFinishedGoodTransactionsDto } from './dto/get-finished-good-transaction.dto';
import { FinishedGoodDailyReportResponse } from '@/common/types/finished-good-types';
import { GetFinishedGoodDailyReportDto } from './dto/get-finished-good-daily-report.dto';
import { PaginatedList } from '@/common/dto/paginated-list.dto';

@Controller('finished-good-transaction')
export class FinishedGoodTransactionController {
  constructor(private readonly fgtService: FinishedGoodTransactionService) { }

  // @UseGuards(JwtAuthGuard)
  @Get('list')
  @ApiOperation({ summary: 'List paginated transactions formatted for table view' })
  @ApiResponse({ status: 200, description: 'Returns formatted table data' })
  async findPaginated(@Query() query: GetFinishedGoodTransactionsDto) {
    const result = await this.fgtService.findPaginated(query);
    return {
      success: true,
      message: 'Fetch successful',
      data: result
    };
  }

  @Get('list-adjustment')
  @ApiOperation({ summary: 'List finished inventory audit transactions' })
  async findAdjustment(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query('search') search?: string,
  ): Promise<BaseResponse<PaginatedList<FinishedGoodTransaction>>> {
    const docs = await this.fgtService.findAdjustmentTransaction(page, limit, search);
    return { success: true, message: 'Fetch successful', data: docs };
  }

  // @UseGuards(JwtAuthGuard)
  @Get('list-all')
  @ApiOperation({ summary: 'List all finished good transactions' })
  async findAll(): Promise<BaseResponse<FinishedGoodTransaction[]>> {
    const docs = await this.fgtService.findAll();
    return { success: true, message: 'Fetch successful', data: docs };
  }

  // @UseGuards(JwtAuthGuard)
  @Get('detail/:id')
  @ApiOperation({ summary: 'Transaction detail' })
  async findOne(@Param('id') id: string): Promise<BaseResponse<FinishedGoodTransaction>> {
    const doc = await this.fgtService.findOne(id);
    return { success: true, message: 'Fetch successful', data: doc };
  }

  // @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiOperation({ summary: 'Create a new transaction (by manufacturingOrder)' })
  async create(@Body() dto: CreateFinishedGoodTransactionDto): Promise<BaseResponse<FinishedGoodTransaction>> {
    const doc = await this.fgtService.createOne(dto);
    return { success: true, message: 'Created successfully', data: doc };
  }

  // @UseGuards(JwtAuthGuard)
  @Post('bulk')
  @ApiOperation({ summary: 'Create new transactions' })
  async createMany(@Body() dtos: CreateFinishedGoodTransactionDto[]): Promise<BaseResponse<FinishedGoodTransaction[]>> {
    const doc = await this.fgtService.createMany(dtos);
    return { success: true, message: 'Created successfully', data: doc };
  }

  // @UseGuards(JwtAuthGuard)
  @Patch('update/:id')
  @ApiOperation({ summary: 'Update a transaction' })
  async update(@Param('id') id: string, @Body() dto: UpdateFinishedGoodTransactionDto): Promise<BaseResponse<FinishedGoodTransaction>> {
    const doc = await this.fgtService.updateOne(id, dto);
    return { success: true, message: 'Updated successfully', data: doc };
  }

  // @UseGuards(JwtAuthGuard)
  @Get('report/daily')
  @ApiOperation({ summary: 'Get daily report of transactions' })
  async getDailyReport(@Query() dto: GetFinishedGoodDailyReportDto): Promise<BaseResponse<FinishedGoodDailyReportResponse>> {
    const docs = await this.fgtService.getDailyReport(dto);
    return { success: true, message: 'Fetch successful', data: docs };
  }

  // @UseGuards(JwtAuthGuard)
  @Delete('delete-soft/:id')
  @ApiOperation({ summary: 'Soft delete transaction' })
  async softDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.fgtService.softDelete(id);
    return { success: true, message: 'Soft deleted successfully', data: null };
  }

  // @UseGuards(JwtAuthGuard)
  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restore transaction' })
  async restore(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.fgtService.restore(id);
    return { success: true, message: 'Restored successfully', data: null };
  }

  // @UseGuards(JwtAuthGuard)
  @Delete('delete-hard/:id')
  @ApiOperation({ summary: 'Hard delete transaction' })
  async hardDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.fgtService.removeHard(id);
    return { success: true, message: 'Permanently deleted successfully', data: null };
  }
}
