// src/modules/production/customer/customer.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from '../schemas/customer.schema';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name) private readonly customerModel: Model<CustomerDocument>,
  ) {}

  async findAll(): Promise<Customer[]> {
    return this.customerModel.find().exec();
  }

  async findPaginated(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const query: any = {};
    if (search && search.trim() !== '') {
      const r = new RegExp(search.trim(), 'i');
      query.$or = [{ code: r }, { name: r }, { address: r }];
    }
    const [data, totalItems] = await Promise.all([
      this.customerModel.find(query).skip(skip).limit(limit).exec(),
      this.customerModel.countDocuments(query).exec(),
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
    const doc = await this.customerModel.findById(id);
    if (!doc) throw new NotFoundException('Customer not found');
    return doc;
  }
}
