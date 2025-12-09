import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaperSupplier, PaperSupplierDocument } from '../schemas/paper-supplier.schema';
import { Connection, FilterQuery, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
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

    async checkDuplicates(
        dto: CreatePaperSupplierRequestDto | UpdatePaperSupplierRequestDto,
        excludeId?: string,
    ) {
        const code = dto.code?.trim();
        const name = dto.name?.trim();
        const email = dto.email?.trim();
        const phone = dto.phone?.trim();
        const bankAccount = dto.bankAccount?.trim();

        const orConditions: FilterQuery<PaperSupplierDocument>[] = [];
        if (code) orConditions.push({ code });
        if (name) orConditions.push({ name });
        if (email) orConditions.push({ email });
        if (phone) orConditions.push({ phone });
        if (bankAccount) orConditions.push({ bankAccount });

        if (orConditions.length === 0) return;

        const query: FilterQuery<PaperSupplierDocument> = { $or: orConditions };

        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const duplicates = await this.paperSupplierModel
            .find(query)
            .lean();

        if (duplicates.length > 0) {
            const duplicateFields = new Set<string>();

            duplicates.forEach((doc) => {
                if (code && doc.code === code) duplicateFields.add('Mã nhà giấy');
                if (name && doc.name === name) duplicateFields.add('Tên nhà giấy');
                if (email && doc.email === email) duplicateFields.add('Email');
                if (phone && doc.phone === phone) duplicateFields.add('Số điện thoại');
                if (bankAccount && doc.bankAccount === bankAccount) duplicateFields.add('Tài khoản ngân hàng');
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
                { phone: regex },
                { email: regex },
                { address: regex },
            ];
        }

        const [data, totalItems] = await Promise.all([
            this.paperSupplierModel
                .find(query)
                .skip(skip)
                .limit(limit)
                .sort({ 'updatedAt': -1 })
                .exec(),
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

    async findAll() {
        return await this.paperSupplierModel.find();
    }

    async findDeleted(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const filter = { isDeleted: true };

        const [data, totalItems] = await Promise.all([
            this.paperSupplierModel
                .find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ 'updatedAt': -1 })
                .exec(),
            this.paperSupplierModel.countDocuments(filter),
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
        const supplier = await this.paperSupplierModel.findById(id);
        if (!supplier) throw new NotFoundException("Paper supplier not found");
        return supplier;
    }

    async createOne(dto: CreatePaperSupplierRequestDto) {
        dto.name = dto.name.trim();
        dto.address = dto.address?.trim();
        dto.bank = dto.bank?.trim();
        dto.bankAccount = dto.bankAccount?.trim();
        dto.email = dto.email?.trim();
        dto.note = dto.note?.trim();
        dto.phone = dto.phone?.trim();
        await this.checkDuplicates(dto);
        const doc = new this.paperSupplierModel(dto);
        return doc.save();
    }

    async updateOne(id: string, dto: UpdatePaperSupplierRequestDto): Promise<PaperSupplierDocument> {
        await this.checkDuplicates(dto, id);
        const updated = await this.paperSupplierModel.findByIdAndUpdate(id, dto, { new: true });
        if (!updated) throw new NotFoundException('Paper supplier not found');
        return updated;
    }

    async softDelete(id: string) {
        const supplier = await this.paperSupplierModel.findById(id) as SoftPaperSupplier;
        if (!supplier) throw new NotFoundException("Paper supplier not found");
        await supplier.softDelete();
        return { success: true };
    }

    async restore(id: string) {
        const supplier = await this.paperSupplierModel.findOne({
            _id: id,
            isDeleted: true
        }) as SoftPaperSupplier;
        if (!supplier) throw new NotFoundException("Paper supplier not found");
        await supplier.restore();
        return { success: true };
    }

    async removeHard(id: string) {
        const result = await this.paperSupplierModel.findOneAndDelete({
            _id: id,
            isDeleted: true
        });
        if (!result) throw new NotFoundException("Paper supplier not found");
        return { success: true };
    }
}
