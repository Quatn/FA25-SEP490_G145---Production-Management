import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductService } from "./product.service";
import { ProductType } from "../schemas/product.schema";

@Controller("products")
@ApiTags("Products")
// @ApiBearerAuth("access-token")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: "Create a new product" })
  create(@Body() payload: CreateProductDto) {
    return this.productService.create(payload);
  }

  @Get()
  @ApiOperation({
    summary:
      "List products with pagination, search and filters (customerCode, productType)",
  })
  findAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("productType") productType?: ProductType | string,
    @Query("customerCode") customerCode?: string,
  ) {
    return this.productService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      productType,
      customerCode,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a product by Mongo _id" })
  findOne(@Param("id") id: string) {
    return this.productService.findOneById(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a product by Mongo _id" })
  update(@Param("id") id: string, @Body() payload: UpdateProductDto) {
    return this.productService.update(id, payload);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft delete a product by Mongo _id" })
  remove(@Param("id") id: string) {
    return this.productService.remove(id);
  }
}


