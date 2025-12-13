import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { ProductType, ProductTypeDocument } from '../schemas/product-type.schema';
import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

type SoftProductType = ProductType & SoftDeleteDocument;

@Injectable()
export class ProductTypeService {
  constructor(
    @InjectModel(ProductType.name)
    private readonly pModel: Model<ProductType>,
  ) { }

  async checkDuplicates(
    dto: CreateProductTypeDto | UpdateProductTypeDto,
    excludeId?: string,
  ) {
    const code = dto.code?.trim();
    const name = dto.name?.trim();

    const orConditions: FilterQuery<ProductTypeDocument>[] = [];
    if (code) orConditions.push({ code });
    if (name) orConditions.push({ name });

    if (orConditions.length === 0) return;

    const query: FilterQuery<ProductTypeDocument> = { $or: orConditions };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const duplicates = await this.pModel
      .find(query)
      .select('code name')
      .lean();

    if (duplicates.length > 0) {
      const duplicateFields = new Set<string>();

      duplicates.forEach((doc) => {
        if (code && doc.code === code) duplicateFields.add('Mã loại sản phẩm');
        if (name && doc.name === name) duplicateFields.add('Tên loại sản phẩm');
      });

      if (duplicateFields.size > 0) {
        throw new BadRequestException(
          `Trùng lặp giá trị ở các trường: ${Array.from(duplicateFields).join(', ')}`,
        );
      }
    }
  }

  async findPaginated(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    const query: any = {};

    if (search && search.trim() !== '') {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedSearch.trim(), 'i');
      query.$or = [
        { code: regex },
        { name: regex },
      ];
    }

    const [data, totalItems] = await Promise.all([
      this.pModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ 'updatedAt': -1 })
        .exec(),
      this.pModel.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async findDeleted(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const filter = { isDeleted: true };

    const [data, totalItems] = await Promise.all([
      this.pModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ 'updatedAt': -1 })
        .exec(),
      this.pModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil((totalItems || 0) / limit);
    return {
      data,
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async findAll() {
    return await this.pModel.find();
  }

  async findOne(id: string) {
    const doc = await this.pModel.findById(id) as ProductTypeDocument;
    if (!doc) throw new NotFoundException('Product type not found');
    return doc;
  }

  async createOne(dto: CreateProductTypeDto): Promise<ProductTypeDocument> {
    dto.code = dto.code.trim();
    dto.name = dto.name.trim();

    await this.checkDuplicates(dto);

    const doc = new this.pModel(dto);
    return await doc.save();
  }

  async updateOne(id: string, dto: UpdateProductTypeDto): Promise<ProductTypeDocument> {
    dto.code = dto.code?.trim();
    dto.name = dto.name?.trim();
    await this.checkDuplicates(dto, id);
    const updated = await this.pModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new NotFoundException('Product type not found');
    return updated;
  }

  async softDelete(id: string) {
    const doc = await this.pModel.findById(id) as SoftProductType;
    if (!doc) throw new NotFoundException('Product type not found');
    await doc.softDelete();
    return { success: true };
  }

  async restore(id: string) {
    const doc = await this.pModel.findOne({
      _id: id,
      isDeleted: true
    }) as SoftProductType;
    if (!doc) throw new NotFoundException('Product type not found');
    await doc.restore();
    return { success: true };
  }

  async removeHard(id: string) {
    const result = await this.pModel.findOneAndDelete({
      _id: id,
      isDeleted: true
    });
    if (!result) throw new NotFoundException('Product type not found');
    return { success: true };
  }
}
