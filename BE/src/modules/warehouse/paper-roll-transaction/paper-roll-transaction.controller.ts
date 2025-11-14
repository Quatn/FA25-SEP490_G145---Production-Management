// src/modules/warehouse/paper-roll-transaction/paper-roll-transaction.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PaperRollTransactionService } from './paper-roll-transaction.service';
import { CreatePaperRollTransactionDto } from './dto/create-paper-roll-transaction.dto';
import { UpdatePaperRollTransactionDto } from './dto/update-paper-roll-transaction.dto';
import { PaperRollTransactionDocument } from '../schemas/paper-roll-transaction.schema';
import { BaseResponse } from '@/common/dto/response.dto';
import { ApiOperation } from '@nestjs/swagger';
import { PaginatedList } from '@/common/dto/paginatedList.dto';

@Controller('paper-roll-transaction')
export class PaperRollTransactionController {
    constructor(private readonly txService: PaperRollTransactionService) { }

    @Get('list')
    @ApiOperation({ summary: 'List paginated transactions' })
    async findPaginated(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('paperRollId') paperRollId?: string,
    ): Promise<BaseResponse<PaginatedList<PaperRollTransactionDocument>>> {
        const docs = await this.txService.findPaginated(page, limit, search, paperRollId);
        return { success: true, message: 'Fetch successful', data: docs };
    }

    @Get('list-all')
    @ApiOperation({ summary: 'List all transactions' })
    async findAll(): Promise<BaseResponse<PaperRollTransactionDocument[]>> {
        const docs = await this.txService.findAll();
        return { success: true, message: 'Fetch successful', data: docs };
    }

    @Get('detail/:id')
    @ApiOperation({ summary: 'Transaction detail' })
    async findOne(@Param('id') id: string): Promise<BaseResponse<PaperRollTransactionDocument>> {
        const doc = await this.txService.findOne(id);
        return { success: true, message: 'Fetch successful', data: doc };
    }

    @Post('create')
    @ApiOperation({ summary: 'Create transaction' })
    async create(@Body() dto: CreatePaperRollTransactionDto): Promise<BaseResponse<PaperRollTransactionDocument>> {
        const doc = await this.txService.createOne(dto);
        return { success: true, message: 'Transaction created', data: doc };
    }

    @Patch('update/:id')
    @ApiOperation({ summary: 'Update transaction' })
    async update(@Param('id') id: string, @Body() dto: UpdatePaperRollTransactionDto): Promise<BaseResponse<PaperRollTransactionDocument>> {
        const doc = await this.txService.updateOne(id, dto);
        return { success: true, message: 'Transaction updated', data: doc };
    }

    @Delete('delete-soft/:id')
    @ApiOperation({ summary: 'Soft delete transaction' })
    async softDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
        await this.txService.softDelete(id);
        return { success: true, message: 'Soft deleted successfully', data: null };
    }

    @Patch('restore/:id')
    @ApiOperation({ summary: 'Restore transaction' })
    async restore(@Param('id') id: string): Promise<BaseResponse<null>> {
        await this.txService.restore(id);
        return { success: true, message: 'Restored successfully', data: null };
    }

    @Delete('delete-hard/:id')
    @ApiOperation({ summary: 'Hard delete transaction' })
    async hardDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
        await this.txService.removeHard(id);
        return { success: true, message: 'Permanently deleted successfully', data: null };
    }
}
