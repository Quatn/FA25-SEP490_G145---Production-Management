import { Test, TestingModule } from '@nestjs/testing';
import { PaperRollTransactionController } from './paper-roll-transaction.controller';
import { PaperRollTransactionService } from './paper-roll-transaction.service';
import { CreatePaperRollTransactionDto } from './dto/create-paper-roll-transaction.dto';
import { UpdatePaperRollTransactionDto } from './dto/update-paper-roll-transaction.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import mongoose from 'mongoose';

//src/modules/warehouse/paper-roll-transaction/paper-roll-transaction.controller.spec.ts

describe('PaperRollTransactionController', () => {
  let controller: PaperRollTransactionController;
  let service: PaperRollTransactionService;

  // Mock Data
  const mockPaperRoll: any = {
    _id: new mongoose.Types.ObjectId('690f75f5e7115610c1866f93'),
    paperSupplierId: new mongoose.Types.ObjectId('690f75f5e7115610c1866f90'),
    paperTypeId: new mongoose.Types.ObjectId('690f75f5e7115610c1866f91'),
    sequenceNumber: 1,
    weight: 1200,
    receivingDate: new Date('2025-11-10'),
    note: 'Test paper roll',
  };

  const mockEmployee: any = {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    code: 'EMP001',
    name: 'John Doe',
    email: 'john@example.com',
  };

  const mockTransaction: any = {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439020'),
    paperRollId: mockPaperRoll._id,
    employeeId: mockEmployee._id,
    transactionType: 'NHAP',
    initialWeight: 1200,
    finalWeight: 1000,
    timeStamp: new Date('2025-11-12T08:30:00.000Z'),
    inCharge: 'operator-1',
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
      controllers: [PaperRollTransactionController],
      providers: [
        {
          provide: PaperRollTransactionService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PaperRollTransactionController>(PaperRollTransactionController);
    service = module.get<PaperRollTransactionService>(PaperRollTransactionService);

    jest.clearAllMocks();
  });

  describe('Definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
      expect(service).toBeDefined();
    });
  });

  // ==================================================================================
  // GET /list - List paginated transactions
  // ==================================================================================
  describe('findPaginated', () => {
    it('[NORMAL] should return paginated list of transactions', async () => {
      const page = 1;
      const limit = 10;

      const mockResponse = {
        items: [mockTransaction],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockService.findPaginated.mockResolvedValue(mockResponse);

      const result = await controller.findPaginated(page, limit);

      expect(service.findPaginated).toHaveBeenCalledWith(page, limit, undefined, undefined);
      expect(service.findPaginated).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockResponse,
      });
    });

    it('[NORMAL] should filter by search query', async () => {
      const page = 1;
      const limit = 10;
      const search = 'NHAP';

      const mockResponse = {
        items: [mockTransaction],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockService.findPaginated.mockResolvedValue(mockResponse);

      const result = await controller.findPaginated(page, limit, search);

      expect(service.findPaginated).toHaveBeenCalledWith(page, limit, search, undefined);
      expect(result.success).toBe(true);
    });

    it('[NORMAL] should filter by paperRollId', async () => {
      const page = 1;
      const limit = 10;
      const paperRollId = '690f75f5e7115610c1866f93';

      const mockResponse = {
        items: [mockTransaction],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockService.findPaginated.mockResolvedValue(mockResponse);

      const result = await controller.findPaginated(page, limit, undefined, paperRollId);

      expect(service.findPaginated).toHaveBeenCalledWith(page, limit, undefined, paperRollId);
      expect(result.success).toBe(true);
    });

    it('[NORMAL] should use default pagination values', async () => {
      const mockResponse = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockService.findPaginated.mockResolvedValue(mockResponse);

      await controller.findPaginated(undefined, undefined);

      expect(service.findPaginated).toHaveBeenCalledWith(1, 10, undefined, undefined);
    });

    it('[BOUNDARY] should return empty data when no transactions found', async () => {
      const emptyResponse = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockService.findPaginated.mockResolvedValue(emptyResponse);

      const result = await controller.findPaginated(1, 10);

      expect(result.data).toEqual(emptyResponse);
      expect((result.data as any).items).toHaveLength(0);
    });

    it('[BOUNDARY] should handle large page numbers', async () => {
      const emptyResponse = {
        items: [],
        total: 0,
        page: 1000,
        limit: 10,
        totalPages: 0,
      };

      mockService.findPaginated.mockResolvedValue(emptyResponse);

      const result = await controller.findPaginated(1000, 10);

      expect(service.findPaginated).toHaveBeenCalledWith(1000, 10, undefined, undefined);
      expect(result.success).toBe(true);
    });

    it('[ABNORMAL] should propagate service errors', async () => {
      mockService.findPaginated.mockRejectedValue(new Error('Database connection failed'));

      await expect(controller.findPaginated(1, 10)).rejects.toThrow('Database connection failed');
    });
  });

  // ==================================================================================
  // GET /list-all - List all transactions
  // ==================================================================================
  describe('findAll', () => {
    it('[NORMAL] should return all transactions', async () => {
      const mockTransactions = [mockTransaction];
      mockService.findAll.mockResolvedValue(mockTransactions);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockTransactions,
      });
    });

    it('[BOUNDARY] should return empty array when no transactions', async () => {
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
  // GET /detail/:id - Transaction detail
  // ==================================================================================
  describe('findOne', () => {
    it('[NORMAL] should return transaction by id', async () => {
      const id = '507f1f77bcf86cd799439020';
      mockService.findOne.mockResolvedValue(mockTransaction);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockTransaction,
      });
    });

    it('[NORMAL] should return complete transaction data with all fields', async () => {
      const id = '507f1f77bcf86cd799439020';
      mockService.findOne.mockResolvedValue(mockTransaction);

      const result = await controller.findOne(id);

      expect(result.data).toHaveProperty('paperRollId');
      expect(result.data).toHaveProperty('employeeId');
      expect(result.data).toHaveProperty('transactionType');
      expect(result.data).toHaveProperty('initialWeight');
      expect(result.data).toHaveProperty('finalWeight');
      expect(result.data).toHaveProperty('timeStamp');
    });

    it('[ABNORMAL] should throw NotFoundException when transaction not found', async () => {
      const id = '507f1f77bcf86cd799439020';
      mockService.findOne.mockRejectedValue(new NotFoundException('Transaction not found'));

      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
      await expect(controller.findOne(id)).rejects.toThrow('Transaction not found');
    });

    it('[ABNORMAL] should handle invalid ObjectId format', async () => {
      const invalidId = 'invalid-id-format';
      mockService.findOne.mockRejectedValue(new BadRequestException('Invalid ID format'));

      await expect(controller.findOne(invalidId)).rejects.toThrow(BadRequestException);
    });

    it('[ABNORMAL] should propagate service errors', async () => {
      const id = '507f1f77bcf86cd799439020';
      mockService.findOne.mockRejectedValue(new Error('Database error'));

      await expect(controller.findOne(id)).rejects.toThrow('Database error');
    });
  });

  // ==================================================================================
  // POST /create - Create transaction
  // ==================================================================================
  describe('create', () => {
    const createDto: CreatePaperRollTransactionDto = {
      paperRollId: '690f75f5e7115610c1866f93',
      transactionType: 'NHAP',
      initialWeight: 1200,
      finalWeight: 1000,
      timeStamp: '2025-11-12T08:30:00.000Z',
      inCharge: 'operator-1',
      employeeId: '507f1f77bcf86cd799439011',
    };

    it('[NORMAL] should create transaction successfully', async () => {
      mockService.createOne.mockResolvedValue(mockTransaction);

      const result = await controller.create(createDto);

      expect(service.createOne).toHaveBeenCalledWith(createDto);
      expect(service.createOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Transaction created',
        data: mockTransaction,
      });
    });

    it('[NORMAL] should create with all fields provided', async () => {
      mockService.createOne.mockResolvedValue(mockTransaction);

      const result = await controller.create(createDto);

      expect(result.data).toHaveProperty('paperRollId');
      expect(result.data).toHaveProperty('transactionType', 'NHAP');
      expect(result.data).toHaveProperty('initialWeight', 1200);
      expect(result.data).toHaveProperty('finalWeight', 1000);
      expect(result.data).toHaveProperty('inCharge', 'operator-1');
    });

    it('[NORMAL] should create with minimal required fields', async () => {
      const minimalDto: CreatePaperRollTransactionDto = {
        paperRollId: '690f75f5e7115610c1866f93',
        transactionType: 'XUAT',
        initialWeight: 1000,
        finalWeight: 800,
        timeStamp: '2025-11-12T10:00:00.000Z',
      };

      const minimalTransaction = {
        ...mockTransaction,
        transactionType: 'XUAT',
        initialWeight: 1000,
        finalWeight: 800,
        inCharge: undefined,
      };

      mockService.createOne.mockResolvedValue(minimalTransaction);

      const result = await controller.create(minimalDto);

      expect(service.createOne).toHaveBeenCalledWith(minimalDto);
      expect(result.success).toBe(true);
    });

    it('[ABNORMAL] should throw error when paperRollId is invalid', async () => {
      mockService.createOne.mockRejectedValue(
        new BadRequestException('paperRollId must be a valid MongoDB ObjectId')
      );

      await expect(controller.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('[ABNORMAL] should throw error when weights are invalid', async () => {
      const invalidDto = { ...createDto, initialWeight: -100 };
      mockService.createOne.mockRejectedValue(
        new BadRequestException('initialWeight must be a positive number')
      );

      await expect(controller.create(invalidDto as any)).rejects.toThrow(BadRequestException);
    });

    it('[ABNORMAL] should handle validation errors', async () => {
      const invalidDto = { ...createDto, transactionType: '' };
      mockService.createOne.mockRejectedValue(
        new BadRequestException('transactionType is required')
      );

      await expect(controller.create(invalidDto as any)).rejects.toThrow(BadRequestException);
    });

    it('[ABNORMAL] should throw error when paper roll not found', async () => {
      mockService.createOne.mockRejectedValue(
        new NotFoundException('Paper roll not found')
      );

      await expect(controller.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('[ABNORMAL] should handle invalid date format', async () => {
      const invalidDto = { ...createDto, timeStamp: 'invalid-date' };
      mockService.createOne.mockRejectedValue(
        new BadRequestException('timeStamp must be a valid ISO date string')
      );

      await expect(controller.create(invalidDto as any)).rejects.toThrow(BadRequestException);
    });
  });

  // ==================================================================================
  // PATCH /update/:id - Update transaction
  // ==================================================================================
  describe('update', () => {
    const updateDto: UpdatePaperRollTransactionDto = {
      transactionType: 'XUAT',
      finalWeight: 900,
      inCharge: 'operator-2',
    };

    it('[NORMAL] should update transaction successfully', async () => {
      const id = '507f1f77bcf86cd799439020';
      const updatedTransaction = {
        ...mockTransaction,
        transactionType: 'XUAT',
        finalWeight: 900,
        inCharge: 'operator-2',
      };

      mockService.updateOne.mockResolvedValue(updatedTransaction);

      const result = await controller.update(id, updateDto);

      expect(service.updateOne).toHaveBeenCalledWith(id, updateDto);
      expect(service.updateOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Transaction updated',
        data: updatedTransaction,
      });
    });

    it('[NORMAL] should update single field', async () => {
      const id = '507f1f77bcf86cd799439020';
      const singleFieldDto: UpdatePaperRollTransactionDto = {
        inCharge: 'new-operator',
      };
      const updatedTransaction = {
        ...mockTransaction,
        inCharge: 'new-operator',
      };

      mockService.updateOne.mockResolvedValue(updatedTransaction);

      const result = await controller.update(id, singleFieldDto);

      expect(service.updateOne).toHaveBeenCalledWith(id, singleFieldDto);
      expect((result.data as any).inCharge).toBe('new-operator');
    });

    it('[NORMAL] should update multiple fields', async () => {
      const id = '507f1f77bcf86cd799439020';
      const multiFieldDto: UpdatePaperRollTransactionDto = {
        transactionType: 'NHAPLAI',
        initialWeight: 800,
        finalWeight: 600,
        inCharge: 'operator-3',
      };
      const updatedTransaction = { ...mockTransaction, ...multiFieldDto };

      mockService.updateOne.mockResolvedValue(updatedTransaction);

      const result = await controller.update(id, multiFieldDto);

      expect(service.updateOne).toHaveBeenCalledWith(id, multiFieldDto);
      expect(result.success).toBe(true);
    });

    it('[ABNORMAL] should throw NotFoundException if transaction not found', async () => {
      const id = '507f1f77bcf86cd799439020';
      mockService.updateOne.mockRejectedValue(
        new NotFoundException('Transaction not found')
      );

      await expect(controller.update(id, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('[ABNORMAL] should handle invalid weight values', async () => {
      const id = '507f1f77bcf86cd799439020';
      const invalidDto = { finalWeight: -100 };
      mockService.updateOne.mockRejectedValue(
        new BadRequestException('finalWeight must be a positive number')
      );

      await expect(controller.update(id, invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('[ABNORMAL] should propagate service errors', async () => {
      const id = '507f1f77bcf86cd799439020';
      mockService.updateOne.mockRejectedValue(new Error('Update failed'));

      await expect(controller.update(id, updateDto)).rejects.toThrow('Update failed');
    });
  });

  // ==================================================================================
  // DELETE /delete-soft/:id - Soft delete transaction
  // ==================================================================================
  describe('softDelete', () => {
    it('[NORMAL] should soft delete successfully', async () => {
      const id = '507f1f77bcf86cd799439020';
      mockService.softDelete.mockResolvedValue(undefined);

      const result = await controller.softDelete(id);

      expect(service.softDelete).toHaveBeenCalledWith(id);
      expect(service.softDelete).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Soft deleted successfully',
        data: null,
      });
    });

    it('[ABNORMAL] should throw NotFoundException when transaction not found', async () => {
      const id = 'non-existent';
      mockService.softDelete.mockRejectedValue(
        new NotFoundException('Transaction not found')
      );

      await expect(controller.softDelete(id)).rejects.toThrow(NotFoundException);
    });

    it('[ABNORMAL] should propagate error if deletion fails', async () => {
      const id = '507f1f77bcf86cd799439020';
      mockService.softDelete.mockRejectedValue(new Error('Deletion failed'));

      await expect(controller.softDelete(id)).rejects.toThrow('Deletion failed');
    });

    it('[ABNORMAL] should handle already deleted transaction', async () => {
      const id = '507f1f77bcf86cd799439020';
      mockService.softDelete.mockRejectedValue(
        new BadRequestException('Transaction is already deleted')
      );

      await expect(controller.softDelete(id)).rejects.toThrow(BadRequestException);
    });
  });

  // ==================================================================================
  // PATCH /restore/:id - Restore transaction
  // ==================================================================================
  describe('restore', () => {
    it('[NORMAL] should restore successfully', async () => {
      const id = '507f1f77bcf86cd799439020';
      mockService.restore.mockResolvedValue(undefined);

      const result = await controller.restore(id);

      expect(service.restore).toHaveBeenCalledWith(id);
      expect(service.restore).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Restored successfully',
        data: null,
      });
    });

    it('[ABNORMAL] should throw NotFoundException if transaction not found', async () => {
      const id = '507f1f77bcf86cd799439020';
      mockService.restore.mockRejectedValue(
        new NotFoundException('Transaction not found')
      );

      await expect(controller.restore(id)).rejects.toThrow(NotFoundException);
    });

    it('[ABNORMAL] should handle transaction not in deleted state', async () => {
      const id = '507f1f77bcf86cd799439020';
      mockService.restore.mockRejectedValue(
        new BadRequestException('Transaction is not deleted')
      );

      await expect(controller.restore(id)).rejects.toThrow(BadRequestException);
    });

    it('[ABNORMAL] should propagate service errors', async () => {
      const id = '507f1f77bcf86cd799439020';
      mockService.restore.mockRejectedValue(new Error('Restore failed'));

      await expect(controller.restore(id)).rejects.toThrow('Restore failed');
    });
  });

  // ==================================================================================
  // DELETE /delete-hard/:id - Hard delete transaction
  // ==================================================================================
  describe('hardDelete', () => {
    it('[NORMAL] should hard delete successfully', async () => {
      const id = '507f1f77bcf86cd799439020';
      mockService.removeHard.mockResolvedValue(undefined);

      const result = await controller.hardDelete(id);

      expect(service.removeHard).toHaveBeenCalledWith(id);
      expect(service.removeHard).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Permanently deleted successfully',
        data: null,
      });
    });

    it('[ABNORMAL] should throw NotFoundException when transaction not found', async () => {
      const id = 'non-existent';
      mockService.removeHard.mockRejectedValue(
        new NotFoundException('Transaction not found')
      );

      await expect(controller.hardDelete(id)).rejects.toThrow(NotFoundException);
    });

    it('[ABNORMAL] should propagate error if deletion fails', async () => {
      const id = '507f1f77bcf86cd799439020';
      mockService.removeHard.mockRejectedValue(new Error('Hard deletion failed'));

      await expect(controller.hardDelete(id)).rejects.toThrow('Hard deletion failed');
    });

    it('[ABNORMAL] should handle database constraint errors', async () => {
      const id = '507f1f77bcf86cd799439020';
      mockService.removeHard.mockRejectedValue(
        new BadRequestException('Cannot delete transaction with existing references')
      );

      await expect(controller.hardDelete(id)).rejects.toThrow(BadRequestException);
    });
  });
});