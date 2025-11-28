import { BaseResponse } from "@/common/dto/response.dto";
import { Controller, Get, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiExtraModels, ApiOperation } from "@nestjs/swagger";
import { Employee } from "./schemas/employee.schema";
import { ApiResponseWith } from "@/common/decorators/swagger-response-docs";
import {
  QueryListFullDetailsEmployeeRequestDto,
  QueryListFullDetailsEmployeeResponseDto,
} from "./dto/query-list-full-details-employees.dto";
import { EmployeeService } from "./employee.service";

@ApiBearerAuth("access-token")
@Controller("employee")
@ApiExtraModels(BaseResponse, Employee)
export class EmployeeController {
  constructor(private emplService: EmployeeService) { }

  @Get("query/full-details")
  @ApiOperation({ summary: "Query full details employees" })
  @ApiResponseWith(Employee, { paginated: true })
  async queryList(
    @Query() query: QueryListFullDetailsEmployeeRequestDto,
  ): Promise<QueryListFullDetailsEmployeeResponseDto> {
    const docs = await this.emplService.queryListFullDetails(query);
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
}
