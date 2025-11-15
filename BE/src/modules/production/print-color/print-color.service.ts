import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PrintColor, PrintColorDocument } from "../schemas/print-color.schema";

@Injectable()
export class PrintColorService {
  constructor(
    @InjectModel(PrintColor.name) private readonly printColorModel: Model<PrintColorDocument>,
  ) {}

  async findAll(): Promise<PrintColorDocument[]> {
    const docs = await this.printColorModel.find({}).sort({ createdAt: 1 }).exec();
    return docs;
  }
}
