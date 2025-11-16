import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";
import { Ware, WareDocument } from "../schemas/ware.schema";
import { CreateWareDto } from "./dto/create-ware.dto";
import { UpdateWareDto } from "./dto/update-ware.dto";
import { PaginatedList } from "@/common/dto/paginated-list.dto";

@Injectable()
export class WareService {
  constructor(
    @InjectModel(Ware.name) private wareModel: Model<WareDocument>,
  ) { }

  private normalizeOptionalNumbers(payload: any) {
    const numberFields = [
      "wareHeight",
      "warePerBlankAdjustment",
      "flapAdjustment",
      "flapOverlapAdjustment",
      "crossCutCountAdjustment",
      "flapLength",
    ];
    for (const f of numberFields) {
      if (payload[f] === undefined || payload[f] === null || payload[f] === "") {
        payload[f] = 0;
      }
    }
    return payload;
  }

  async findAll(options: { page?: number; limit?: number; search?: string }): Promise<PaginatedList<any>> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.max(1, Math.min(500, options.limit ?? 100));
    const filter: any = {};
    if (options.search && options.search.trim() !== "") {
      const regex = new RegExp(options.search.trim(), "i");
      filter.$or = [{ code: regex }];
    }

    const [data, total] = await Promise.all([
      this.wareModel.find(filter)
        .populate("fluteCombination")
        .populate("wareManufacturingProcessType")
        .populate("printColors")
        .populate("finishingProcesses")
        .populate("manufacturingProcesses")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.wareModel.countDocuments(filter),
    ]);

    const totalItems = total;
    const totalPages = Math.max(1, Math.ceil((totalItems || 0) / limit));
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

  async findOneById(id: string): Promise<Ware> {
    const doc = await this.wareModel
      .findById(id)
      .populate("fluteCombination")
      .populate("wareManufacturingProcessType")
      .populate("printColors")
      .populate("finishingProcesses")
      .populate("manufacturingProcesses")
      .exec();
    if (!doc) {
      throw new NotFoundException("Ware not found");
    }
    return doc;
  }

  async create(dto: CreateWareDto): Promise<any> {
    try {
      const payload: any = { ...dto };
      this.normalizeOptionalNumbers(payload);

      const toInsert = {
        ...payload,
        fluteCombination: new Types.ObjectId(payload.fluteCombination),
        wareManufacturingProcessType: new Types.ObjectId(payload.wareManufacturingProcessType),
        printColors: (payload.printColors || []).map((s: string) => new Types.ObjectId(s)),
        finishingProcesses: (payload.finishingProcesses || []).map((s: string) => new Types.ObjectId(s)),
        manufacturingProcesses: (payload.manufacturingProcesses || []).map((s: string) => new Types.ObjectId(s)),
      };

      const created = new this.wareModel(toInsert);
      const saved = await created.save();

      const populated = await this.wareModel.findById(saved._id)
        .populate("fluteCombination")
        .populate("wareManufacturingProcessType")
        .populate("printColors")
        .populate("finishingProcesses")
        .populate("manufacturingProcesses")
        .exec();

      return populated;
    } catch (err: any) {
      if (err?.code === 11000 && err?.keyValue) {
        throw new BadRequestException(`Duplicate key: ${JSON.stringify(err.keyValue)}`);
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateWareDto): Promise<any> {
    const existing = await this.wareModel.findById(id).exec();
    if (!existing) throw new NotFoundException("Ware not found");

    const payload: any = { ...dto };
    this.normalizeOptionalNumbers(payload);

    if (payload.fluteCombination) payload.fluteCombination = new Types.ObjectId(payload.fluteCombination);
    if (payload.wareManufacturingProcessType) payload.wareManufacturingProcessType = new Types.ObjectId(payload.wareManufacturingProcessType);
    if (payload.printColors) payload.printColors = (payload.printColors || []).map((s: string) => new Types.ObjectId(s));
    if (payload.finishingProcesses) payload.finishingProcesses = (payload.finishingProcesses || []).map((s: string) => new Types.ObjectId(s));
    if (payload.manufacturingProcesses) payload.manufacturingProcesses = (payload.manufacturingProcesses || []).map((s: string) => new Types.ObjectId(s));

    const updated = await this.wareModel.findByIdAndUpdate(id, payload, { new: true }).exec();
    const populated = await this.wareModel.findById(updated?._id)
      .populate("fluteCombination")
      .populate("wareManufacturingProcessType")
      .populate("printColors")
      .populate("finishingProcesses")
      .populate("manufacturingProcesses")
      .exec();

    return populated;
  }

  async findAllNoPagination(): Promise<any[]> {
    const docs = await this.wareModel.find({})
      .populate("fluteCombination")
      .populate("wareManufacturingProcessType")
      .populate("printColors")
      .populate("finishingProcesses")
      .populate("manufacturingProcesses")
      .lean()
      .exec();
    return docs;
  }

  async softDelete(id: string) {
    const doc = await this.wareModel.findById(id).exec();
    if (!doc) throw new NotFoundException("Ware not found");
    await (doc as any).softDelete();
    return { success: true };
  }

  async restore(id: string) {
    // Update deleted flags directly using collection (bypass Mongoose query hooks)
    const oid = new Types.ObjectId(id);
    const res = await this.wareModel.collection.updateOne({ _id: oid }, { $set: { isDeleted: false, deletedAt: null } });
    if (res.matchedCount === 0) throw new NotFoundException("Ware not found");
    // now fetch populated doc via normal Mongoose findById (plugin won't filter it out because isDeleted is now false)
    const populated = await this.wareModel.findById(id)
      .populate("fluteCombination")
      .populate("wareManufacturingProcessType")
      .populate("printColors")
      .populate("finishingProcesses")
      .populate("manufacturingProcesses")
      .exec();
    return { success: true, data: populated };
  }

  async removeHard(id: string) {
    const res = await this.wareModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException("Ware not found");
    return { success: true };
  }

  async findDeleted(page = 1, limit = 100) {
    const skip = (page - 1) * limit;
    const cursor = this.wareModel.collection.find({ isDeleted: true }).sort({ deletedAt: -1 }).skip(skip).limit(limit);
    const docs = await cursor.toArray();
    const total = await this.wareModel.collection.countDocuments({ isDeleted: true });

    // populate referenced fields on plain objects
    const populated = await this.wareModel.populate(docs, [
      { path: "fluteCombination" },
      { path: "wareManufacturingProcessType" },
      { path: "printColors" },
      { path: "finishingProcesses" },
      { path: "manufacturingProcesses" },
    ]);

    const totalPages = Math.ceil((total || 0) / limit);
    return { data: populated, page, limit, totalItems: total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 };
  }
}

