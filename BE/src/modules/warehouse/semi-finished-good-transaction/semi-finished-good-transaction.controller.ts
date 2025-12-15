import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SemiFinishedGoodTransactionService } from './semi-finished-good-transaction.service';
import { CreateSemiFinishedGoodTransactionDto } from './dto/create-semi-finished-good-transaction.dto';
import { UpdateSemiFinishedGoodTransactionDto } from './dto/update-semi-finished-good-transaction.dto';
import { BaseResponse } from '@/common/dto/response.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginatedList } from '@/common/dto/paginatedList.dto';
import { SemiFinishedGoodTransaction } from '../schemas/semi-finished-good-transaction.schema';
import { TransactionType } from '../enums/transaction-type.enum';
import { GetSemiFinishedGoodTransactionsDto } from './dto/get-semi-finished-good-transaction.dto';
import { PrivilegedJwtAuthGuard } from '@/common/guards/privileged-jwt-auth.guard';
import { semiFinishedGoodTransactionAdminPrivileges, semiFinishedGoodTransactionCreatePrivileges, semiFinishedGoodTransactionGetPrivileges, semiFinishedGoodTransactionUpdatePrivileges } from './semi-finished-good-transaction-module-access-privileges';

export type DailyReportDto = {
  date: string;
  data: SemiFinishedGoodTransaction[];
}

const SemiFinishedGoodTransactionGetRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: semiFinishedGoodTransactionGetPrivileges,
});

const SemiFinishedGoodTransactionCreateRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: semiFinishedGoodTransactionCreatePrivileges,
});

const SemiFinishedGoodTransactionUpdateRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: semiFinishedGoodTransactionUpdatePrivileges,
});

const SemiFinishedGoodTransactionAdminRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: semiFinishedGoodTransactionAdminPrivileges,
});

@ApiBearerAuth("access-token")
@Controller('semi-finished-good-transaction')
export class SemiFinishedGoodTransactionController {
  constructor(private readonly semiFinishedGoodTransactionService: SemiFinishedGoodTransactionService) { }

  @UseGuards(SemiFinishedGoodTransactionGetRequestGuard)
  @Get('list')
  @ApiOperation({ summary: 'List paginated semi finished transactions' })
  async findPaginated(@Query() query: GetSemiFinishedGoodTransactionsDto) {
    const docs = await this.semiFinishedGoodTransactionService.findPaginated(query);
    return { success: true, message: 'Fetch successful', data: docs };
  }

  @UseGuards(SemiFinishedGoodTransactionGetRequestGuard)
  @Get('list-all')
  @ApiOperation({ summary: 'List all semi finished transactions' })
  async findAll(): Promise<BaseResponse<SemiFinishedGoodTransaction[]>> {
    const docs = await this.semiFinishedGoodTransactionService.findAll();
    return { success: true, message: 'Fetch successful', data: docs };
  }

  @UseGuards(SemiFinishedGoodTransactionGetRequestGuard)
  @Get('list-adjustment')
  @ApiOperation({ summary: 'List semi finished inventory audit transactions' })
  async findAdjustment(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query('search') search?: string,
  ): Promise<BaseResponse<PaginatedList<SemiFinishedGoodTransaction>>> {
    const docs = await this.semiFinishedGoodTransactionService.findAdjustmentTransaction(page, limit, search);
    return { success: true, message: 'Fetch successful', data: docs };
  }

  @UseGuards(SemiFinishedGoodTransactionGetRequestGuard)
  @Get('detail/:id')
  @ApiOperation({ summary: 'Transaction detail' })
  async findOne(@Param('id') id: string): Promise<BaseResponse<SemiFinishedGoodTransaction>> {
    const doc = await this.semiFinishedGoodTransactionService.findOne(id);
    return { success: true, message: 'Fetch successful', data: doc };
  }

  @UseGuards(SemiFinishedGoodTransactionCreateRequestGuard)
  @Post('create')
  @ApiOperation({ summary: 'Create a new transaction (by manufacturingOrderId)' })
  async create(@Body() dto: CreateSemiFinishedGoodTransactionDto): Promise<BaseResponse<SemiFinishedGoodTransaction>> {
    const doc = await this.semiFinishedGoodTransactionService.createOne(dto);
    return { success: true, message: 'Created successfully', data: doc };
  }

  @UseGuards(SemiFinishedGoodTransactionUpdateRequestGuard)
  @Patch('update/:id')
  @ApiOperation({ summary: 'Update a transaction' })
  async update(@Param('id') id: string, @Body() dto: UpdateSemiFinishedGoodTransactionDto): Promise<BaseResponse<SemiFinishedGoodTransaction>> {
    const doc = await this.semiFinishedGoodTransactionService.updateOne(id, dto);
    return { success: true, message: 'Updated successfully', data: doc };
  }

  @UseGuards(SemiFinishedGoodTransactionGetRequestGuard)
  @Get("employees/daily")
  async getSFGDailyEmployees(@Query("date") date: string) {
    return this.semiFinishedGoodTransactionService.getDailyEmployees(date);
  }

  @UseGuards(SemiFinishedGoodTransactionGetRequestGuard)
  @Get('chart/daily')
  async getDailyStats(@Query('date') date: string) {
    const data = await this.semiFinishedGoodTransactionService.getDailyStatistics(date);
    return {
      success: true,
      data: data,
    };
  }

  @UseGuards(SemiFinishedGoodTransactionGetRequestGuard)
  @Get('report/daily')
  @ApiOperation({ summary: 'Get daily report of transactions' })
  async getSFGDailyReport(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('date') date: string,
    @Query('transactionType') transactionType?: TransactionType,
    @Query('employeeId') employeeId?: string,
    @Query('manufacturingOrderId') manufacturingOrderId?: string,
  ): Promise<BaseResponse<PaginatedList<SemiFinishedGoodTransaction>>> {
    const docs = await this.semiFinishedGoodTransactionService.getDailyReport(page, limit, date, transactionType, employeeId, manufacturingOrderId);
    return { success: true, message: 'Fetch successful', data: docs };
  }

  @UseGuards(SemiFinishedGoodTransactionUpdateRequestGuard)
  @Delete('delete-soft/:id')
  @ApiOperation({ summary: 'Soft delete transaction' })
  async softDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.semiFinishedGoodTransactionService.softDelete(id);
    return { success: true, message: 'Soft deleted successfully', data: null };
  }

  @UseGuards(SemiFinishedGoodTransactionAdminRequestGuard)
  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restore transaction' })
  async restore(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.semiFinishedGoodTransactionService.restore(id);
    return { success: true, message: 'Restored successfully', data: null };
  }

  @UseGuards(SemiFinishedGoodTransactionAdminRequestGuard)
  @Delete('delete-hard/:id')
  @ApiOperation({ summary: 'Hard delete transaction' })
  async hardDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.semiFinishedGoodTransactionService.removeHard(id);
    return { success: true, message: 'Permanently deleted successfully', data: null };
  }
}
