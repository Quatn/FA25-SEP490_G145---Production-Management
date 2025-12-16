import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrintColor, PrintColorDocument } from '../schemas/print-color.schema';
import { FilterQuery, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePrintColorRequestDto } from './dto/create-print-color-request.dto';
import { UpdatePrintColorRequestDto } from './dto/update-print-color-request.dto';

type SoftPrintColor = PrintColor & SoftDeleteDocument;

@Injectable()
export class PrintColorService {
  constructor(
    @InjectModel(PrintColor.name) private readonly printColorModel: Model<PrintColorDocument>,
  ) { }

  async checkDuplicates(dto: CreatePrintColorRequestDto | UpdatePrintColorRequestDto, excludeId?: string) {
    const code = dto.code?.trim();

    const orConditions: FilterQuery<PrintColorDocument>[] = [];
    if (code) orConditions.push({ code });

    if (orConditions.length === 0) return;

    const query: FilterQuery<PrintColorDocument> = { 
      $or: orConditions,
      isDeleted: { $in: [true, false] }, 
     };
    if (excludeId) query._id = { $ne: excludeId };

    const duplicates = await this.printColorModel.find(query).select('code').lean();
    if (duplicates.length > 0) {
      const duplicateFields = new Set<string>();
      duplicates.forEach((doc) => {
        if (code && doc.code === code) duplicateFields.add('Mã màu in');
      });

      if (duplicateFields.size > 0) {
        throw new BadRequestException(`Trùng lặp giá trị ở các trường: ${Array.from(duplicateFields).join(', ')}`);
      }
    }
  }

  async findPaginated(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (search && search.trim() !== '') {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      query.$or = [{ code: regex }, { description: regex }, { note: regex }];
    }

    const [data, totalItems] = await Promise.all([
      this.printColorModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ updatedAt: -1 })
        .exec(),
      this.printColorModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil((totalItems || 0) / limit);
    return {
      data,
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  }

  async findAll() {
    return await this.printColorModel.find();
  }

  async findDeleted(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const filter = { isDeleted: true };

    const [data, totalItems] = await Promise.all([
      this.printColorModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ updatedAt: -1 })
        .exec(),
      this.printColorModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil((totalItems || 0) / limit);
    return {
      data,
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  }

  async findOne(id: string) {
    const pc = await this.printColorModel.findById(id);
    if (!pc) throw new NotFoundException('Print color not found');
    return pc;
  }

  async createOne(dto: CreatePrintColorRequestDto): Promise<PrintColorDocument> {
    dto.code = dto.code.trim();
    await this.checkDuplicates(dto);
    const doc = new this.printColorModel(dto);
    return await doc.save();
  }

  async updateOne(id: string, dto: UpdatePrintColorRequestDto): Promise<PrintColorDocument> {
    dto.code = dto.code?.trim();
    await this.checkDuplicates(dto, id);
    const updated = await this.printColorModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new NotFoundException('Print color not found');
    return updated;
  }

  async softDelete(id: string) {
    const color = (await this.printColorModel.findById(id)) as SoftPrintColor;
    if (!color) throw new NotFoundException('Print color not found');
    await color.softDelete();
    return { success: true };
  }

  async restore(id: string) {
    const color = (await this.printColorModel.findOne({
      _id: id,
      isDeleted: true
    })) as SoftPrintColor;
    if (!color) throw new NotFoundException('Print color not found');
    await color.restore();
    return { success: true };
  }

  async removeHard(id: string) {
    const result = await this.printColorModel.findOneAndDelete({
      _id: id,
      isDeleted: true
    });
    if (!result) throw new NotFoundException('Print color not found');
    return { success: true };
  }
}
