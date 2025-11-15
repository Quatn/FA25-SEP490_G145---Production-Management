import { Controller, Get, Query, Param, Post, Body, Patch, Delete } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { WareService } from "./ware.service";
import { BaseResponse } from "@/common/dto/response.dto";
import { PaginatedList } from "@/common/dto/paginated-list.dto";
import { CreateWareDto } from "./dto/create-ware.dto";
import { UpdateWareDto } from "./dto/update-ware.dto";

@Controller("ware")
@ApiTags("Ware")
export class WareController {
  constructor(private readonly wareService: WareService) { }

  @Get()
  @ApiOperation({
    summary: "List wares with pagination and search",
  })
  findAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
  ) {
    return this.wareService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a ware by Mongo _id" })
  findOne(@Param("id") id: string) {
    return this.wareService.findOneById(id);
  }

  @Get("list")
  @ApiOperation({ summary: "List wares with pagination and search" })
  async findPaginated(
    @Query("page") page = "1",
    @Query("limit") limit = "100",
    @Query("search") search?: string,
  ): Promise<BaseResponse<PaginatedList<any>>> {
    const docs = await this.wareService.findAll({
      page: Number(page),
      limit: Number(limit),
      search,
    });
    return { success: true, message: "Fetch successful", data: docs };
  }

  @Get("list-all")
  @ApiOperation({ summary: "List all wares (no pagination)" })
  async findAllNoPagination(): Promise<BaseResponse<any[]>> {
    const docs = await this.wareService.findAllNoPagination();
    return { success: true, message: "Fetch successful", data: docs };
  }

  // @Get("detail/:id")
  // @ApiOperation({ summary: "Get ware detail (populated)" })
  // async findOne(@Param("id") id: string): Promise<BaseResponse<any>> {
  //   const doc = await this.wareService.findOneById(id);
  //   return { success: true, message: "Fetch successful", data: doc };
  // }

  @Post("create")
  @ApiOperation({ summary: "Create a new ware" })
  async create(@Body() dto: CreateWareDto): Promise<BaseResponse<any>> {
    const doc = await this.wareService.create(dto);
    return { success: true, message: `Created ware ${doc.code} successfully`, data: doc };
  }

  @Patch("update/:id")
  @ApiOperation({ summary: "Update a ware" })
  async update(@Param("id") id: string, @Body() dto: UpdateWareDto): Promise<BaseResponse<any>> {
    const doc = await this.wareService.update(id, dto);
    return { success: true, message: `Updated ware ${doc.code} successfully`, data: doc };
  }

  @Delete("delete-soft/:id")
  @ApiOperation({ summary: "Soft delete ware" })
  async softDelete(@Param("id") id: string): Promise<BaseResponse<null>> {
    await this.wareService.softDelete(id);
    return { success: true, message: "Soft deleted successfully", data: null };
  }

  @Patch("restore/:id")
  @ApiOperation({ summary: "Restore soft-deleted ware" })
  async restore(@Param("id") id: string): Promise<BaseResponse<null>> {
    await this.wareService.restore(id);
    return { success: true, message: "Restored successfully", data: null };
  }

  @Delete("delete-hard/:id")
  @ApiOperation({ summary: "Permanently delete ware" })
  async hardDelete(@Param("id") id: string): Promise<BaseResponse<null>> {
    await this.wareService.removeHard(id);
    return { success: true, message: "Permanently deleted successfully", data: null };
  }

  @Get("list-deleted")
  @ApiOperation({ summary: "List soft-deleted wares" })
  async listDeleted(@Query("page") page = "1", @Query("limit") limit = "100"): Promise<BaseResponse<PaginatedList<any>>> {
    const docs = await this.wareService.findDeleted(Number(page), Number(limit));
    return { success: true, message: "Fetch deleted successful", data: docs };
  }
}

