// production/delivery-note/delivery-note.service.ts
import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DeliveryNote } from './../schemas/delivery-note.schema';
import { CreateDeliveryNoteDto } from './dto/create-delivery-note.dto';

@Injectable()
export class DeliveryNoteService {
    private readonly logger = new Logger(DeliveryNoteService.name);
    private readonly MAX_RETRIES = 6;

    constructor(
        @InjectModel(DeliveryNote.name) private readonly deliveryNoteModel: Model<DeliveryNote>,
    ) { }

    private async computeNextCode(): Promise<number> {
        // find current max code
        const doc = await this.deliveryNoteModel.findOne({}, { code: 1 }).sort({ code: -1 }).lean().exec();
        const max = doc?.code ?? 0;
        return Number(max) + 1;
    }

    async create(dto: CreateDeliveryNoteDto) {
        if (!dto.customer) {
            throw new BadRequestException('customer is required');
        }
        if (!dto.poitems || !Array.isArray(dto.poitems) || dto.poitems.length === 0) {
            throw new BadRequestException('poitems is required and must be non-empty');
        }

        let attempt = 0;
        let lastErr: any = null;

        while (attempt < this.MAX_RETRIES) {
            attempt += 1;
            try {
                const codeToUse = dto.code ?? (await this.computeNextCode());

                const created = new this.deliveryNoteModel({
                    code: codeToUse,
                    customer: new Types.ObjectId(dto.customer),
                    poitems: dto.poitems,
                    status: dto.status ?? 'PENDINGAPPROVAL',
                    date: dto.date ? new Date(dto.date) : new Date(),
                });

                const saved = await created.save();
                return saved;
            } catch (err: any) {
                lastErr = err;
                const isDupKey = err && (err.code === 11000 || (err.name === 'MongoError' && err.code === 11000));
                if (isDupKey) {
                    this.logger.warn(`Duplicate code detected on attempt ${attempt} — retrying`);
                    await new Promise((res) => setTimeout(res, 40 + Math.random() * 120));
                    continue;
                }
                this.logger.error('Error creating DeliveryNote', err);
                throw err;
            }
        }

        this.logger.error('Exhausted retries while creating DeliveryNote', lastErr);
        throw new InternalServerErrorException('Failed to create DeliveryNote after retries');
    }

    async findAll() {
        return this.deliveryNoteModel.find().sort({ createdAt: -1 }).lean().exec();
    }

    async findById(id: string) {
        return this.deliveryNoteModel.findById(id).lean().exec();
    }
}
