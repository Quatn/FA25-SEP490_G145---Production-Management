import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { WareManufacturingProcessType, WareManufacturingProcessTypeDocument } from '../schemas/ware-manufacturing-process-type.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateWareManufacturingProcessTypeDto } from './dto/create-ware-manufacturing-process-type.dto';
import { UpdateWareManufacturingProcessTypeDto } from './dto/update-ware-manufacturing-process-type.dto';

type SoftWareManufacturingProcessType = WareManufacturingProcessType & SoftDeleteDocument;

@Injectable()
export class WareManufacturingProcessTypeService {
  constructor(
    @InjectModel(WareManufacturingProcessType.name)
    private readonly wmptModel: Model<WareManufacturingProcessType>,
  ) {}

  async checkDuplicates(dto: CreateWareManufacturingProcessTypeDto | UpdateWareManufacturingProcessTypeDto) {
    const duplicates = await this.wmptModel.aggregate([
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
        if (d.code === dto.code) duplicateFields.push('Mã loại quy trình');
        if (d.name === dto.name) duplicateFields.push('Tên loại quy trình');
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
      this.wmptModel.find(query).skip(skip).limit(limit).exec(),
      this.wmptModel.countDocuments(query),
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
    return await this.wmptModel.find();
  }

  async findOne(id: string) {
    const doc = await this.wmptModel.findById(id) as WareManufacturingProcessTypeDocument;
    if (!doc) throw new NotFoundException('Ware manufacturing process type not found');
    return doc;
  }

  async createOne(dto: CreateWareManufacturingProcessTypeDto): Promise<WareManufacturingProcessTypeDocument> {
    try {
      const doc = new this.wmptModel(dto);
      return await doc.save();
    } catch (err: any) {
      if (err.code === 11000 && err.keyValue) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        let message = '';

        if (field === 'code') {
          message = `Mã loại quy trình "${value}" đã tồn tại.`;
        } else {
          message = `Giá trị "${value}" ở trường "${field}" đã tồn tại.`;
        }

        throw new BadRequestException(message);
      }
      throw err;
    }
  }

  async updateOne(id: string, dto: UpdateWareManufacturingProcessTypeDto): Promise<WareManufacturingProcessTypeDocument> {
    try {
      const updated = await this.wmptModel.findByIdAndUpdate(id, dto, { new: true });
      if (!updated) throw new NotFoundException('Ware manufacturing process type not found');
      return updated as WareManufacturingProcessTypeDocument;
    } catch (err: any) {
      if (err.code === 11000 && err.keyValue) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        let message = '';

        if (field === 'code') {
          message = `Mã loại quy trình "${value}" đã tồn tại.`;
        } else {
          message = `Giá trị "${value}" ở trường "${field}" đã tồn tại.`;
        }

        throw new BadRequestException(message);
      }
      throw err;
    }
  }

  async softDelete(id: string) {
    const doc = await this.wmptModel.findById(id) as SoftWareManufacturingProcessType;
    if (!doc) throw new NotFoundException('Ware manufacturing process type not found');
    await doc.softDelete();
    return { success: true };
  }

  async restore(id: string) {
    const doc = await this.wmptModel.findById(id) as SoftWareManufacturingProcessType;
    if (!doc) throw new NotFoundException('Ware manufacturing process type not found');
    await doc.restore();
    return { success: true };
  }

  async removeHard(id: string) {
    const result = await this.wmptModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Ware manufacturing process type not found');
    return { success: true };
  }
}
