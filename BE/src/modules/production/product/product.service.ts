import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { Product, ProductDocument } from "../schemas/product.schema";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { SoftDeleteDocument } from "@/common/types/soft-delete-document";

type SoftProduct = Product & SoftDeleteDocument;

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) { }

  async create(payload: CreateProductDto): Promise<Product> {
    const created = await this.productModel.create(payload);
    const populated = await this.productModel
      .findById(created._id)
      .populate({
        path: "wares",
        populate: {
          path: "finishingProcesses",
        },
      })
      .populate("customer")
      .populate("productType")
      .exec();
    if (!populated) {
      throw new NotFoundException("Failed to create product");
    }
    return populated;
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    productType?: string;
    customer?: string;
  }): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 10));

    const filter: FilterQuery<ProductDocument> = {
      isDeleted: false,
    };

    if (options.productType) {
      filter.productType = options.productType;
    }
    if (options.customer) {
      filter.customer = options.customer;
    }
    if (options.search) {
      const regex = new RegExp(options.search, "i");
      filter.$or = [
        { code: regex }, // product code
        { name: regex },
        { productName: regex },
      ];
    }

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate({
          path: "wares",
          populate: [
            { path: "finishingProcesses" },
            { path: "fluteCombination" }
          ],
        })
        .populate("customer")
        .populate("productType")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }

  async findOneById(id: string): Promise<Product> {
    const doc = await this.productModel
      .findById(id)
      .populate({
        path: "wares",
        populate: {
          path: "finishingProcesses",
        },
      })
      .populate("customer")
      .populate("productType")
      .exec();
    if (!doc) {
      throw new NotFoundException("Product not found");
    }
    return doc;
  }

  async findOneByCode(productCode: string): Promise<Product | null> {
    return this.productModel
      .findOne({ code: productCode })
      .populate({
        path: "wares",
        populate: {
          path: "finishingProcesses",
        },
      })
      .populate("customer")
      .populate("productType")
      .exec();
  }

  async update(id: string, payload: UpdateProductDto): Promise<Product> {
    const updated = await this.productModel
      .findByIdAndUpdate(id, payload, { new: true })
      .populate({
        path: "wares",
        populate: {
          path: "finishingProcesses",
        },
      })
      .populate("customer")
      .populate("productType")
      .exec();
    if (!updated) {
      throw new NotFoundException("Product not found");
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    // Soft delete
    const res = await this.productModel
      .findById(id) as SoftProduct;
    if (!res) throw new NotFoundException("Paper type not found");
    await res.softDelete();

  }

  async restore(id: string) {
    const doc = await this.productModel.findOne({
      _id: id,
      isDeleted: true
    }) as SoftProduct;
    if (!doc) throw new NotFoundException("Product not found");
    await doc.restore();
    return { success: true };
  }

  // Find deleted products (bypassing pre('find') middleware using raw collection)
  async findDeleted(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const filter = { isDeleted: true };

    const [rawDocs, totalCount] = await Promise.all([
      this.productModel.collection.find(filter).skip(skip).limit(limit).toArray(),
      this.productModel.collection.countDocuments(filter),
    ]);

    // Populate raw documents with nested populates similar to findAll
    const populatedDocs = await this.productModel.populate(rawDocs, [
      {
        path: "wares",
        populate: [
          { path: "finishingProcesses" },
          { path: "fluteCombination" },
        ],
      },
      { path: "customer" },
      { path: "productType" },
    ]);

    const totalPages = Math.ceil((totalCount || 0) / limit);
    return {
      data: populatedDocs,
      page,
      limit,
      totalItems: totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}
