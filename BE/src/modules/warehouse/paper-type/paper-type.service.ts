import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaperType, PaperTypeDocument } from '../schemas/paper-type.schema';
import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { FilterQuery, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePaperTypeRequestDto } from './dto/create-paper-type-request.dto';
import { UpdatePaperTypeRequestDto } from './dto/update-paper-type-request.dto';
import { PaperColor } from '../schemas/paper-color.schema';

type SoftPaperType = PaperType & SoftDeleteDocument;

@Injectable()
export class PaperTypeService {
    constructor(
        @InjectModel(PaperType.name)
        private readonly paperTypeModel: Model<PaperType>,

        @InjectModel(PaperColor.name)
        private readonly paperColorModel: Model<PaperColor>,
    ) { }

    async checkDuplicates(
        dto: CreatePaperTypeRequestDto | UpdatePaperTypeRequestDto,
        excludeId?: string
    ) {
        const query: FilterQuery<PaperTypeDocument> = {
            paperColor: dto.paperColor,
            width: dto.width,
            grammage: dto.grammage,
        };

        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const existing = await this.paperTypeModel.findOne(query)
            .select('_id')
            .lean()
            .exec();

        if (existing) {
            throw new BadRequestException(
                'Loại giấy với màu, khổ và định lượng này đã tồn tại.'
            );
        }
    }

    async findPaginated(page = 1, limit = 10, search?: string) {
        const skip = (page - 1) * limit;

        const query: FilterQuery<PaperTypeDocument> = {};

        if (search && search.trim() !== '') {
            const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedSearch, 'i');

            const matchedColors = await this.paperColorModel
                .find({ $or: [{ code: regex }, { title: regex }] })
                .select('_id')
                .lean();

            const matchedColorIds = matchedColors.map(c => c._id);

            query.$or = [
                { paperColor: { $in: matchedColorIds } },
                { $expr: { $regexMatch: { input: { $toString: '$width' }, regex: escapedSearch, options: 'i' } } },
                { $expr: { $regexMatch: { input: { $toString: '$grammage' }, regex: escapedSearch, options: 'i' } } },
            ];
        }

        const [data, totalItems] = await Promise.all([
            this.paperTypeModel.find(query)
                .populate('paperColor')
                .skip(skip)
                .limit(limit)
                .sort({ 'updatedAt': -1 })
                .exec(),
            this.paperTypeModel.countDocuments(),
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
        return await this.paperTypeModel.find();
    }

    async findDeleted(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const filter = { isDeleted: true };

        const [data, totalItems] = await Promise.all([
            this.paperTypeModel
                .find(filter)
                .populate('paperColor')
                .skip(skip)
                .limit(limit)
                .sort({ 'updatedAt': -1 })
                .exec(),
            this.paperTypeModel.countDocuments(filter),
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
        const type = await this.paperTypeModel.findById(id);
        if (!type) throw new NotFoundException("Paper type not found");
        return type;
    }

    async createOne(dto: CreatePaperTypeRequestDto) {
        await this.checkDuplicates(dto);
        const doc = new this.paperTypeModel(dto);
        return doc.save();
    }

    async updateOne(id: string, dto: UpdatePaperTypeRequestDto): Promise<PaperTypeDocument> {

        await this.checkDuplicates(dto, id);
        const updated = await this.paperTypeModel.findByIdAndUpdate(id, dto, { new: true });
        if (!updated) throw new NotFoundException('Paper type not found');
        return updated;
    }

    async softDelete(id: string) {
        const type = await this.paperTypeModel.findById(id) as SoftPaperType;
        if (!type) throw new NotFoundException("Paper type not found");
        await type.softDelete();
        return { success: true };
    }

    async restore(id: string) {
        const type = await this.paperTypeModel.findOne({
            _id: id,
            isDeleted: true
        }) as SoftPaperType;
        if (!type) throw new NotFoundException("Paper type not found");
        await type.restore();
        return { success: true };
    }

    async removeHard(id: string) {
        const result = await this.paperTypeModel.findOneAndDelete({
            _id: id,
            isDeleted: true
        });
        if (!result) throw new NotFoundException("Paper type not found");
        return { success: true };
    }
}
