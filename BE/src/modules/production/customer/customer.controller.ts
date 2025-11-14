import { Controller, Get } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { BaseResponse } from '@/common/dto/response.dto';
import { ApiOperation } from '@nestjs/swagger';
import { Customer } from '../schemas/customer.schema';

@Controller('customer')
export class CustomerController {
  constructor(private readonly service: CustomerService) { }


  @Get('list-all')
  @ApiOperation({ summary: 'List customers' })
  async findAll(): Promise<BaseResponse<Customer[]>> {
    const docs = await this.service.findAll();
    return {
      success: true,
      message: 'Fetch successful',
      data: docs,
    };
  }


}
