import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { Product, ProductDocument } from "./schemas/product.schema";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(payload: CreateProductDto): Promise<Product> {
    const created = await this.productModel.create(payload);
    return created;
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    productType?: string;
    customerCode?: string;
  }): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 10));
    // const limit = 3;

    const filter: FilterQuery<ProductDocument> = {
      isDeleted: false,
    };

    if (options.productType) {
      filter.productType = options.productType;
    }
    if (options.customerCode) {
      filter.customerCode = options.customerCode;
    }
    if (options.search) {
      const regex = new RegExp(options.search, "i");
      filter.$or = [
        { id: regex }, // product code
        { productName: regex },
        { "wareCodes.wareCode": regex },
      ];
    }

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }

  async findOneById(id: string): Promise<Product> {
    const doc = await this.productModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException("Product not found");
    }
    return doc;
  }

  async findOneByCode(productCode: string): Promise<Product | null> {
    return this.productModel.findOne({ id: productCode }).exec();
  }

  async update(id: string, payload: UpdateProductDto): Promise<Product> {
    const updated = await this.productModel
      .findByIdAndUpdate(id, payload, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException("Product not found");
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    // Soft delete
    const res = await this.productModel
      .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
      .exec();
    if (!res) {
      throw new NotFoundException("Product not found");
    }
  }
}
