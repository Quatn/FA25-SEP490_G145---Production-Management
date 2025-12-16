import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WareFinishingProcessTypeService } from './ware-finishing-process-type.service';
import { CreateWareFinishingProcessTypeDto } from './dto/create-ware-finishing-process-type.dto';
import { UpdateWareFinishingProcessTypeDto } from './dto/update-ware-finishing-process-type.dto';
import { WareFinishingProcessType } from '../schemas/ware-finishing-process-type.schema';
import { BaseResponse } from '@/common/dto/response.dto';
import { PaginatedList } from '@/common/dto/paginatedList.dto';
import { PrivilegedJwtAuthGuard } from '@/common/guards/privileged-jwt-auth.guard';
import { wareFinishingProcessTypeAdminPrivileges, wareFinishingProcessTypeCreatePrivileges, wareFinishingProcessTypeGetPrivileges, wareFinishingProcessTypeUpdatePrivileges } from './ware-finishing-process-type-module-access-privileges';

const WareFinishingProcessTypeGetRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: wareFinishingProcessTypeGetPrivileges,
});

const WareFinishingProcessTypeCreateRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: wareFinishingProcessTypeCreatePrivileges,
});

const WareFinishingProcessTypeUpdateRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: wareFinishingProcessTypeUpdatePrivileges,
});

const WareFinishingProcessTypeAdminRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: wareFinishingProcessTypeAdminPrivileges,
});

@ApiBearerAuth("access-token")
@Controller('ware-finishing-process-type')
export class WareFinishingProcessTypeController {
  constructor(private readonly service: WareFinishingProcessTypeService) { }

  @UseGuards(WareFinishingProcessTypeGetRequestGuard)
  @Get('list')
  @ApiOperation({ summary: 'List paginated ware finishing process types' })
  async findPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<BaseResponse<PaginatedList<WareFinishingProcessType>>> {
    const docs = await this.service.findPaginated(page, limit, search);
    return {
      success: true,
      message: 'Fetch successful',
      data: docs,
    };
  }

  @UseGuards(WareFinishingProcessTypeAdminRequestGuard)
  @Get('list-deleted')
  @ApiOperation({ summary: 'List deleted ware finishing process type' })
  async findDeleted(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
  ): Promise<BaseResponse<PaginatedList<WareFinishingProcessType>>> {
    const docs = await this.service.findDeleted(page, limit);
    return {
      success: true,
      message: 'Fetch successful',
      data: docs,
    };
  }

  @UseGuards(WareFinishingProcessTypeGetRequestGuard)
  @Get('list-all')
  @ApiOperation({ summary: 'List ware finishing process types' })
  async findAll(): Promise<BaseResponse<WareFinishingProcessType[]>> {
    const docs = await this.service.findAll();
    return {
      success: true,
      message: 'Fetch successful',
      data: docs,
    };
  }

  @UseGuards(WareFinishingProcessTypeGetRequestGuard)
  @Get('detail/:id')
  @ApiOperation({ summary: 'Ware finishing process type detail' })
  async findOne(@Param('id') id: string): Promise<BaseResponse<WareFinishingProcessType>> {
    const doc = await this.service.findOne(id);
    return {
      success: true,
      message: 'Fetch successful',
      data: doc,
    };
  }

  @UseGuards(WareFinishingProcessTypeCreateRequestGuard)
  @Post('create')
  @ApiOperation({ summary: 'Create new ware finishing process type' })
  async create(@Body() dto: CreateWareFinishingProcessTypeDto): Promise<BaseResponse<WareFinishingProcessType>> {
    const doc = await this.service.createOne(dto);
    return {
      success: true,
      message: `Created type ${doc.code} - ${doc.name} successfully`,
      data: doc,
    };
  }

  @UseGuards(WareFinishingProcessTypeUpdateRequestGuard)
  @Patch('update/:id')
  @ApiOperation({ summary: 'Update ware finishing process type' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWareFinishingProcessTypeDto,
  ): Promise<BaseResponse<WareFinishingProcessType>> {
    const doc = await this.service.updateOne(id, dto);
    return {
      success: true,
      message: `Updated type ${doc.code} - ${doc.name} successfully`,
      data: doc,
    };
  }

  @UseGuards(WareFinishingProcessTypeUpdateRequestGuard)
  @Delete('delete-soft/:id')
  @ApiOperation({ summary: 'Soft delete ware finishing process type' })
  async softDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.service.softDelete(id);
    return {
      success: true,
      message: 'Soft deleted successfully',
      data: null,
    };
  }

  @UseGuards(WareFinishingProcessTypeAdminRequestGuard)
  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restore ware finishing process type' })
  async restore(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.service.restore(id);
    return {
      success: true,
      message: 'Restored successfully',
      data: null,
    };
  }

  @UseGuards(WareFinishingProcessTypeAdminRequestGuard)
  @Delete('delete-hard/:id')
  @ApiOperation({ summary: 'Hard delete ware finishing process type' })
  async hardDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.service.removeHard(id);
    return {
      success: true,
      message: 'Permanently deleted successfully',
      data: null,
    };
  }
}
