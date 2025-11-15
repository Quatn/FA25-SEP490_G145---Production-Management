// src/modules/production/customer/customer.controller.ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { ApiOperation } from '@nestjs/swagger';
import { BaseResponse } from '@/common/dto/response.dto';
import { Customer } from '../schemas/customer.schema';

@Controller('customer')
export class CustomerController {
  constructor(private readonly svc: CustomerService) {}

  @Get('list-all')
  @ApiOperation({ summary: 'List all customers' })
  async findAll(): Promise<BaseResponse<Customer[]>> {
    const docs = await this.svc.findAll();
    return {
      success: true,
      message: 'Fetch successful',
      data: docs,
    };
  }

  @Get('list')
  @ApiOperation({ summary: 'List customers (paginated)' })
  async findPaginated(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ): Promise<BaseResponse<any>> {
    const docs = await this.svc.findPaginated(Number(page), Number(limit), search);
    return {
      success: true,
      message: 'Fetch successful',
      data: docs,
    };
  }

  @Get('detail/:id')
  @ApiOperation({ summary: 'Customer detail' })
  async detail(@Param('id') id: string): Promise<BaseResponse<any>> {
    const doc = await this.svc.findOne(id);
    return {
      success: true,
      message: 'Fetch successful',
      data: doc,
    };
  }
}