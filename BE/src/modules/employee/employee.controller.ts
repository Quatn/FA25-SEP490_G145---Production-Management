import { BaseResponse } from "@/common/dto/response.dto";
import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiExtraModels, ApiOperation } from "@nestjs/swagger";
import { Employee } from "./schemas/employee.schema";
import { ApiResponseWith } from "@/common/decorators/swagger-response-docs";
import {
  QueryListFullDetailsEmployeeRequestDto,
  QueryListFullDetailsEmployeeResponseDto,
} from "./dto/query-list-full-details-employees.dto";
import { EmployeeService } from "./employee.service";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import mongoose from "mongoose";
import { CreateEmployeeDto } from "./dto/create-employee.dto";

@ApiBearerAuth("access-token")
@Controller("employee")
@ApiExtraModels(BaseResponse, Employee)
export class EmployeeController {
  constructor(private emplService: EmployeeService) { }

  @Get("query/full-details")
  async queryList(
    @Query() q: QueryListFullDetailsEmployeeRequestDto
  ): Promise<QueryListFullDetailsEmployeeResponseDto> {
    const { page = 1, limit = 10, query } = q;

    const filter: any = {};
    if (query && String(query).trim() !== "") {
      const qTrim = String(query).trim();
      filter.$or = [
        { code: { $regex: qTrim, $options: "i" } },
        { name: { $regex: qTrim, $options: "i" } },
      ];
    }

    const docs = await this.emplService.queryListFullDetails({
      page: Number(page),
      limit: Number(limit),
      filter,
    });

    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  @Get("query/get-employees-for-users-list")
  @ApiOperation({
    summary:
      "Query full details employees specifically tasks involving users list (prioritises employees with user)",
  })
  @ApiResponseWith(Employee, { paginated: true })
  async queryListForUserLists(
    @Query() query: QueryListFullDetailsEmployeeRequestDto,
  ): Promise<QueryListFullDetailsEmployeeResponseDto> {
    const docs = await this.emplService.queryListFullDetails({
      ...query,
      sort: [{ hasUser: -1 }],
    });
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  @Post()
  @ApiOperation({ summary: "Create employee" })
  @ApiResponseWith(Employee)
  async create(@Body() body: CreateEmployeeDto) {
    const created = await this.emplService.create(body);
    return {
      success: true,
      message: "Created",
      data: created,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get employee by id" })
  @ApiResponseWith(Employee)
  async getById(@Param("id") id: string) {
    const doc = await this.emplService.findById(new mongoose.Types.ObjectId(id));
    if (!doc) throw new NotFoundException("Employee not found");
    // populate role if needed (findById in service could already return populated)
    return {
      success: true,
      message: "Fetch successful",
      data: doc,
    };
  }

  @Put(":id")
  @ApiOperation({ summary: "Update employee" })
  @ApiResponseWith(Employee)
  async update(@Param("id") id: string, @Body() body: UpdateEmployeeDto) {
    const updated = await this.emplService.update(id, body);
    return {
      success: true,
      message: "Updated",
      data: updated,
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft delete employee" })
  async softDelete(@Param("id") id: string) {
    const res = await this.emplService.softDelete(id);
    return {
      success: true,
      message: res.message ?? "Deleted",
    };
  }

  @Get("query/deleted")
  @ApiOperation({ summary: "Query deleted employees (soft-deleted)" })
  async queryDeleted(
    @Query("page", new ParseIntPipe({ optional: true })) page = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    const docs = await this.emplService.findDeleted(page, limit);
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  @Post(":id/restore")
  @ApiOperation({ summary: "Restore soft-deleted employee" })
  async restore(@Param("id") id: string) {
    const res = await this.emplService.restore(id);
    return {
      success: true,
      message: res.message ?? "Restored",
    };
  }
}
