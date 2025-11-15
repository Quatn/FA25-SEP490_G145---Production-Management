import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { Ware, WareDocument } from "../schemas/ware.schema";

@Injectable()
export class WareService {
  constructor(
    @InjectModel(Ware.name) private wareModel: Model<WareDocument>,
  ) {}

  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: Ware[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 100));

    const filter: FilterQuery<WareDocument> = {
      isDeleted: false,
    };

    if (options.search) {
      const regex = new RegExp(options.search, "i");
      filter.$or = [
        { code: regex },
        // Note: Search in populated fields requires aggregation pipeline
        // For now, searching only in ware fields
      ];
    }

    const [data, total] = await Promise.all([
      this.wareModel
        .find(filter)
        .populate("fluteCombination")
        .populate("wareManufacturingProcessType")
        .populate("printColors")
        .populate("finishingProcesses")
        .populate("manufacturingProcesses")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.wareModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
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
}

