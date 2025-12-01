import { Test, TestingModule } from '@nestjs/testing';
import { PaperSupplierService } from './paper-supplier.service';
import { PaperSupplier, PaperSupplierDocument } from '../schemas/paper-supplier.schema';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { CreatePaperSupplierRequestDto } from './dto/create-paper-supplier-request.dto';
import { UpdatePaperSupplierRequestDto } from './dto/update-paper-supplier-request.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Connection, Model } from 'mongoose';

//src/modules/warehouse/paper-supplier/paper-supplier.service.spec.ts

describe('PaperSupplierService', () => {
  let service: PaperSupplierService;
  let model: Model<PaperSupplier>;
  let connection: Connection;

  // Mock Data
  const mockPaperSupplier: any = {
    _id: 'ps-id-1',
    code: 'PS-001',
    name: 'Paper Supplier A',
    phone: '0123456789',
    address: '123 Main St',
    email: 'supplier@example.com',
    bank: 'ABC Bank',
    bankAccount: '1234567890',
    note: 'Reliable supplier',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn().mockResolvedValue(this),
    softDelete: jest.fn().mockResolvedValue(undefined),
    restore: jest.fn().mockResolvedValue(undefined),
  };

  // Mock Model phải là một constructor function
  const mockModel: any = function(dto: any) {
    return {
      ...dto,
      save: jest.fn().mockResolvedValue({ ...mockPaperSupplier, ...dto }),
    };
  };
  
  // Thêm các static methods vào mockModel
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  mockModel.countDocuments = jest.fn();
  mockModel.aggregate = jest.fn();

  const mockConnection = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaperSupplierService,
        {
          provide: getModelToken(PaperSupplier.name),
          useValue: mockModel,
        },
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
      ],
    }).compile();

    service = module.get<PaperSupplierService>(PaperSupplierService);
    model = module.get<Model<PaperSupplier>>(getModelToken(PaperSupplier.name));
    connection = module.get<Connection>(getConnectionToken());

    jest.clearAllMocks();
  });

  describe('Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
      expect(model).toBeDefined();
      expect(connection).toBeDefined();
    });
  });

  // ==================================================================================
  // checkDuplicates - Check for duplicate fields
  // ==================================================================================
  describe('checkDuplicates', () => {
    const createDto: CreatePaperSupplierRequestDto = {
      code: 'PS-001',
      name: 'Supplier A',
      email: 'test@example.com',
      phone: '0123456789',
      bankAccount: '1234567890',
    };

    it('[NORMAL] should pass when no duplicates found', async () => {
      mockModel.aggregate.mockResolvedValue([]);

      await expect(service.checkDuplicates(createDto)).resolves.not.toThrow();
      expect(model.aggregate).toHaveBeenCalledTimes(1);
    });

    it('[ABNORMAL] should throw BadRequestException when code is duplicate', async () => {
      mockModel.aggregate.mockResolvedValue([{ code: 'PS-001' }]);

      await expect(service.checkDuplicates(createDto)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.checkDuplicates(createDto)).rejects.toThrow(
        'Trùng lặp giá trị ở các trường: Mã nhà giấy'
      );
    });

    it('[ABNORMAL] should throw BadRequestException when name is duplicate', async () => {
      mockModel.aggregate.mockResolvedValue([{ name: 'Supplier A' }]);

      await expect(service.checkDuplicates(createDto)).rejects.toThrow(
        'Trùng lặp giá trị ở các trường: Tên nhà giấy'
      );
    });

    it('[ABNORMAL] should throw BadRequestException when email is duplicate', async () => {
      mockModel.aggregate.mockResolvedValue([{ email: 'test@example.com' }]);

      await expect(service.checkDuplicates(createDto)).rejects.toThrow(
        'Trùng lặp giá trị ở các trường: Email'
      );
    });

    it('[ABNORMAL] should throw BadRequestException when phone is duplicate', async () => {
      mockModel.aggregate.mockResolvedValue([{ phone: '0123456789' }]);

      await expect(service.checkDuplicates(createDto)).rejects.toThrow(
        'Trùng lặp giá trị ở các trường: Số điện thoại'
      );
    });

    it('[ABNORMAL] should throw BadRequestException when bankAccount is duplicate', async () => {
      mockModel.aggregate.mockResolvedValue([{ bankAccount: '1234567890' }]);

      await expect(service.checkDuplicates(createDto)).rejects.toThrow(
        'Trùng lặp giá trị ở các trường: Tài khoản ngân hàng'
      );
    });

    it('[ABNORMAL] should list all duplicate fields', async () => {
      mockModel.aggregate.mockResolvedValue([
        {
          code: 'PS-001',
          name: 'Supplier A',
          email: 'test@example.com',
        },
      ]);

      await expect(service.checkDuplicates(createDto)).rejects.toThrow(
        'Trùng lặp giá trị ở các trường: Mã nhà giấy, Tên nhà giấy, Email'
      );
    });

    it('[NORMAL] should handle null/undefined optional fields', async () => {
      const dtoWithoutOptional = {
        code: 'PS-001',
        name: 'Supplier A',
      };
      mockModel.aggregate.mockResolvedValue([]);

      await expect(service.checkDuplicates(dtoWithoutOptional)).resolves.not.toThrow();
    });
  });

  // ==================================================================================
  // findPaginated - Find suppliers with pagination
  // ==================================================================================
  describe('findPaginated', () => {
    beforeEach(() => {
      const mockChain = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockPaperSupplier]),
      };
      mockModel.find.mockReturnValue(mockChain);
      mockModel.countDocuments.mockResolvedValue(1);
    });

    it('[NORMAL] should return paginated suppliers with default params', async () => {
      const result = await service.findPaginated();

      expect(model.find).toHaveBeenCalled();
      expect(model.countDocuments).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('totalItems', 1);
      expect(result).toHaveProperty('totalPages', 1);
      expect(result).toHaveProperty('hasNextPage', false);
      expect(result).toHaveProperty('hasPrevPage', false);
    });

    it('[NORMAL] should return paginated suppliers with custom params', async () => {
      const result = await service.findPaginated(2, 20);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
    });

    it('[NORMAL] should filter by search term', async () => {
      await service.findPaginated(1, 10, 'PS-001');

      expect(model.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            { code: expect.any(RegExp) },
            { name: expect.any(RegExp) },
            { phone: expect.any(RegExp) },
            { email: expect.any(RegExp) },
            { address: expect.any(RegExp) },
          ]),
        })
      );
    });

    it('[NORMAL] should handle empty search string', async () => {
      await service.findPaginated(1, 10, '   ');

      expect(model.find).toHaveBeenCalledWith({});
    });

    it('[BOUNDARY] should calculate correct skip for page 2', async () => {
      const mockChain = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockPaperSupplier]),
      };
      mockModel.find.mockReturnValue(mockChain);

      await service.findPaginated(2, 10);

      expect(mockChain.skip).toHaveBeenCalledWith(10);
    });

    it('[BOUNDARY] should handle hasNextPage correctly', async () => {
      mockModel.countDocuments.mockResolvedValue(25);

      const result = await service.findPaginated(2, 10);

      expect(result.hasNextPage).toBe(true);
      expect(result.hasPrevPage).toBe(true);
    });

    it('[BOUNDARY] should return empty data when no records', async () => {
      const mockChain = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      mockModel.find.mockReturnValue(mockChain);
      mockModel.countDocuments.mockResolvedValue(0);

      const result = await service.findPaginated(1, 10);

      expect(result.data).toHaveLength(0);
      expect(result.totalItems).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('[ABNORMAL] should handle database errors', async () => {
      const mockChain = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      mockModel.find.mockReturnValue(mockChain);

      await expect(service.findPaginated(1, 10)).rejects.toThrow('Database error');
    });
  });

  // ==================================================================================
  // findAll - Find all suppliers
  // ==================================================================================
  describe('findAll', () => {
    it('[NORMAL] should return all suppliers', async () => {
      const mockSuppliers = [mockPaperSupplier, { ...mockPaperSupplier, _id: 'ps-id-2' }];
      mockModel.find.mockResolvedValue(mockSuppliers);

      const result = await service.findAll();

      expect(model.find).toHaveBeenCalledWith();
      expect(result).toEqual(mockSuppliers);
      expect(result.length).toBe(2);
    });

    it('[BOUNDARY] should return empty array when no suppliers', async () => {
      mockModel.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('[ABNORMAL] should handle database errors', async () => {
      mockModel.find.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  // ==================================================================================
  // findOne - Find supplier by ID
  // ==================================================================================
  describe('findOne', () => {
    it('[NORMAL] should return supplier by id', async () => {
      mockModel.findById.mockResolvedValue(mockPaperSupplier);

      const result = await service.findOne('ps-id-1');

      expect(model.findById).toHaveBeenCalledWith('ps-id-1');
      expect(result).toEqual(mockPaperSupplier);
    });

    it('[ABNORMAL] should throw NotFoundException when supplier not found', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException
      );
      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Paper supplier not found'
      );
    });

    it('[ABNORMAL] should handle invalid ObjectId', async () => {
      mockModel.findById.mockRejectedValue(new Error('Invalid ObjectId'));

      await expect(service.findOne('invalid-id')).rejects.toThrow('Invalid ObjectId');
    });
  });

  // ==================================================================================
  // createOne - Create new supplier
  // ==================================================================================
  describe('createOne', () => {
    const createDto: CreatePaperSupplierRequestDto = {
      code: 'PS-001',
      name: 'Supplier A',
      phone: '0123456789',
      address: '123 Main St',
      email: 'test@example.com',
      bank: 'ABC Bank',
      bankAccount: '1234567890',
      note: 'Test note',
    };

    it('[NORMAL] should create supplier successfully', async () => {
      mockModel.aggregate.mockResolvedValue([]);

      const result = await service.createOne(createDto);

      expect(mockModel.aggregate).toHaveBeenCalled(); // checkDuplicates
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('name');
    });

    it('[NORMAL] should create with minimal required fields', async () => {
      const minimalDto = {
        code: 'PS-002',
        name: 'Supplier B',
      };
      mockModel.aggregate.mockResolvedValue([]);

      const result = await service.createOne(minimalDto);

      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('name');
    });

    it('[ABNORMAL] should throw error when duplicate exists', async () => {
      mockModel.aggregate.mockResolvedValue([{ code: 'PS-001' }]);

      await expect(service.createOne(createDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle save errors', async () => {
      mockModel.aggregate.mockResolvedValue([]);
      
      // Override the mockModel constructor để throw error khi save
      const mockModelWithError: any = function(dto: any) {
        return {
          save: jest.fn().mockRejectedValue(new Error('Save failed')),
        };
      };
      mockModelWithError.aggregate = mockModel.aggregate;
      
      // Temporarily replace the model
            const originalModel = (service as any).paperSupplierModel;
            (service as any).paperSupplierModel = mockModelWithError;
      
            await expect(service.createOne(createDto)).rejects.toThrow('Save failed');
            
            // Restore original model
            (service as any).paperSupplierModel = originalModel;
    });
  });

  // ==================================================================================
  // updateOne - Update supplier
  // ==================================================================================
  describe('updateOne', () => {
    const updateDto: UpdatePaperSupplierRequestDto = {
      name: 'Updated Name',
      phone: '0987654321',
    };

    it('[NORMAL] should update supplier successfully', async () => {
      mockModel.aggregate.mockResolvedValue([]);
      mockModel.findByIdAndUpdate.mockResolvedValue({
        ...mockPaperSupplier,
        ...updateDto,
      });

      const result = await service.updateOne('ps-id-1', updateDto);

      expect(model.aggregate).toHaveBeenCalled(); // checkDuplicates
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'ps-id-1',
        updateDto,
        { new: true }
      );
      expect(result.name).toBe('Updated Name');
    });

    it('[NORMAL] should update multiple fields', async () => {
      const multiFieldDto = {
        name: 'New Name',
        address: 'New Address',
        email: 'new@example.com',
      };
      mockModel.aggregate.mockResolvedValue([]);
      mockModel.findByIdAndUpdate.mockResolvedValue({
        ...mockPaperSupplier,
        ...multiFieldDto,
      });

      const result = await service.updateOne('ps-id-1', multiFieldDto);

      expect(result.name).toBe('New Name');
      expect(result.address).toBe('New Address');
    });

    it('[ABNORMAL] should throw NotFoundException when supplier not found', async () => {
      mockModel.aggregate.mockResolvedValue([]);
      mockModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.updateOne('non-existent', updateDto)).rejects.toThrow(
        NotFoundException
      );
      await expect(service.updateOne('non-existent', updateDto)).rejects.toThrow(
        'Paper supplier not found'
      );
    });

    it('[ABNORMAL] should throw error when duplicate exists', async () => {
      mockModel.aggregate.mockResolvedValue([{ name: 'Updated Name' }]);

      await expect(service.updateOne('ps-id-1', updateDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle update errors', async () => {
      mockModel.aggregate.mockResolvedValue([]);
      mockModel.findByIdAndUpdate.mockRejectedValue(new Error('Update failed'));

      await expect(service.updateOne('ps-id-1', updateDto)).rejects.toThrow(
        'Update failed'
      );
    });
  });

  // ==================================================================================
  // softDelete - Soft delete supplier
  // ==================================================================================
  describe('softDelete', () => {
    it('[NORMAL] should soft delete supplier successfully', async () => {
      const mockSupplierWithSoftDelete = {
        ...mockPaperSupplier,
        softDelete: jest.fn().mockResolvedValue(undefined),
      };
      mockModel.findById.mockResolvedValue(mockSupplierWithSoftDelete);

      const result = await service.softDelete('ps-id-1');

      expect(model.findById).toHaveBeenCalledWith('ps-id-1');
      expect(mockSupplierWithSoftDelete.softDelete).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('[ABNORMAL] should throw NotFoundException when supplier not found', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(service.softDelete('non-existent')).rejects.toThrow(
        NotFoundException
      );
      await expect(service.softDelete('non-existent')).rejects.toThrow(
        'Paper supplier not found'
      );
    });

    it('[ABNORMAL] should handle softDelete errors', async () => {
      const mockSupplierWithError = {
        ...mockPaperSupplier,
        softDelete: jest.fn().mockRejectedValue(new Error('Soft delete failed')),
      };
      mockModel.findById.mockResolvedValue(mockSupplierWithError);

      await expect(service.softDelete('ps-id-1')).rejects.toThrow(
        'Soft delete failed'
      );
    });
  });

  // ==================================================================================
  // restore - Restore soft deleted supplier
  // ==================================================================================
  describe('restore', () => {
    it('[NORMAL] should restore supplier successfully', async () => {
      const mockSupplierWithRestore = {
        ...mockPaperSupplier,
        isDeleted: true,
        restore: jest.fn().mockResolvedValue(undefined),
      };
      mockModel.findById.mockResolvedValue(mockSupplierWithRestore);

      const result = await service.restore('ps-id-1');

      expect(model.findById).toHaveBeenCalledWith('ps-id-1');
      expect(mockSupplierWithRestore.restore).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('[ABNORMAL] should throw NotFoundException when supplier not found', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(service.restore('non-existent')).rejects.toThrow(
        NotFoundException
      );
      await expect(service.restore('non-existent')).rejects.toThrow(
        'Paper supplier not found'
      );
    });

    it('[ABNORMAL] should handle restore errors', async () => {
      const mockSupplierWithError = {
        ...mockPaperSupplier,
        restore: jest.fn().mockRejectedValue(new Error('Restore failed')),
      };
      mockModel.findById.mockResolvedValue(mockSupplierWithError);

      await expect(service.restore('ps-id-1')).rejects.toThrow('Restore failed');
    });
  });

  // ==================================================================================
  // removeHard - Hard delete supplier
  // ==================================================================================
  describe('removeHard', () => {
    it('[NORMAL] should hard delete supplier successfully', async () => {
      mockModel.findByIdAndDelete.mockResolvedValue(mockPaperSupplier);

      const result = await service.removeHard('ps-id-1');

      expect(model.findByIdAndDelete).toHaveBeenCalledWith('ps-id-1');
      expect(result).toEqual({ success: true });
    });

    it('[ABNORMAL] should throw NotFoundException when supplier not found', async () => {
      mockModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.removeHard('non-existent')).rejects.toThrow(
        NotFoundException
      );
      await expect(service.removeHard('non-existent')).rejects.toThrow(
        'Paper supplier not found'
      );
    });

    it('[ABNORMAL] should handle deletion errors', async () => {
      mockModel.findByIdAndDelete.mockRejectedValue(
        new Error('Cannot delete: has dependencies')
      );

      await expect(service.removeHard('ps-id-1')).rejects.toThrow(
        'Cannot delete: has dependencies'
      );
    });

    it('[ABNORMAL] should handle database constraint errors', async () => {
      mockModel.findByIdAndDelete.mockRejectedValue(
        new Error('Foreign key constraint')
      );

      await expect(service.removeHard('ps-id-1')).rejects.toThrow(
        'Foreign key constraint'
      );
    });
  });
});