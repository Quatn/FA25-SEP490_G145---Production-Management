import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { WareFinishingProcessType, WareFinishingProcessTypeDocument } from '../schemas/ware-finishing-process-type.schema';
import { FilterQuery, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateWareFinishingProcessTypeDto } from './dto/create-ware-finishing-process-type.dto';
import { UpdateWareFinishingProcessTypeDto } from './dto/update-ware-finishing-process-type.dto';

type SoftWareFinishingProcessType = WareFinishingProcessType & SoftDeleteDocument;

@Injectable()
export class WareFinishingProcessTypeService {
  constructor(
    @InjectModel(WareFinishingProcessType.name)
    private readonly wfptModel: Model<WareFinishingProcessType>,
  ) { }

  async checkDuplicates(
    dto: CreateWareFinishingProcessTypeDto | UpdateWareFinishingProcessTypeDto,
    excludeId?: string,
  ) {
    const code = dto.code?.trim();
    const name = dto.name?.trim();

    const orConditions: FilterQuery<WareFinishingProcessTypeDocument>[] = [];
    if (code) orConditions.push({ code });
    if (name) orConditions.push({ name });

    if (orConditions.length === 0) return;

    const query: FilterQuery<WareFinishingProcessTypeDocument> = { $or: orConditions };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const duplicates = await this.wfptModel
      .find(query)
      .select('code name')
      .lean();

    if (duplicates.length > 0) {
      const duplicateFields = new Set<string>();

      duplicates.forEach((doc) => {
        if (code && doc.code === code) duplicateFields.add('Mã loại hoàn thiện');
        if (name && doc.name === name) duplicateFields.add('Tên loại hoàn thiện');
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

    if (search && search.trim() !== "") {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedSearch, 'i');
      query.$or = [
        { code: regex },
        { name: regex },
      ];
    }

    const [data, totalItems] = await Promise.all([
      this.wfptModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ 'updatedAt': -1 })
        .exec(),
      this.wfptModel.countDocuments(),
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

  async findDeleted(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const filter = { isDeleted: true };

    const [data, totalItems] = await Promise.all([
      this.wfptModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ 'updatedAt': -1 })
        .exec(),
      this.wfptModel.countDocuments(filter),
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
    const doc = await this.wfptModel.findById(id) as WareFinishingProcessTypeDocument;
    if (!doc) throw new NotFoundException('Ware finishing process type not found');
    return doc;
  }

  async createOne(dto: CreateWareFinishingProcessTypeDto): Promise<WareFinishingProcessTypeDocument> {
    dto.code = dto.code.trim();
    dto.name = dto.name.trim();

    await this.checkDuplicates(dto);

    const doc = new this.wfptModel(dto);
    return await doc.save();
  }

  async updateOne(id: string, dto: UpdateWareFinishingProcessTypeDto): Promise<WareFinishingProcessTypeDocument> {
    dto.code = dto.code?.trim();
    dto.name = dto.name?.trim();
    await this.checkDuplicates(dto, id);
    const updated = await this.wfptModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new NotFoundException('Ware finishing process type not found');
    return updated;
  }

  async softDelete(id: string) {
    const doc = await this.wfptModel.findById(id) as SoftWareFinishingProcessType;
    if (!doc) throw new NotFoundException('Ware finishing process type not found');
    await doc.softDelete();
    return { success: true };
  }

  async restore(id: string) {
    const doc = await this.wfptModel.findOne({
      _id: id,
      isDeleted: true
    }) as SoftWareFinishingProcessType;
    if (!doc) throw new NotFoundException('Ware finishing process type not found');
    await doc.restore();
    return { success: true };
  }

  async removeHard(id: string) {
    const result = await this.wfptModel.findOneAndDelete({
      _id: id,
      isDeleted: true
    });
    if (!result) throw new NotFoundException('Ware finishing process type not found');
    return { success: true };
  }
}
