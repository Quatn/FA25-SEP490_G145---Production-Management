import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BaseResponse } from '@/common/dto/response.dto';
import { PaginatedList } from '@/common/dto/paginatedList.dto';
import { ProductTypeService } from './product-type.service';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { ApiOperation } from '@nestjs/swagger';
import { ProductType } from '../schemas/product-type.schema';

@Controller('product-type')
export class ProductTypeController {
  constructor(private readonly service: ProductTypeService) { }

  @Get('list')
  @ApiOperation({ summary: 'List paginated product types' })
  async findPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<BaseResponse<PaginatedList<ProductType>>> {
    const docs = await this.service.findPaginated(page, limit, search);
    return {
      success: true,
      message: 'Fetch successful',
      data: docs,
    };
  }

  // @UseGuards(JwtAuthGuard)
  @Get('list-deleted')
  @ApiOperation({ summary: 'List deleted product type' })
  async findDeleted(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
  ): Promise<BaseResponse<PaginatedList<ProductType>>> {
    const docs = await this.service.findDeleted(page, limit);
    return {
      success: true,
      message: 'Fetch successful',
      data: docs,
    };
  }

  @Get('list-all')
  @ApiOperation({ summary: 'List product types' })
  async findAll(): Promise<BaseResponse<ProductType[]>> {
    const docs = await this.service.findAll();
    return {
      success: true,
      message: 'Fetch successful',
      data: docs,
    };
  }

  @Get('detail/:id')
  @ApiOperation({ summary: 'product type detail' })
  async findOne(@Param('id') id: string): Promise<BaseResponse<ProductType>> {
    const doc = await this.service.findOne(id);
    return {
      success: true,
      message: 'Fetch successful',
      data: doc,
    };
  }

  @Post('create')
  @ApiOperation({ summary: 'Create new product type' })
  async create(@Body() dto: CreateProductTypeDto): Promise<BaseResponse<ProductType>> {
    const doc = await this.service.createOne(dto);
    return {
      success: true,
      message: `Created type ${doc.code} - ${doc.name} successfully`,
      data: doc,
    };
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update product type' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductTypeDto,
  ): Promise<BaseResponse<ProductType>> {
    const doc = await this.service.updateOne(id, dto);
    return {
      success: true,
      message: `Updated type ${doc.code} - ${doc.name} successfully`,
      data: doc,
    };
  }

  @Delete('delete-soft/:id')
  @ApiOperation({ summary: 'Soft delete product type' })
  async softDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.service.softDelete(id);
    return {
      success: true,
      message: 'Soft deleted successfully',
      data: null,
    };
  }

  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restore product type' })
  async restore(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.service.restore(id);
    return {
      success: true,
      message: 'Restored successfully',
      data: null,
    };
  }

  @Delete('delete-hard/:id')
  @ApiOperation({ summary: 'Hard delete product type' })
  async hardDelete(@Param('id') id: string): Promise<BaseResponse<null>> {
    await this.service.removeHard(id);
    return {
      success: true,
      message: 'Permanently deleted successfully',
      data: null,
    };
  }
}
