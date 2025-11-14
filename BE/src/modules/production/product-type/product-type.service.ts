import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { ProductType, ProductTypeDocument } from '../schemas/product-type.schema';
import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

type SoftProductType = ProductType & SoftDeleteDocument;

@Injectable()
export class ProductTypeService {
  constructor(
    @InjectModel(ProductType.name)
    private readonly pModel: Model<ProductType>,
  ) { }

  async checkDuplicates(dto: CreateProductTypeDto | UpdateProductTypeDto) {
    const duplicates = await this.pModel.aggregate([
      {
        $match: {
          $or: [
            { code: dto.code },
            { name: dto.name },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          code: 1,
          name: 1,
        },
      },
    ]);

    if (duplicates.length > 0) {
      const duplicateFields: string[] = [];
      duplicates.forEach((d) => {
        if (d.code === dto.code) duplicateFields.push('Mã loại sản phẩm');
        if (d.name === dto.name) duplicateFields.push('Tên loại sản phẩm');
      });
      throw new BadRequestException(
        `Trùng lặp giá trị ở các trường: ${duplicateFields.join(', ')}`,
      );
    }
  }

  async findPaginated(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    const query: any = {};

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { code: regex },
        { name: regex },
      ];
    }

    const [data, totalItems] = await Promise.all([
      this.pModel.find(query).skip(skip).limit(limit).exec(),
      this.pModel.countDocuments(query),
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

  async findAll() {
    return await this.pModel.find();
  }

  async findOne(id: string) {
    const doc = await this.pModel.findById(id) as ProductTypeDocument;
    if (!doc) throw new NotFoundException('Product type not found');
    return doc;
  }

  async createOne(dto: CreateProductTypeDto): Promise<ProductTypeDocument> {
    try {
      const doc = new this.pModel(dto);
      return await doc.save();
    } catch (err: any) {
      if (err.code === 11000 && err.keyValue) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        let message = '';

        if (field === 'code') {
          message = `Mã loại sản phẩm "${value}" đã tồn tại.`;
        } else {
          message = `Giá trị "${value}" ở trường "${field}" đã tồn tại.`;
        }

        throw new BadRequestException(message);
      }
      throw err;
    }
  }

  async updateOne(id: string, dto: UpdateProductTypeDto): Promise<ProductTypeDocument> {
    try {
      const updated = await this.pModel.findByIdAndUpdate(id, dto, { new: true });
      if (!updated) throw new NotFoundException('Product type not found');
      return updated as ProductTypeDocument;
    } catch (err: any) {
      if (err.code === 11000 && err.keyValue) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        let message = '';

        if (field === 'code') {
          message = `Mã loại sản phẩm "${value}" đã tồn tại.`;
        } else {
          message = `Giá trị "${value}" ở trường "${field}" đã tồn tại.`;
        }

        throw new BadRequestException(message);
      }
      throw err;
    }
  }

  async softDelete(id: string) {
    const doc = await this.pModel.findById(id) as SoftProductType;
    if (!doc) throw new NotFoundException('Product type not found');
    await doc.softDelete();
    return { success: true };
  }

  async restore(id: string) {
    const doc = await this.pModel.findById(id) as SoftProductType;
    if (!doc) throw new NotFoundException('Product type not found');
    await doc.restore();
    return { success: true };
  }

  async removeHard(id: string) {
    const result = await this.pModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Product type not found');
    return { success: true };
  }
}
