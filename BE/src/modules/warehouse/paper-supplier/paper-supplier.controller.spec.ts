import { Test, TestingModule } from '@nestjs/testing';
import { PaperSupplierController } from './paper-supplier.controller';
import { PaperSupplierService } from './paper-supplier.service';
import { CreatePaperSupplierRequestDto } from './dto/create-paper-supplier-request.dto';
import { UpdatePaperSupplierRequestDto } from './dto/update-paper-supplier-request.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

//src/modules/warehouse/paper-supplier/paper-supplier.controller.spec.ts

describe('PaperSupplierController', () => {
  let controller: PaperSupplierController;
  let service: PaperSupplierService;

  // Mock Data - Aligned with PaperSupplier schema
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
  };

  const mockService = {
    findPaginated: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    createOne: jest.fn(),
    updateOne: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    removeHard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaperSupplierController],
      providers: [
        {
          provide: PaperSupplierService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PaperSupplierController>(PaperSupplierController);
    service = module.get<PaperSupplierService>(PaperSupplierService);

    jest.clearAllMocks();
  });

  describe('Definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
      expect(service).toBeDefined();
    });
  });

  // ==================================================================================
  // GET /list - List paginated paper suppliers
  // ==================================================================================
  describe('findPaginated', () => {
    it('[NORMAL] should return paginated list of paper suppliers', async () => {
      const mockResponse = {
        data: [mockPaperSupplier],
        total: 1,
        page: 1,
        limit: 10,
        totalPage: 1,
      };
      mockService.findPaginated.mockResolvedValue(mockResponse);

      const result = await controller.findPaginated(1, 10);

      expect(service.findPaginated).toHaveBeenCalledWith(1, 10, undefined);
      expect(service.findPaginated).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockResponse,
      });
    });

    it('[NORMAL] should handle search query', async () => {
      const mockResponse = {
        data: [mockPaperSupplier],
        total: 1,
        page: 1,
        limit: 10,
        totalPage: 1,
      };
      mockService.findPaginated.mockResolvedValue(mockResponse);

      const result = await controller.findPaginated(1, 10, 'PS-001');

      expect(service.findPaginated).toHaveBeenCalledWith(1, 10, 'PS-001');
      expect(result.success).toBe(true);
    });

    it('[BOUNDARY] should return empty data when no records found', async () => {
      const emptyResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPage: 0,
      };
      mockService.findPaginated.mockResolvedValue(emptyResponse);

      const result = await controller.findPaginated(1, 10);

      expect(result.data).toEqual(emptyResponse);
      expect((result.data as any).data).toHaveLength(0);
    });

    it('[BOUNDARY] should handle large page numbers', async () => {
      const emptyResponse = {
        data: [],
        total: 0,
        page: 1000,
        limit: 10,
        totalPage: 0,
      };
      mockService.findPaginated.mockResolvedValue(emptyResponse);

      const result = await controller.findPaginated(1000, 10);

      expect(service.findPaginated).toHaveBeenCalledWith(1000, 10, undefined);
      expect(result.success).toBe(true);
    });

    it('[BOUNDARY] should use default pagination when not provided', async () => {
      const mockResponse = {
        data: [mockPaperSupplier],
        total: 1,
        page: 1,
        limit: 10,
        totalPage: 1,
      };
      mockService.findPaginated.mockResolvedValue(mockResponse);

      const result = await controller.findPaginated();

      expect(service.findPaginated).toHaveBeenCalledWith(1, 10, undefined);
      expect(result.success).toBe(true);
    });

    it('[ABNORMAL] should propagate service errors', async () => {
      mockService.findPaginated.mockRejectedValue(new Error('Database error'));

      await expect(controller.findPaginated(1, 10)).rejects.toThrow('Database error');
      expect(service.findPaginated).toHaveBeenCalledWith(1, 10, undefined);
    });

    it('[ABNORMAL] should handle validation errors', async () => {
      mockService.findPaginated.mockRejectedValue(
        new BadRequestException('Invalid query')
      );

      await expect(controller.findPaginated(1, 10)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ==================================================================================
  // GET /list-all - List all paper suppliers
  // ==================================================================================
  describe('findAll', () => {
    it('[NORMAL] should return all paper suppliers', async () => {
      const mockSuppliers = [
        mockPaperSupplier,
        { ...mockPaperSupplier, _id: 'ps-id-2', code: 'PS-002', name: 'Supplier B' },
      ];
      mockService.findAll.mockResolvedValue(mockSuppliers);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith();
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockSuppliers,
      });
      expect((result.data as any).length).toBe(2);
    });

    it('[BOUNDARY] should return empty array when no records', async () => {
      mockService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result.data).toEqual([]);
      expect((result.data as any).length).toBe(0);
    });

    it('[ABNORMAL] should propagate service errors', async () => {
      mockService.findAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll()).rejects.toThrow('Database error');
    });
  });

  // ==================================================================================
  // GET /detail/:id - Paper supplier detail
  // ==================================================================================
  describe('findOne', () => {
    it('[NORMAL] should return paper supplier detail', async () => {
      mockService.findOne.mockResolvedValue(mockPaperSupplier);

      const result = await controller.findOne('ps-id-1');

      expect(service.findOne).toHaveBeenCalledWith('ps-id-1');
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockPaperSupplier,
      });
    });

    it('[NORMAL] should return complete supplier data with all fields', async () => {
      mockService.findOne.mockResolvedValue(mockPaperSupplier);

      const result = await controller.findOne('ps-id-1');

      expect(result.data).toHaveProperty('code');
      expect(result.data).toHaveProperty('name');
      expect(result.data).toHaveProperty('phone');
      expect(result.data).toHaveProperty('address');
      expect(result.data).toHaveProperty('email');
      expect(result.data).toHaveProperty('bank');
      expect(result.data).toHaveProperty('bankAccount');
    });

    it('[ABNORMAL] should throw NotFoundException when not found', async () => {
      mockService.findOne.mockRejectedValue(
        new NotFoundException('Paper Supplier not found')
      );

      await expect(controller.findOne('non-existent')).rejects.toThrow(
        NotFoundException
      );
      expect(service.findOne).toHaveBeenCalledWith('non-existent');
    });

    it('[ABNORMAL] should handle invalid ObjectId format', async () => {
      mockService.findOne.mockRejectedValue(
        new BadRequestException('Invalid ID format')
      );

      await expect(controller.findOne('invalid-id-format')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ==================================================================================
  // POST /create - Create new paper supplier
  // ==================================================================================
  describe('create', () => {
    const createDto: CreatePaperSupplierRequestDto = {
      code: 'PS-001',
      name: 'Paper Supplier A',
      phone: '0123456789',
      address: '123 Main St',
      email: 'supplier@example.com',
      bank: 'ABC Bank',
      bankAccount: '1234567890',
      note: 'Reliable supplier',
    };

    it('[NORMAL] should create paper supplier successfully', async () => {
      mockService.createOne.mockResolvedValue(mockPaperSupplier);

      const result = await controller.create(createDto);

      expect(service.createOne).toHaveBeenCalledWith(createDto);
      expect(service.createOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: `Created paper supplier ${mockPaperSupplier.code} - ${mockPaperSupplier.name} successfully`,
        data: mockPaperSupplier,
      });
    });

    it('[NORMAL] should create with all optional fields', async () => {
      mockService.createOne.mockResolvedValue(mockPaperSupplier);

      const result = await controller.create(createDto);

      expect(result.data).toHaveProperty('phone', '0123456789');
      expect(result.data).toHaveProperty('address', '123 Main St');
      expect(result.data).toHaveProperty('email', 'supplier@example.com');
      expect(result.data).toHaveProperty('bank', 'ABC Bank');
      expect(result.data).toHaveProperty('bankAccount', '1234567890');
      expect(result.data).toHaveProperty('note', 'Reliable supplier');
    });

    it('[NORMAL] should create with minimal required fields only', async () => {
      const minimalDto = {
        code: 'PS-002',
        name: 'Minimal Supplier',
      } as CreatePaperSupplierRequestDto;
      const minimalSupplier = {
        ...mockPaperSupplier,
        code: 'PS-002',
        name: 'Minimal Supplier',
        phone: undefined,
        address: undefined,
        email: undefined,
        bank: undefined,
        bankAccount: undefined,
        note: undefined,
      };
      mockService.createOne.mockResolvedValue(minimalSupplier);

      const result = await controller.create(minimalDto);

      expect(service.createOne).toHaveBeenCalledWith(minimalDto);
      expect(result.success).toBe(true);
    });

    it('[ABNORMAL] should throw error when code already exists', async () => {
      mockService.createOne.mockRejectedValue(
        new BadRequestException('Code already exists')
      );

      await expect(controller.create(createDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle invalid email format', async () => {
      const invalidDto = { ...createDto, email: 'invalid-email' };
      mockService.createOne.mockRejectedValue(
        new BadRequestException('Invalid email format')
      );

      await expect(controller.create(invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle validation errors', async () => {
      const invalidDto = { ...createDto, code: '' };
      mockService.createOne.mockRejectedValue(
        new BadRequestException('Code is required')
      );

      await expect(controller.create(invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ==================================================================================
  // PATCH /update/:id - Update paper supplier
  // ==================================================================================
  describe('update', () => {
    const updateDto: UpdatePaperSupplierRequestDto = {
      name: 'Updated Supplier Name',
      phone: '0987654321',
      note: 'Updated note',
    };

    it('[NORMAL] should update paper supplier successfully', async () => {
      const updatedSupplier = {
        ...mockPaperSupplier,
        name: 'Updated Supplier Name',
        phone: '0987654321',
        note: 'Updated note',
      };
      mockService.updateOne.mockResolvedValue(updatedSupplier);

      const result = await controller.update('ps-id-1', updateDto);

      expect(service.updateOne).toHaveBeenCalledWith('ps-id-1', updateDto);
      expect(service.updateOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: `Updated paper supplier ${updatedSupplier.code} - ${updatedSupplier.name} successfully`,
        data: updatedSupplier,
      });
    });

    it('[NORMAL] should update single field', async () => {
      const singleFieldDto = { phone: '0999999999' };
      const updatedSupplier = { ...mockPaperSupplier, phone: '0999999999' };
      mockService.updateOne.mockResolvedValue(updatedSupplier);

      const result = await controller.update('ps-id-1', singleFieldDto);

      expect(service.updateOne).toHaveBeenCalledWith('ps-id-1', singleFieldDto);
      expect((result.data as any).phone).toBe('0999999999');
    });

    it('[NORMAL] should update multiple fields', async () => {
      const multiFieldDto = {
        name: 'New Name',
        address: 'New Address',
        email: 'new@example.com',
        bank: 'New Bank',
      };
      const updatedSupplier = { ...mockPaperSupplier, ...multiFieldDto };
      mockService.updateOne.mockResolvedValue(updatedSupplier);

      const result = await controller.update('ps-id-1', multiFieldDto);

      expect(service.updateOne).toHaveBeenCalledWith('ps-id-1', multiFieldDto);
      expect(result.success).toBe(true);
    });

    it('[ABNORMAL] should throw NotFoundException if supplier not found', async () => {
      mockService.updateOne.mockRejectedValue(
        new NotFoundException('Paper Supplier not found')
      );

      await expect(controller.update('ps-id-1', updateDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('[ABNORMAL] should handle duplicate code error', async () => {
      const updateWithCode = { code: 'PS-002' };
      mockService.updateOne.mockRejectedValue(
        new BadRequestException('Code already exists')
      );

      await expect(controller.update('ps-id-1', updateWithCode)).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle empty update dto', async () => {
      const emptyDto = {};
      mockService.updateOne.mockRejectedValue(
        new BadRequestException('No fields to update')
      );

      await expect(controller.update('ps-id-1', emptyDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle invalid email format', async () => {
      const invalidDto = { email: 'invalid-email' };
      mockService.updateOne.mockRejectedValue(
        new BadRequestException('Invalid email format')
      );

      await expect(controller.update('ps-id-1', invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ==================================================================================
  // DELETE /delete-soft/:id - Soft delete paper supplier
  // ==================================================================================
  describe('softDelete', () => {
    it('[NORMAL] should soft delete successfully', async () => {
      mockService.softDelete.mockResolvedValue(undefined);

      const result = await controller.softDelete('ps-id-1');

      expect(service.softDelete).toHaveBeenCalledWith('ps-id-1');
      expect(service.softDelete).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Soft deleted successfully',
        data: null,
      });
    });

    it('[ABNORMAL] should throw NotFoundException when supplier not found', async () => {
      mockService.softDelete.mockRejectedValue(
        new NotFoundException('Paper Supplier not found')
      );

      await expect(controller.softDelete('non-existent')).rejects.toThrow(
        NotFoundException
      );
    });

    it('[ABNORMAL] should propagate error if deletion fails', async () => {
      mockService.softDelete.mockRejectedValue(new Error('Deletion failed'));

      await expect(controller.softDelete('ps-id-1')).rejects.toThrow(
        'Deletion failed'
      );
    });

    it('[ABNORMAL] should handle already deleted supplier', async () => {
      mockService.softDelete.mockRejectedValue(
        new BadRequestException('Paper Supplier is already deleted')
      );

      await expect(controller.softDelete('ps-id-1')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ==================================================================================
  // PATCH /restore/:id - Restore paper supplier
  // ==================================================================================
  describe('restore', () => {
    it('[NORMAL] should restore successfully', async () => {
      mockService.restore.mockResolvedValue(undefined);

      const result = await controller.restore('ps-id-1');

      expect(service.restore).toHaveBeenCalledWith('ps-id-1');
      expect(service.restore).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Restored successfully',
        data: null,
      });
    });

    it('[ABNORMAL] should throw NotFoundException if supplier not found', async () => {
      mockService.restore.mockRejectedValue(
        new NotFoundException('Document not found')
      );

      await expect(controller.restore('ps-id-1')).rejects.toThrow(
        NotFoundException
      );
    });

    it('[ABNORMAL] should handle supplier not in deleted state', async () => {
      mockService.restore.mockRejectedValue(
        new BadRequestException('Paper Supplier is not deleted')
      );

      await expect(controller.restore('ps-id-1')).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should propagate service errors', async () => {
      mockService.restore.mockRejectedValue(new Error('Restore failed'));

      await expect(controller.restore('ps-id-1')).rejects.toThrow(
        'Restore failed'
      );
    });
  });

  // ==================================================================================
  // DELETE /delete-hard/:id - Hard delete paper supplier
  // ==================================================================================
  describe('hardDelete', () => {
    it('[NORMAL] should hard delete successfully', async () => {
      mockService.removeHard.mockResolvedValue(undefined);

      const result = await controller.hardDelete('ps-id-1');

      expect(service.removeHard).toHaveBeenCalledWith('ps-id-1');
      expect(service.removeHard).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Permanently deleted successfully',
        data: null,
      });
    });

    it('[ABNORMAL] should throw NotFoundException when not found', async () => {
      mockService.removeHard.mockRejectedValue(
        new NotFoundException('Paper Supplier not found')
      );

      await expect(controller.hardDelete('non-existent')).rejects.toThrow(
        NotFoundException
      );
    });

    it('[ABNORMAL] should handle deletion errors', async () => {
      mockService.removeHard.mockRejectedValue(
        new Error('Cannot delete: has dependencies')
      );

      await expect(controller.hardDelete('ps-id-1')).rejects.toThrow(
        'Cannot delete: has dependencies'
      );
    });

    it('[ABNORMAL] should handle database constraints', async () => {
      mockService.removeHard.mockRejectedValue(
        new BadRequestException('Foreign key constraint')
      );

      await expect(controller.hardDelete('ps-id-1')).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle supplier with active relationships', async () => {
      mockService.removeHard.mockRejectedValue(
        new BadRequestException('Cannot delete supplier with existing orders')
      );

      await expect(controller.hardDelete('ps-id-1')).rejects.toThrow(
        BadRequestException
      );
    });
  });
});