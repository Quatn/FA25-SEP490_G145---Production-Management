// src/modules/production/customer/customer.controller.ts
import { Controller, Get, Query, Param, Post, Body, Patch, Delete, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BaseResponse } from '@/common/dto/response.dto';
import { Customer, CustomerDocument } from '../schemas/customer.schema';
import { PaginatedList } from '@/common/dto/paginated-list.dto';
import { CreateCustomerRequestDto } from './dto/create-customer-request.dto';
import { UpdateCustomerRequestDto } from './dto/update-customer-request.dto';
import { PrivilegedJwtAuthGuard } from '@/common/guards/privileged-jwt-auth.guard';
import { customerAdminPrivileges, customerCreatePrivileges, customerGetPrivileges, customerUpdatePrivileges } from './customer-module-access-privileges';

const CustomerGetRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: customerGetPrivileges,
});

const CustomerCreateRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: customerCreatePrivileges,
});

const CustomerUpdateRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: customerUpdatePrivileges,
});

const CustomerAdminRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: customerAdminPrivileges,
});

@ApiBearerAuth("access-token")
@Controller('customer')
export class CustomerController {
  constructor(private readonly service: CustomerService) { }

  @UseGuards(CustomerGetRequestGuard)
  @Get('list-all')
  @ApiOperation({ summary: 'List all customers' })
  async findAll(): Promise<BaseResponse<Customer[]>> {
    const docs = await this.service.findAll();
    return {
      success: true,
      message: 'Fetch successful',
      data: docs,
    };
  }

  @UseGuards(CustomerGetRequestGuard)
  @Get("list")
  @ApiOperation({ summary: "List paginated customers" })
  async findPaginated(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query('search') search?: string,
  ): Promise<BaseResponse<PaginatedList<CustomerDocument>>> {
    const docs = await this.service.findPaginated(page, limit, search);
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }


  @UseGuards(CustomerAdminRequestGuard)
  @Get('list-deleted')
  @ApiOperation({ summary: 'List deleted customer' })
  async findDeleted(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
  ): Promise<BaseResponse<PaginatedList<Customer>>> {
    const docs = await this.service.findDeleted(page, limit);
    return {
      success: true,
      message: 'Fetch successful',
      data: docs,
    };
  }

  @UseGuards(CustomerGetRequestGuard)
  @Get("detail/:id")
  @ApiOperation({ summary: "Customer detail" })
  async findOne(@Param("id") id: string): Promise<BaseResponse<CustomerDocument>> {
    const doc = await this.service.findOne(id);
    return {
      success: true,
      message: "Fetch successful",
      data: doc,
    }
  }

  @UseGuards(CustomerCreateRequestGuard)
  @Post("create")
  @ApiOperation({ summary: "Create new customer" })
  async create(
    @Body() dto: CreateCustomerRequestDto,
  ): Promise<BaseResponse<CustomerDocument>> {
    const doc = await this.service.createOne(dto);
    return {
      success: true,
      message: `Created customer ${doc.code} - ${doc.name} successfully`,
      data: doc,
    };
  }

  @UseGuards(CustomerUpdateRequestGuard)
  @Patch("update/:id")
  @ApiOperation({ summary: "Update customer" })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateCustomerRequestDto,
  ): Promise<BaseResponse<CustomerDocument>> {
    const doc = await this.service.updateOne(id, dto);
    return {
      success: true,
      message: `Updated customer ${doc.code} - ${doc.name} successfully`,
      data: doc,
    };
  }


  @UseGuards(CustomerUpdateRequestGuard)
  @Delete("delete-soft/:id")
  @ApiOperation({ summary: "Soft delete customer" })
  async softDelete(
    @Param("id") id: string,
  ): Promise<BaseResponse<null>> {
    await this.service.softDelete(id);
    return {
      success: true,
      message: "Soft deleted successfully",
      data: null,
    };
  }

  @UseGuards(CustomerAdminRequestGuard)
  @Patch("restore/:id")
  @ApiOperation({ summary: "Restore customer" })
  async restore(
    @Param("id") id: string,
  ): Promise<BaseResponse<null>> {
    await this.service.restore(id);
    return {
      success: true,
      message: "Restored successfully",
      data: null,
    };
  }

  @UseGuards(CustomerAdminRequestGuard)
  @Delete("delete-hard/:id")
  @ApiOperation({ summary: "Hard delete customer" })
  async hardDelete(
    @Param("id") id: string,
  ): Promise<BaseResponse<null>> {
    await this.service.removeHard(id);
    return {
      success: true,
      message: "Permanently deleted successfully",
      data: null,
    };
  }


}