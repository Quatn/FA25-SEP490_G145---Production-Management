import { Controller, Get, Query, Param } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { WareService } from "./ware.service";

@Controller("wares")
@ApiTags("Wares")
export class WareController {
  constructor(private readonly wareService: WareService) {}

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
}

