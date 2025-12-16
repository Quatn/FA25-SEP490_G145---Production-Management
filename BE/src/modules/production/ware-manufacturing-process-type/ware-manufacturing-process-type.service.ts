import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { WareManufacturingProcessType, WareManufacturingProcessTypeDocument } from '../schemas/ware-manufacturing-process-type.schema';
import { FilterQuery, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateWareManufacturingProcessTypeDto } from './dto/create-ware-manufacturing-process-type.dto';
import { UpdateWareManufacturingProcessTypeDto } from './dto/update-ware-manufacturing-process-type.dto';

type SoftWareManufacturingProcessType = WareManufacturingProcessType & SoftDeleteDocument;

@Injectable()
export class WareManufacturingProcessTypeService {
  constructor(
    @InjectModel(WareManufacturingProcessType.name)
    private readonly wmptModel: Model<WareManufacturingProcessType>,
  ) { }

  async checkDuplicates(
    dto: CreateWareManufacturingProcessTypeDto | UpdateWareManufacturingProcessTypeDto,
    excludeId?: string,
  ) {
    const code = dto.code?.trim();
    const name = dto.name?.trim();

    const orConditions: FilterQuery<WareManufacturingProcessTypeDocument>[] = [];
    if (code) orConditions.push({ code });
    if (name) orConditions.push({ name });

    if (orConditions.length === 0) return;

    const query: FilterQuery<WareManufacturingProcessTypeDocument> = { 
      $or: orConditions,
      isDeleted: { $in: [true, false] }, 
     };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const duplicates = await this.wmptModel
      .find(query)
      .select('code name')
      .lean();

    if (duplicates.length > 0) {
      const duplicateFields = new Set<string>();

      duplicates.forEach((doc) => {
        if (code && doc.code === code) duplicateFields.add('Mã loại gia công');
        if (name && doc.name === name) duplicateFields.add('Tên loại gia công');
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
      this.wmptModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ 'updatedAt': -1 })
        .exec(),
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

  async findDeleted(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const filter = { isDeleted: true };

    const [data, totalItems] = await Promise.all([
      this.wmptModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ 'updatedAt': -1 })
        .exec(),
      this.wmptModel.countDocuments(filter),
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
    const doc = await this.wmptModel.findById(id) as WareManufacturingProcessTypeDocument;
    if (!doc) throw new NotFoundException('Ware manufacturing process type not found');
    return doc;
  }

  async createOne(dto: CreateWareManufacturingProcessTypeDto): Promise<WareManufacturingProcessTypeDocument> {
    dto.code = dto.code.trim();
    dto.name = dto.name.trim();

    await this.checkDuplicates(dto);

    const doc = new this.wmptModel(dto);
    return await doc.save();
  }

  async updateOne(id: string, dto: UpdateWareManufacturingProcessTypeDto): Promise<WareManufacturingProcessTypeDocument> {
    dto.code = dto.code?.trim();
    dto.name = dto.name?.trim();
    await this.checkDuplicates(dto, id);
    const updated = await this.wmptModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new NotFoundException('Ware manufacturing process type not found');
    return updated;
  }

  async softDelete(id: string) {
    const doc = await this.wmptModel.findById(id) as SoftWareManufacturingProcessType;
    if (!doc) throw new NotFoundException('Ware manufacturing process type not found');
    await doc.softDelete();
    return { success: true };
  }

  async restore(id: string) {
    const doc = await this.wmptModel.findOne({
      _id: id,
      isDeleted: true
    }) as SoftWareManufacturingProcessType;
    if (!doc) throw new NotFoundException('Ware manufacturing process type not found');
    await doc.restore();
    return { success: true };
  }

  async removeHard(id: string) {
    const result = await this.wmptModel.findOneAndDelete({
      _id: id,
      isDeleted: true
    });
    if (!result) throw new NotFoundException('Ware manufacturing process type not found');
    return { success: true };
  }
}
