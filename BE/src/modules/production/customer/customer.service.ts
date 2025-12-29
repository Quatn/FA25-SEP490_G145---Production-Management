import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Customer, CustomerDocument } from '../schemas/customer.schema';
import { CreateCustomerRequestDto } from './dto/create-customer-request.dto';
import { UpdateCustomerRequestDto } from './dto/update-customer-request.dto';
import { SoftDeleteDocument } from '@/common/types/soft-delete-document';

type SoftCustomer = Customer & SoftDeleteDocument;
@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name) private readonly customerModel: Model<CustomerDocument>,
  ) { }

  async checkDuplicates(
    dto: CreateCustomerRequestDto | UpdateCustomerRequestDto,
    excludeId?: string,
  ) {
    const code = dto.code?.trim();
    const name = dto.name?.trim();
    const email = dto.email?.trim();
    const contactNumber = dto.contactNumber?.trim();

    const orConditions: FilterQuery<CustomerDocument>[] = [];
    if (code) orConditions.push({ code });
    if (name) orConditions.push({ name });
    if (email) orConditions.push({ email });
    if (contactNumber) orConditions.push({ contactNumber });

    if (orConditions.length === 0) return;

    const query: FilterQuery<CustomerDocument> = { 
      $or: orConditions,
      isDeleted: { $in: [true, false] }, 
     };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const duplicates = await this.customerModel
      .find(query)
      .lean();

    if (duplicates.length > 0) {
      const duplicateFields = new Set<string>();

      duplicates.forEach((doc) => {
        if (code && doc.code === code) duplicateFields.add('Mã khách hàng');
        if (name && doc.name === name) duplicateFields.add('Tên khách hàng');
        if (email && doc.email === email) duplicateFields.add('Email');
        if (contactNumber && doc.contactNumber === contactNumber) duplicateFields.add('Số điện thoại');
      });

      if (duplicateFields.size > 0) {
        throw new BadRequestException(
          `Trùng lặp giá trị ở các trường: ${Array.from(duplicateFields).join(', ')}`,
        );
      }
    }
  }

  async findAll(): Promise<Customer[]> {
    return await this.customerModel.find();
  }

  async findPaginated(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const query: any = {};
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { code: regex },
        { name: regex },
        { address: regex },
        { contactNumber: regex },
        { email: regex },
      ];
    }
    const [data, totalItems] = await Promise.all([
      this.customerModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ 'updatedAt': -1 })
        .exec(),
      this.customerModel.countDocuments(),
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

  async findDeleted(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const filter = { isDeleted: true };

    const [data, totalItems] = await Promise.all([
      this.customerModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ 'updatedAt': -1 })
        .exec(),
      this.customerModel.countDocuments(filter),
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
    const doc = await this.customerModel.findById(id);
    if (!doc) throw new NotFoundException('Customer not found');
    return doc;
  }

  async createOne(dto: CreateCustomerRequestDto) {
    dto.name = dto.name.trim();
    dto.address = dto.address?.trim();
    dto.email = dto.email?.trim();
    dto.note = dto.note?.trim();
    dto.contactNumber = dto.contactNumber?.trim();
    await this.checkDuplicates(dto);
    const doc = new this.customerModel(dto);
    return doc.save();
  }

  async updateOne(id: string, dto: UpdateCustomerRequestDto): Promise<CustomerDocument> {
    await this.checkDuplicates(dto, id);
    const updated = await this.customerModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new NotFoundException('Customer not found');
    return updated;
  }

  async softDelete(id: string) {
    const supplier = await this.customerModel.findById(id) as SoftCustomer;
    if (!supplier) throw new NotFoundException("Customer not found");
    await supplier.softDelete();
    return { success: true };
  }

  async restore(id: string) {
    const supplier = await this.customerModel.findOne({
      _id: id,
      isDeleted: true
    }) as SoftCustomer;
    if (!supplier) throw new NotFoundException("Customer not found");
    await supplier.restore();
    return { success: true };
  }

  async removeHard(id: string) {
    const result = await this.customerModel.findOneAndDelete({
      _id: id,
      isDeleted: true
    });
    if (!result) throw new NotFoundException("Customer not found");
    return { success: true };
  }
}
