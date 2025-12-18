import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SemiFinishedGoodService } from './semi-finished-good.service';
import { CreateSemiFinishedGoodDto } from './dto/create-semi-finished-good.dto';
import { UpdateSemiFinishedGoodDto } from './dto/update-semi-finished-good.dto';
import { BaseResponse } from '@/common/dto/response.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginatedList } from '@/common/dto/paginatedList.dto';
import { SemiFinishedGood } from '../schemas/semi-finished-good.schema';
import { PrivilegedJwtAuthGuard } from '@/common/guards/privileged-jwt-auth.guard';
import { semiFinishedGoodAdminPrivileges, semiFinishedGoodCreatePrivileges, semiFinishedGoodGetPrivileges, semiFinishedGoodUpdatePrivileges } from './semi-finished-good-module-access-privileges';

const SemiFinishedGoodGetRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: semiFinishedGoodGetPrivileges,
});

const SemiFinishedGoodCreateRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: semiFinishedGoodCreatePrivileges,
});

const SemiFinishedGoodUpdateRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: semiFinishedGoodUpdatePrivileges,
});

const SemiFinishedGoodAdminRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: semiFinishedGoodAdminPrivileges,
});

@ApiBearerAuth("access-token")
@Controller('semi-finished-good')
export class SemiFinishedGoodController {
  constructor(private readonly semiFinishedGoodService: SemiFinishedGoodService) { }

  @UseGuards(SemiFinishedGoodGetRequestGuard)
  @Get('list')
  @ApiOperation({ summary: 'List paginated semi finished goods' })
  async findPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<BaseResponse<PaginatedList<SemiFinishedGood>>> {
    const docs = await this.semiFinishedGoodService.findPaginated(page, limit, search);
    return { success: true, message: 'Fetch successful', data: docs };
  }

  @UseGuards(SemiFinishedGoodGetRequestGuard)
  @Get('list-all')
  @ApiOperation({ summary: 'List all semi finished goods' })
  async findAll(): Promise<BaseResponse<SemiFinishedGood[]>> {
    const docs = await this.semiFinishedGoodService.findAll();
    return { success: true, message: 'Fetch successful', data: docs };
  }

  @UseGuards(SemiFinishedGoodGetRequestGuard)
  @Get('detail/:id')
  @ApiOperation({ summary: 'Semi finished good detail' })
  async findOne(@Param('id') id: string): Promise<BaseResponse<SemiFinishedGood>> {
    const doc = await this.semiFinishedGoodService.findOne(id);
    return { success: true, message: 'Fetch successful', data: doc };
  }

  @UseGuards(SemiFinishedGoodGetRequestGuard)
  @Get('detail-by-mo/:moId')
  @ApiOperation({ summary: 'Get semi-finished good by manufacturing order ID' })
  async findByManufacturingOrderId(@Param('moId') moId: string): Promise<BaseResponse<SemiFinishedGood>> {
    const doc = await this.semiFinishedGoodService.findByManufacturingOrderId(moId);
    return { success: true, message: 'Fetch successful', data: doc };
  }

  @UseGuards(SemiFinishedGoodCreateRequestGuard)
  @Post('create')
  @ApiOperation({ summary: 'Create a new semi finished good' })
  async create(@Body() dto: CreateSemiFinishedGoodDto): Promise<BaseResponse<SemiFinishedGood>> {
    const doc = await this.semiFinishedGoodService.create(dto);
    return { success: true, message: 'Created successfully', data: doc };
  }

  @UseGuards(SemiFinishedGoodUpdateRequestGuard)
  @Patch('update/:id')
  @ApiOperation({ summary: 'Update a semi finished good' })
  async update(@Param('id') id: string, @Body() dto: UpdateSemiFinishedGoodDto): Promise<BaseResponse<SemiFinishedGood>> {
    const doc = await this.semiFinishedGoodService.update(id, dto);
    return { success: true, message: 'Updated successfully', data: doc };
  }

  @UseGuards(SemiFinishedGoodUpdateRequestGuard)
  @Delete('delete-soft/:id')
  @ApiOperation({ summary: 'Soft delete semi finished good' })
  async softDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.semiFinishedGoodService.softDelete(id);
    return { success: true, message: 'Soft deleted successfully', data: null };
  }

  @UseGuards(SemiFinishedGoodAdminRequestGuard)
  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restore semi finished good' })
  async restore(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.semiFinishedGoodService.restore(id);
    return { success: true, message: 'Restored successfully', data: null };
  }

  @UseGuards(SemiFinishedGoodAdminRequestGuard)
  @Delete('delete-hard/:id')
  @ApiOperation({ summary: 'Hard delete semi finished good' })
  async hardDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.semiFinishedGoodService.removeHard(id);
    return { success: true, message: 'Permanently deleted successfully', data: null };
  }

}
