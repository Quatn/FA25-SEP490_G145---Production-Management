import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaperSupplier, PaperSupplierDocument } from '../schemas/paper-supplier.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePaperSupplierRequestDto } from './dto/create-paper-supplier-request.dto';
import { UpdatePaperSupplierRequestDto } from './dto/update-paper-supplier-request.dto';
import { SoftDeleteDocument } from '@/common/types/soft-delete-document';

type SoftPaperSupplier = PaperSupplier & SoftDeleteDocument;

@Injectable()
export class PaperSupplierService {
    constructor(
        @InjectModel(PaperSupplier.name)
        private readonly paperSupplierModel: Model<PaperSupplier>,
    ) { }

    async findPaginated(page = 1, limit = 10, search?: string) {
        const skip = (page - 1) * limit;

        const query: any = {};

        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [
                { code: regex },
                { name: regex },
                { phone: regex },
                { email: regex },
                { address: regex },
            ];
        }

        const [data, totalItems] = await Promise.all([
            this.paperSupplierModel.find(query).skip(skip).limit(limit).exec(),
            this.paperSupplierModel.countDocuments(),
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
        const supplier = await this.paperSupplierModel.findById(id);
        if (!supplier) throw new NotFoundException("Paper supplier not found");
        return supplier;
    }

    async createOne(dto: CreatePaperSupplierRequestDto): Promise<PaperSupplierDocument> {
        try {
            const doc = new this.paperSupplierModel(dto);
            return await doc.save();
        } catch (err: any) {
            if (err.code === 11000 && err.keyValue) {
                const field = Object.keys(err.keyValue)[0];
                const value = err.keyValue[field];
                let message = '';

                if (field === 'code') {
                    message = `Mã nhà giấy "${value}" đã tồn tại.`;
                } else {
                    message = `Giá trị "${value}" ở trường "${field}" đã tồn tại.`;
                }

                throw new BadRequestException(message);
            }
            throw err;
        }
    }

    async updateOne(id: string, dto: UpdatePaperSupplierRequestDto): Promise<PaperSupplierDocument> {
        try {
            const updated = await this.paperSupplierModel.findByIdAndUpdate(id, dto, { new: true });
            if (!updated) throw new NotFoundException('Paper supplier not found');
            return updated;
        } catch (err: any) {
            if (err.code === 11000) {
                const field = Object.keys(err.keyValue)[0];
                const value = err.keyValue[field];
                throw new BadRequestException(`Giá trị "${value}" ở trường "${field}" đã tồn tại.`);
            }
            throw err;
        }
    }

    async softDelete(id: string) {
        const supplier = await this.paperSupplierModel.findById(id) as SoftPaperSupplier;
        if (!supplier) throw new NotFoundException("Paper supplier not found");
        await supplier.softDelete();
        return { success: true };
    }

    async restore(id: string) {
        const supplier = await this.paperSupplierModel.findById(id) as SoftPaperSupplier;
        if (!supplier) throw new NotFoundException("Paper supplier not found");
        await supplier.restore();
        return { success: true };
    }

    async removeHard(id: string) {
        const result = await this.paperSupplierModel.findByIdAndDelete(id);
        if (!result) throw new NotFoundException("Paper supplier not found");
        return { success: true };
    }
}
