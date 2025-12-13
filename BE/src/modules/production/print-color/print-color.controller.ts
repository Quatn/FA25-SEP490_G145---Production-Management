import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrintColorService } from './print-color.service';
import { CreatePrintColorRequestDto } from './dto/create-print-color-request.dto';
import { UpdatePrintColorRequestDto } from './dto/update-print-color-request.dto';
import { PrintColorDocument } from '../schemas/print-color.schema';
import { BaseResponse } from '@/common/dto/response.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginatedList } from '@/common/dto/paginatedList.dto';

@Controller('print-color')
@ApiTags('PrintColor')
export class PrintColorController {
  constructor(private readonly pcService: PrintColorService) { }

  @Get('list')
  @ApiOperation({ summary: 'List paginated print colors' })
  async findPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<BaseResponse<PaginatedList<PrintColorDocument>>> {
    const docs = await this.pcService.findPaginated(page, limit, search);
    return { success: true, message: 'Fetch successful', data: docs };
  }

  @Get('list-deleted')
  @ApiOperation({ summary: 'List deleted print colors' })
  async findDeleted(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<BaseResponse<PaginatedList<PrintColorDocument>>> {
    const docs = await this.pcService.findDeleted(page, limit);
    return { success: true, message: 'Fetch successful', data: docs };
  }

  @Get('list-all')
  @ApiOperation({ summary: 'List print colors' })
  async findAll(): Promise<BaseResponse<PrintColorDocument[]>> {
    const docs = await this.pcService.findAll();
    return { success: true, message: 'Fetch successful', data: docs };
  }

  @Get('detail/:id')
  @ApiOperation({ summary: 'Print color detail' })
  async findOne(@Param('id') id: string): Promise<BaseResponse<PrintColorDocument>> {
    const doc = await this.pcService.findOne(id);
    return { success: true, message: 'Fetch successful', data: doc };
  }

  @Post('create')
  @ApiOperation({ summary: 'Create new print color' })
  async create(@Body() dto: CreatePrintColorRequestDto): Promise<BaseResponse<PrintColorDocument>> {
    const doc = await this.pcService.createOne(dto);
    return { success: true, message: `Created print color ${doc.code} successfully`, data: doc };
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update print color' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePrintColorRequestDto,
  ): Promise<BaseResponse<PrintColorDocument>> {
    const doc = await this.pcService.updateOne(id, dto);
    return { success: true, message: `Updated print color ${doc.code} successfully`, data: doc };
  }

  @Delete('delete-soft/:id')
  @ApiOperation({ summary: 'Soft delete print color' })
  async softDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.pcService.softDelete(id);
    return { success: true, message: 'Soft deleted successfully', data: null };
  }

  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restore print color' })
  async restore(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.pcService.restore(id);
    return { success: true, message: 'Restored successfully', data: null };
  }

  @Delete('delete-hard/:id')
  @ApiOperation({ summary: 'Hard delete print color' })
  async hardDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.pcService.removeHard(id);
    return { success: true, message: 'Permanently deleted successfully', data: null };
  }
}
