import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";
import { Ware, WareDocument } from "../schemas/ware.schema";
import { CreateWareDto } from "./dto/create-ware.dto";
import { UpdateWareDto } from "./dto/update-ware.dto";
import { PaginatedList } from "@/common/dto/paginated-list.dto";
import { SoftDeleteDocument } from "@/common/types/soft-delete-document";

type SoftWare = Ware & SoftDeleteDocument;

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

  // ware.service.ts (replace existing findAll)
  async findAll(options: {
    page?: number;
    limit?: number;
    code?: string; // ware.code (free-text)
    fluteCombination?: string; // now interpreted as fluteCombination.code (string)
    wareWidth?: number;
    wareLength?: number;
    wareHeight?: number;
    wareManufacturingProcessType?: string; // keep as id
    printColor?: string[]; // array of printColor codes (strings)
  }): Promise<PaginatedList<any>> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.max(1, Math.min(500, options.limit ?? 100));

    // Build base DB filter for fields that are stored directly on the ware document
    const baseFilter: any = {};

    // ware.code - free-text (case-insensitive)
    if (options.code && String(options.code).trim() !== "") {
      baseFilter.code = new RegExp(String(options.code).trim(), "i");
    }

    if (options.wareWidth !== undefined && options.wareWidth !== null && options.wareWidth.toString() !== "") {
      baseFilter.wareWidth = Number(options.wareWidth);
    }
    if (options.wareLength !== undefined && options.wareLength !== null && options.wareLength.toString() !== "") {
      baseFilter.wareLength = Number(options.wareLength);
    }
    if (options.wareHeight !== undefined && options.wareHeight !== null && options.wareHeight.toString() !== "") {
      baseFilter.wareHeight = Number(options.wareHeight);
    }

    // wareManufacturingProcessType - treat as ObjectId if provided (existing behavior)
    if (options.wareManufacturingProcessType) {
      try {
        baseFilter.wareManufacturingProcessType = new Types.ObjectId(options.wareManufacturingProcessType);
      } catch (e) {
        // if not a valid id, ignore the filter
      }
    }

    // Fetch candidate docs from DB (apply only baseFilter). We populate the referenced docs
    // so we can match by their `.code` fields in-memory.
    const allCandidates = await this.wareModel.find(baseFilter)
      .populate("fluteCombination")
      .populate("wareManufacturingProcessType")
      .populate("printColors")
      .populate("finishingProcesses")
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // In-memory filter: fluteCombination.code and printColors[].code
    let filtered = allCandidates;

    if (options.fluteCombination && String(options.fluteCombination).trim() !== "") {
      const fcRegex = new RegExp(String(options.fluteCombination).trim(), "i");
      filtered = filtered.filter((w: any) => {
        const fc = w?.fluteCombination;
        if (!fc) return false;
        return fcRegex.test(String(fc.code ?? ""));
      });
    }

    if (options.printColor && Array.isArray(options.printColor) && options.printColor.length > 0) {
      // options.printColor is an array of codes (strings). Match any ware that has any printColor.code in the list.
      const codesSet = new Set(options.printColor.map((c) => String(c).trim().toLowerCase()).filter(Boolean));
      filtered = filtered.filter((w: any) => {
        const pcs = Array.isArray(w?.printColors) ? w.printColors : [];
        return pcs.some((pc: any) => codesSet.has(String(pc?.code ?? "").toLowerCase()));
      });
    }

    // total + pagination applied after filtering
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil((totalItems || 0) / limit));
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return {
      data: paged,
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
      // .populate("manufacturingProcesses")
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
        // .populate("manufacturingProcesses")
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
    payload.recalculateFlag = true

    const updated = await this.wareModel.findByIdAndUpdate(id, payload, { new: true }).exec();
    const populated = await this.wareModel.findById(updated?._id)
      .populate("fluteCombination")
      .populate("wareManufacturingProcessType")
      .populate("printColors")
      .populate("finishingProcesses")
      // .populate("manufacturingProcesses")
      .exec();

    return populated;
  }

  async findAllNoPagination(): Promise<any[]> {
    const docs = await this.wareModel.find({})
      .populate("fluteCombination")
      .populate("wareManufacturingProcessType")
      .populate("printColors")
      .populate("finishingProcesses")
      // .populate("manufacturingProcesses")
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

  async removeHard(id: string) {
    const res = await this.wareModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException("Ware not found");
    return { success: true };
  }

  async findDeleted(options: { page?: number; limit?: number; search?: string } = {}) {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.max(1, Math.min(500, options.limit ?? 20));
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: true };
    if (options.search && String(options.search).trim() !== "") {
      const regex = new RegExp(String(options.search).trim(), "i");
      filter.$or = [{ code: regex }]; // extendable
    }

    // use raw collection cursor to bypass mongoose plugin filters
    const [rawDocs, totalCount] = await Promise.all([
      this.wareModel.collection.find(filter).skip(skip).limit(limit).toArray(),
      this.wareModel.collection.countDocuments(filter),
    ]);

    // populate references on the raw documents
    const populatedDocs = await this.wareModel.populate(rawDocs, [
      { path: "fluteCombination" },
      { path: "wareManufacturingProcessType" },
      { path: "printColors" },
      { path: "finishingProcesses" },
      // add manufacturingProcesses if needed
    ]);

    const totalPages = Math.max(1, Math.ceil((totalCount || 0) / limit));
    return {
      data: populatedDocs,
      page,
      limit,
      totalItems: totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async restore(id: string) {
    const doc = await this.wareModel.findOne({
      _id: id,
      isDeleted: true
    }) as SoftWare;
    if (!doc) throw new NotFoundException("Ware not found");
    // assuming soft-delete plugin exposes restore()
    await (doc as any).restore();
    return { success: true };
  }

}

