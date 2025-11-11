import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaperSupplier, PaperSupplierDocument } from '../schemas/paper-supplier.schema';
import { Connection, Model } from 'mongoose';
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
        @InjectConnection() private readonly connection: Connection,
    ) { }

    async checkDuplicates(dto: CreatePaperSupplierRequestDto | UpdatePaperSupplierRequestDto) {
        const duplicates = await this.paperSupplierModel.aggregate([
            {
                $match: {
                    $or: [
                        { code: dto.code },
                        { name: dto.name },
                        { email: dto.email },
                        { phone: dto.phone },
                        { bankAccount: dto.bankAccount },
                    ],
                },
            },
            {
                $project: {
                    _id: 0,
                    code: 1,
                    name: 1,
                    email: 1,
                    phone: 1,
                    bankAccount: 1,
                },
            },
        ]);

        if (duplicates.length > 0) {
            const duplicateFields: string[] = [];
            duplicates.forEach((d) => {
                if (d.code === dto.code) duplicateFields.push('Mã nhà giấy');
                if (d.name === dto.name) duplicateFields.push('Tên nhà giấy');
                if (d.email && d.email === dto.email) duplicateFields.push('Email');
                if (d.phone && d.phone === dto.phone) duplicateFields.push('Số điện thoại');
                if (d.bankAccount && d.bankAccount === dto.bankAccount) duplicateFields.push('Tài khoản ngân hàng');
            });
            throw new BadRequestException(
                `Trùng lặp giá trị ở các trường: ${duplicateFields.join(', ')}`,
            );
        }
    }

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

    async findAll() {
        return await this.paperSupplierModel.find();
    }

    async findOne(id: string) {
        const supplier = await this.paperSupplierModel.findById(id);
        if (!supplier) throw new NotFoundException("Paper supplier not found");
        return supplier;
    }

    async createOne(dto: CreatePaperSupplierRequestDto) {
        await this.checkDuplicates(dto);
        const doc = new this.paperSupplierModel(dto);
        return doc.save();
    }

    async updateOne(id: string, dto: UpdatePaperSupplierRequestDto): Promise<PaperSupplierDocument> {

        await this.checkDuplicates(dto);
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
