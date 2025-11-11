import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaperType, PaperTypeDocument } from '../schemas/paper-type.schema';
import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { CreatePaperTypeRequestDto } from './dto/create-paper-type-request.dto';
import { UpdatePaperTypeRequestDto } from './dto/update-paper-type-request.dto';
import { PaperColor } from '../schemas/paper-color.schema';

type SoftPaperType = PaperType & SoftDeleteDocument;

@Injectable()
export class PaperTypeService {
    constructor(
        @InjectModel(PaperType.name)
        private readonly PaperTypeModel: Model<PaperType>,
        @InjectConnection() private readonly connection: Connection,
    ) { }

    async checkDuplicates(dto: CreatePaperTypeRequestDto | UpdatePaperTypeRequestDto) {
        const existing = await this.PaperTypeModel.findOne({
            paperColorId: dto.paperColorId,
            width: dto.width,
            grammage: dto.grammage,
        }).exec();

        if (existing) {
            throw new BadRequestException(
                'Loại giấy với màu, khổ và định lượng này đã tồn tại.'
            );
        }
    }

    async findPaginated(
        page = 1,
        limit = 10,
        search?: string,
    ) {
        const skip = (page - 1) * limit;
        const pipeline: any[] = [];

        pipeline.push({
            $lookup: {
                from: 'papercolors',
                localField: 'paperColorId',
                foreignField: '_id',
                as: 'paperColor',
            },
        });

        pipeline.push({
            $unwind: {
                path: '$paperColor',
                preserveNullAndEmptyArrays: true,
            },
        });

        if (search && search.trim() !== '') {
            const trimmed = search.trim();
            const regex = new RegExp(trimmed, 'i');

            pipeline.push({
                $match: {
                    $or: [
                        { 'paperColor.code': regex },
                        { 'paperColor.title': regex },
                        { $expr: { $regexMatch: { input: { $toString: '$width' }, regex: trimmed, options: 'i' } } },
                        { $expr: { $regexMatch: { input: { $toString: '$grammage' }, regex: trimmed, options: 'i' } } },
                    ],
                },
            });
        }

        pipeline.push({
            $facet: {
                data: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: 'count' }],
            },
        });

        const result = await this.PaperTypeModel.aggregate(pipeline).exec();

        const data = result[0]?.data || [];
        const totalItems = result[0]?.totalCount[0]?.count || 0;
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
        return await this.PaperTypeModel.find();
    }

    async findOne(id: string) {
        const type = await this.PaperTypeModel.findById(id);
        if (!type) throw new NotFoundException("Paper type not found");
        return type;
    }

    async createOne(dto: CreatePaperTypeRequestDto) {
        await this.checkDuplicates(dto);
        const doc = new this.PaperTypeModel(dto);
        return doc.save();
    }

    async updateOne(id: string, dto: UpdatePaperTypeRequestDto): Promise<PaperTypeDocument> {

        await this.checkDuplicates(dto);
        const updated = await this.PaperTypeModel.findByIdAndUpdate(id, dto, { new: true });
        if (!updated) throw new NotFoundException('Paper type not found');
        return updated;
    }

    async softDelete(id: string) {
        const type = await this.PaperTypeModel.findById(id) as SoftPaperType;
        if (!type) throw new NotFoundException("Paper type not found");
        await type.softDelete();
        return { success: true };
    }

    async restore(id: string) {
        const type = await this.PaperTypeModel.findById(id) as SoftPaperType;
        if (!type) throw new NotFoundException("Paper type not found");
        await type.restore();
        return { success: true };
    }

    async removeHard(id: string) {
        const result = await this.PaperTypeModel.findByIdAndDelete(id);
        if (!result) throw new NotFoundException("Paper type not found");
        return { success: true };
    }
}
