import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PaperRollService } from './paper-roll.service';
import { CreatePaperRollDto, CreateMultiplePaperRollDto } from './dto/create-paper-roll.dto';
import { UpdatePaperRollDto } from './dto/update-paper-roll.dto';
import { PaperRollDocument } from '../schemas/paper-roll.schema';
import { BaseResponse } from '@/common/dto/response.dto';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaginatedList } from '@/common/dto/paginatedList.dto';

@Controller('paper-roll')
export class PaperRollController {
  constructor(private readonly prService: PaperRollService) { }

  // @UseGuards(JwtAuthGuard)
  @Get('list')
  @ApiOperation({ summary: 'List paginated paper rolls' })
  async findPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('sortBy') sortBy: 'weight' | 'receivingDate' | 'updatedAt' | 'both' = 'both',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<BaseResponse<PaginatedList<PaperRollDocument>>> {
    const docs = await this.prService.findPaginated(page, limit, search, sortBy, sortOrder);
    return {
      success: true,
      message: 'Fetch successful',
      data: docs,
    };
  }

  // @UseGuards(JwtAuthGuard)
  @Get('detail/:id')
  @ApiOperation({ summary: 'Paper roll detail' })
  async findOne(@Param('id') id: string): Promise<BaseResponse<PaperRollDocument>> {
    const doc = await this.prService.findOne(id);
    return {
      success: true,
      message: 'Fetch successful',
      data: doc,
    };
  }

  // @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiOperation({ summary: 'Create a new paper roll' })
  async create(@Body() dto: CreatePaperRollDto): Promise<BaseResponse<PaperRollDocument>> {
    const doc = await this.prService.create(dto);

    const receivingDate = new Date(doc.receivingDate);
    const lastTwoDigits = receivingDate.getFullYear() % 100;
    const message = `Created paper roll ${doc.paperSupplier.name}${doc.sequenceNumber}XC${lastTwoDigits} successfully`;

    return {
      success: true,
      message: message,
      data: doc,
    };
  }

  // @UseGuards(JwtAuthGuard)
  @Post('create-multiple')
  @ApiOperation({ summary: 'Create multiple paper rolls' })
  async createMultiple(@Body() dto: CreateMultiplePaperRollDto): Promise<BaseResponse<PaperRollDocument[]>> {
    const docs = await this.prService.createMultiple(dto);

    const messages = docs.map(doc => {
      const receivingDate = new Date(doc.receivingDate);
      const lastTwoDigits = receivingDate.getFullYear() % 100;
      return `${doc.paperSupplier.name}${doc.sequenceNumber}XC${lastTwoDigits}`;
    });

    return {
      success: true,
      message: `Created ${docs.length} paper rolls successfully: ${messages.join(', ')}`,
      data: docs,
    };
  }

  // @UseGuards(JwtAuthGuard)
  @Patch('update/:id')
  @ApiOperation({ summary: 'Update a paper roll' })
  async update(@Param('id') id: string, @Body() dto: UpdatePaperRollDto): Promise<BaseResponse<PaperRollDocument>> {
    const doc = await this.prService.update(id, dto);
    const receivingDate = new Date(doc.receivingDate);
    const lastTwoDigits = receivingDate.getFullYear() % 100;
    const message = `Updated paper roll ${doc.paperSupplier.name}${doc.sequenceNumber}XC${lastTwoDigits} successfully`;
    return {
      success: true,
      message: message,
      data: doc,
    };
  }

  // @UseGuards(JwtAuthGuard)
  @Delete("delete-soft/:id")
  @ApiOperation({ summary: "Soft delete paper roll" })
  async softDelete(
    @Param("id") id: string,
  ): Promise<BaseResponse<null>> {
    await this.prService.softDelete(id);
    return {
      success: true,
      message: "Soft deleted successfully",
      data: null,
    };
  }

  // @UseGuards(JwtAuthGuard)
  @Patch("restore/:id")
  @ApiOperation({ summary: "Restore paper roll" })
  async restore(
    @Param("id") id: string,
  ): Promise<BaseResponse<null>> {
    await this.prService.restore(id);
    return {
      success: true,
      message: "Restored successfully",
      data: null,
    };
  }

  // @UseGuards(JwtAuthGuard)
  @Delete("delete-hard/:id")
  @ApiOperation({ summary: "Hard delete paper roll" })
  async hardDelete(
    @Param("id") id: string,
  ): Promise<BaseResponse<null>> {
    await this.prService.removeHard(id);
    return {
      success: true,
      message: "Permanently deleted successfully",
      data: null,
    };
  }

  // new endpoint in paper-roll.controller.ts
  @Get("list-deleted")
  @ApiOperation({ summary: "List soft-deleted paper rolls" })
  async findDeleted(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
  ): Promise<BaseResponse<PaginatedList<any>>> {
    // call a service method that directly queries the collection with { isDeleted: true }
    const docs = await this.prService.findDeleted(page, limit);
    return { success: true, message: "Fetch deleted", data: docs };
  }

  @Get('detail-by-paper-roll')
  @ApiOperation({ summary: 'Paper roll detail by paperRollId' })
  @ApiQuery({ name: 'paperRollId', required: true })
  async findByPaperRollId(
    @Query('paperRollId') paperRollIdRaw: string
  ): Promise<BaseResponse<PaperRollDocument>> {
    const raw = paperRollIdRaw ?? '';
    const decoded = decodeURIComponent(raw);

    // Temporary logging for debugging — remove in production
    console.log('🔍 GET detail-by-paper-roll received raw:', JSON.stringify(raw));
    console.log('🔍 decoded paperRollId:', JSON.stringify(decoded));

    const doc = await this.prService.findByPaperRollId(decoded);

    if (!doc) {
      return {
        success: false,
        message: `Paper roll with paperRollId #${decoded} not found`,
        error: { message: 'No error message', status: 404 },
      };
    }

    return {
      success: true,
      message: 'Fetch successful',
      data: doc,
    };
  }
}
