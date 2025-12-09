import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFluteCombinationDto } from './dto/create-flute-combination.dto';
import { UpdateFluteCombinationDto } from './dto/update-flute-combination.dto';
import { FluteCombination, FluteCombinationDocument } from '../schemas/flute-combination.schema';
import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

type SoftFluteCombination = FluteCombination & SoftDeleteDocument;

@Injectable()
export class FluteCombinationService {
  constructor(
    @InjectModel(FluteCombination.name)
    private readonly fcModel: Model<FluteCombination>,
  ) { }

  async checkDuplicates(
    dto: CreateFluteCombinationDto,
  ) {
    const code = dto.code?.trim();

    const query: any = {
      $or: [{ code }],
    };

    const duplicates = await this.fcModel.find(query).lean();

    if (duplicates.length > 0) {
      const duplicateFields: string[] = [];
      duplicates.forEach((item) => {
        if (item.code === code) duplicateFields.push('Mã tổ hợp sóng');
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
      ];
    }

    const [data, totalItems] = await Promise.all([
      this.fcModel.find(query).skip(skip).limit(limit).exec(),
      this.fcModel.countDocuments(query),
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
    return await this.fcModel.find();
  }

  async findDeleted(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const filter = { isDeleted: true };

    const [data, totalItems] = await Promise.all([
      this.fcModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.fcModel.countDocuments(filter),
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

  async findOne(id: string) {
    const doc = await this.fcModel.findById(id) as FluteCombinationDocument;
    if (!doc) throw new NotFoundException('Flute combination not found');
    return doc;
  }

  async createOne(dto: CreateFluteCombinationDto): Promise<FluteCombinationDocument> {
    await this.checkDuplicates(dto);
    const doc = new this.fcModel(dto);
    return await doc.save();
  }

  async updateOne(id: string, dto: UpdateFluteCombinationDto): Promise<FluteCombinationDocument> {
    try {
      const updated = await this.fcModel.findByIdAndUpdate(id, dto, { new: true });
      if (!updated) throw new NotFoundException('Flute combination not found');
      return updated as FluteCombinationDocument;
    } catch (err: any) {
      if (err.code === 11000 && err.keyValue) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        let message = '';

        if (field === 'code') {
          message = `Mã sóng "${value}" đã tồn tại.`;
        } else {
          message = `Giá trị "${value}" ở trường "${field}" đã tồn tại.`;
        }

        throw new BadRequestException(message);
      }
      throw err;
    }
  }

  async softDelete(id: string) {
    const doc = await this.fcModel.findById(id) as SoftFluteCombination;
    if (!doc) throw new NotFoundException('Flute combination not found');
    await doc.softDelete();
    return { success: true };
  }

  async restore(id: string) {
    const doc = await this.fcModel.findOne({
      _id: id,
      isDeleted: true
    }) as SoftFluteCombination;
    if (!doc) throw new NotFoundException('Flute combination not found');
    await doc.restore();
    return { success: true };
  }

  async removeHard(id: string) {
    const result = await this.fcModel.findOneAndDelete({
      _id: id,
      isDeleted: true
    });

    if (!result) {
      throw new NotFoundException('Flute combination not found or not in trash');
    }

    return { success: true };
  }
}
