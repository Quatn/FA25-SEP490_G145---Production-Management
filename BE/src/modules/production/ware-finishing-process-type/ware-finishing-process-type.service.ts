import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { WareFinishingProcessType, WareFinishingProcessTypeDocument } from '../schemas/ware-finishing-process-type.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateWareFinishingProcessTypeDto } from './dto/create-ware-finishing-process-type.dto';
import { UpdateWareFinishingProcessTypeDto } from './dto/update-ware-finishing-process-type.dto';

type SoftWareFinishingProcessType = WareFinishingProcessType & SoftDeleteDocument;

@Injectable()
export class WareFinishingProcessTypeService {
  constructor(
    @InjectModel(WareFinishingProcessType.name)
    private readonly wfptModel: Model<WareFinishingProcessType>,
  ) {}

  async checkDuplicates(dto: CreateWareFinishingProcessTypeDto | UpdateWareFinishingProcessTypeDto) {
    const duplicates = await this.wfptModel.aggregate([
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
        if (d.code === dto.code) duplicateFields.push('Mã loại hoàn thiện');
        if (d.name === dto.name) duplicateFields.push('Tên loại hoàn thiện');
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
      this.wfptModel.find(query).skip(skip).limit(limit).exec(),
      this.wfptModel.countDocuments(query),
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
    return await this.wfptModel.find();
  }

  async findOne(id: string) {
    const doc = await this.wfptModel.findById(id) as WareFinishingProcessTypeDocument;
    if (!doc) throw new NotFoundException('Ware finishing process type not found');
    return doc;
  }

  async createOne(dto: CreateWareFinishingProcessTypeDto): Promise<WareFinishingProcessTypeDocument> {
    try {
      const doc = new this.wfptModel(dto);
      return await doc.save();
    } catch (err: any) {
      if (err.code === 11000 && err.keyValue) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        let message = '';

        if (field === 'code') {
          message = `Mã loại hoàn thiện "${value}" đã tồn tại.`;
        } else {
          message = `Giá trị "${value}" ở trường "${field}" đã tồn tại.`;
        }

        throw new BadRequestException(message);
      }
      throw err;
    }
  }

  async updateOne(id: string, dto: UpdateWareFinishingProcessTypeDto): Promise<WareFinishingProcessTypeDocument> {
    try {
      const updated = await this.wfptModel.findByIdAndUpdate(id, dto, { new: true });
      if (!updated) throw new NotFoundException('Ware finishing process type not found');
      return updated as WareFinishingProcessTypeDocument;
    } catch (err: any) {
      if (err.code === 11000 && err.keyValue) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        let message = '';

        if (field === 'code') {
          message = `Mã loại hoàn thiện "${value}" đã tồn tại.`;
        } else {
          message = `Giá trị "${value}" ở trường "${field}" đã tồn tại.`;
        }

        throw new BadRequestException(message);
      }
      throw err;
    }
  }

  async softDelete(id: string) {
    const doc = await this.wfptModel.findById(id) as SoftWareFinishingProcessType;
    if (!doc) throw new NotFoundException('Ware finishing process type not found');
    await doc.softDelete();
    return { success: true };
  }

  async restore(id: string) {
    const doc = await this.wfptModel.findById(id) as SoftWareFinishingProcessType;
    if (!doc) throw new NotFoundException('Ware finishing process type not found');
    await doc.restore();
    return { success: true };
  }

  async removeHard(id: string) {
    const result = await this.wfptModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Ware finishing process type not found');
    return { success: true };
  }
}
