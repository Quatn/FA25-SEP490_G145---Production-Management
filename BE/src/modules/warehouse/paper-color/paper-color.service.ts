import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaperColor, PaperColorDocument } from '../schemas/paper-color.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePaperColorRequestDto } from './dto/create-paper-color-request.dto';
import { UpdatePaperColorRequestDto } from './dto/update-paper-color-request.dto';

type SoftPaperColor = PaperColor & SoftDeleteDocument;

@Injectable()
export class PaperColorService {
    constructor(
        @InjectModel(PaperColor.name)
        private readonly paperColorModel: Model<PaperColor>,
    ) { }

    async findPaginated(page = 1, limit = 10, search?: string) {
        const skip = (page - 1) * limit;

        const query: any = {};

        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [
                { code: regex },
                { name: regex },
            ];
        }

        const [data, totalItems] = await Promise.all([
            this.paperColorModel.find(query).skip(skip).limit(limit).exec(),
            this.paperColorModel.countDocuments(),
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

    async findOne(id: string) {
        const supplier = await this.paperColorModel.findById(id);
        if (!supplier) throw new NotFoundException("Paper supplier not found");
        return supplier;
    }

    async createOne(dto: CreatePaperColorRequestDto): Promise<PaperColorDocument> {
        try {
            const doc = new this.paperColorModel(dto);
            return await doc.save();
        } catch (err: any) {
            if (err.code === 11000 && err.keyValue) {
                const field = Object.keys(err.keyValue)[0];
                const value = err.keyValue[field];
                let message = '';

                if (field === 'code') {
                    message = `Mã màu giấy "${value}" đã tồn tại.`;
                } else {
                    message = `Giá trị "${value}" ở trường "${field}" đã tồn tại.`;
                }

                throw new BadRequestException(message);
            }
            throw err;
        }
    }

    async updateOne(id: string, dto: UpdatePaperColorRequestDto): Promise<PaperColorDocument> {
        try {
            const updated = await this.paperColorModel.findByIdAndUpdate(id, dto, { new: true });
            if (!updated) throw new NotFoundException('Paper color not found');
            return updated;
        } catch (err: any) {
            if (err.code === 11000 && err.keyValue) {
                const field = Object.keys(err.keyValue)[0];
                const value = err.keyValue[field];
                let message = '';

                if (field === 'code') {
                    message = `Mã màu giấy "${value}" đã tồn tại.`;
                } else {
                    message = `Giá trị "${value}" ở trường "${field}" đã tồn tại.`;
                }

                throw new BadRequestException(message);
            }
            throw err;
        }
    }

    async softDelete(id: string) {
        const supplier = await this.paperColorModel.findById(id) as SoftPaperColor;
        if (!supplier) throw new NotFoundException("Paper color not found");
        await supplier.softDelete();
        return { success: true };
    }

    async restore(id: string) {
        const supplier = await this.paperColorModel.findById(id) as SoftPaperColor;
        if (!supplier) throw new NotFoundException("Paper color not found");
        await supplier.restore();
        return { success: true };
    }

    async removeHard(id: string) {
        const result = await this.paperColorModel.findByIdAndDelete(id);
        if (!result) throw new NotFoundException("Paper color not found");
        return { success: true };
    }
}
