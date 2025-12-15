import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { FinishedGoodService } from './finished-good.service';
import { CreateFinishedGoodDto } from './dto/create-finished-good.dto';
import { UpdateFinishedGoodDto } from './dto/update-finished-good.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BaseResponse } from '@/common/dto/response.dto';
import { PaginatedList } from '@/common/dto/paginated-list.dto';
import { FinishedGood } from '../schemas/finished-good.schema';
import { PrivilegedJwtAuthGuard } from '@/common/guards/privileged-jwt-auth.guard';
import { finishedGoodAdminPrivileges, finishedGoodCreatePrivileges, finishedGoodGetPrivileges, finishedGoodUpdatePrivileges } from './finished-good-module-access-privileges';

const FinishedGoodGetRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: finishedGoodGetPrivileges,
});

const FinishedGoodCreateRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: finishedGoodCreatePrivileges,
});

const FinishedGoodUpdateRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: finishedGoodUpdatePrivileges,
});

const FinishedGoodAdminRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: finishedGoodAdminPrivileges,
});

@ApiBearerAuth("access-token")
@Controller('finished-good')
export class FinishedGoodController {
  constructor(private readonly finishedGoodService: FinishedGoodService) { }

  @UseGuards(FinishedGoodGetRequestGuard)
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

  @UseGuards(FinishedGoodGetRequestGuard)
  @Get('list-all')
  @ApiOperation({ summary: 'List all finished goods' })
  async findAll(): Promise<BaseResponse<FinishedGood[]>> {
    const docs = await this.finishedGoodService.findAll();
    return { success: true, message: 'Fetch successful', data: docs };
  }

  @UseGuards(FinishedGoodGetRequestGuard)
  @Get('detail/:id')
  @ApiOperation({ summary: 'Finished good detail' })
  async findOne(@Param('id') id: string): Promise<BaseResponse<FinishedGood>> {
    const doc = await this.finishedGoodService.findOne(id);
    return { success: true, message: 'Fetch successful', data: doc };
  }

  @UseGuards(FinishedGoodCreateRequestGuard)
  @Post('create')
  @ApiOperation({ summary: 'Create a new finished good' })
  async create(@Body() dto: CreateFinishedGoodDto): Promise<BaseResponse<FinishedGood>> {
    const doc = await this.finishedGoodService.create(dto);
    return { success: true, message: 'Created successfully', data: doc };
  }

  @UseGuards(FinishedGoodUpdateRequestGuard)
  @Patch('update/:id')
  @ApiOperation({ summary: 'Update a finished good' })
  async update(@Param('id') id: string, @Body() dto: UpdateFinishedGoodDto): Promise<BaseResponse<FinishedGood>> {
    const doc = await this.finishedGoodService.update(id, dto);
    return { success: true, message: 'Updated successfully', data: doc };
  }

  @UseGuards(FinishedGoodUpdateRequestGuard)
  @Delete('delete-soft/:id')
  @ApiOperation({ summary: 'Soft delete finished good' })
  async softDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.finishedGoodService.softDelete(id);
    return { success: true, message: 'Soft deleted successfully', data: null };
  }

  @UseGuards(FinishedGoodAdminRequestGuard)
  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restore finished good' })
  async restore(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.finishedGoodService.restore(id);
    return { success: true, message: 'Restored successfully', data: null };
  }

  @UseGuards(FinishedGoodAdminRequestGuard)
  @Delete('delete-hard/:id')
  @ApiOperation({ summary: 'Hard delete finished good' })
  async hardDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.finishedGoodService.removeHard(id);
    return { success: true, message: 'Permanently deleted successfully', data: null };
  }
}
