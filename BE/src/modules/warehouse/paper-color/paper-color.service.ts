import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaperColor, PaperColorDocument } from '../schemas/paper-color.schema';
import { FilterQuery, Model } from 'mongoose';
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

    async checkDuplicates(
        dto: CreatePaperColorRequestDto | UpdatePaperColorRequestDto,
        excludeId?: string,
    ) {
        const code = dto.code?.trim();
        const title = dto.title?.trim();

        const orConditions: FilterQuery<PaperColorDocument>[] = [];
        if (code) orConditions.push({ code });
        if (title) orConditions.push({ title });

        if (orConditions.length === 0) return;

        const query: FilterQuery<PaperColorDocument> = { $or: orConditions };

        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const duplicates = await this.paperColorModel
            .find(query)
            .select('code title')
            .lean();

        if (duplicates.length > 0) {
            const duplicateFields = new Set<string>();

            duplicates.forEach((doc) => {
                if (code && doc.code === code) duplicateFields.add('Mã màu giấy');
                if (title && doc.title === title) duplicateFields.add('Tiêu đề màu giấy');
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
                { title: regex },
            ];
        }

        const [data, totalItems] = await Promise.all([
            this.paperColorModel
            .find(query)
            .skip(skip)
            .limit(limit)
            .sort({ 'updatedAt': -1 })
            .exec(),
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

    async findAll() {
        return await this.paperColorModel.find();
    }

    async findDeleted(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const filter = { isDeleted: true };

        const [data, totalItems] = await Promise.all([
            this.paperColorModel
                .find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ 'updatedAt': -1 })
                .exec(),
            this.paperColorModel.countDocuments(filter),
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
        const color = await this.paperColorModel.findById(id);
        if (!color) throw new NotFoundException("Paper color not found");
        return color;
    }

    async createOne(dto: CreatePaperColorRequestDto): Promise<PaperColorDocument> {
        dto.title = dto.title.trim();

        await this.checkDuplicates(dto);

        const doc = new this.paperColorModel(dto);
        return await doc.save();
    }

    async updateOne(id: string, dto: UpdatePaperColorRequestDto): Promise<PaperColorDocument> {
        dto.title = dto.title?.trim();
        await this.checkDuplicates(dto, id);
        const updated = await this.paperColorModel.findByIdAndUpdate(id, dto, { new: true });
        if (!updated) throw new NotFoundException('Paper color not found');
        return updated;
    }

    async softDelete(id: string) {
        const color = await this.paperColorModel.findById(id) as SoftPaperColor;
        if (!color) throw new NotFoundException("Paper color not found");
        await color.softDelete();
        return { success: true };
    }

    async restore(id: string) {
        const color = await this.paperColorModel.findOne({
            _id: id,
            isDeleted: true
        }) as SoftPaperColor;
        if (!color) throw new NotFoundException("Paper color not found");
        await color.restore();
        return { success: true };
    }

    async removeHard(id: string) {
        const result = await this.paperColorModel.findOneAndDelete({
            _id: id,
            isDeleted: true
        });
        if (!result) throw new NotFoundException("Paper color not found");
        return { success: true };
    }
}
