import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  ManufacturingProcess,
  ManufacturingProcessDocument,
} from './schemas/manufacturing-process.schema';

@Injectable()
export class ManufacturingProcessService {
  constructor(
    @InjectModel(ManufacturingProcess.name)
    private readonly processModel: Model<ManufacturingProcessDocument>,
  ) {}

  // Hàm ví dụ để tạo dữ liệu ban đầu
  async createInitialData(data: Partial<ManufacturingProcess>[]) {
    // Chỉ tạo nếu chưa có
    const existingCount = await this.processModel.countDocuments();
    if (existingCount === 0) {
      return this.processModel.insertMany(data);
    }
    return [];
  }
  
  async findAll() {
    return this.processModel.find().exec();
  }
}