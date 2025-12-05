import { Test, TestingModule } from '@nestjs/testing';
import { PaperRollController } from './paper-roll.controller';
import { PaperRollService } from './paper-roll.service';
import { CreateMultiplePaperRollDto, CreatePaperRollDto } from './dto/create-paper-roll.dto';
import { UpdatePaperRollDto } from './dto/update-paper-roll.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock Data Helpers
const mockDate = new Date('2025-11-11T00:00:00.000Z');
const mockSupplierName = 'SUP';
const mockDoc = {
  _id: 'mockId',
  paperSupplier: { name: mockSupplierName },
  sequenceNumber: 1,
  receivingDate: mockDate, // Year 2025 -> Last 2 digits: 25
  weight: 1000,
  note: 'test',
} as any;

describe('PaperRollController', () => {
  let controller: PaperRollController;
  let service: PaperRollService;

  const mockPaperRollService = {
    findPaginated: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    createMultiple: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    removeHard: jest.fn(),
    findDeleted: jest.fn(),
    findByPaperRollId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaperRollController],
      providers: [
        {
          provide: PaperRollService,
          useValue: mockPaperRollService,
        },
      ],
    }).compile();

    controller = module.get<PaperRollController>(PaperRollController);
    service = module.get<PaperRollService>(PaperRollService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // =================================================================
  // 1. TEST: findPaginated
  // =================================================================
  describe('findPaginated', () => {
    const mockResult = { docs: [mockDoc], totalDocs: 1, limit: 10, page: 1 };

    it('[N] Normal: Should return paginated list with valid params', async () => {
      mockPaperRollService.findPaginated.mockResolvedValue(mockResult);
      
      const result = await controller.findPaginated(1, 10, 'search', 'weight', 'desc');
      
      expect(service.findPaginated).toHaveBeenCalledWith(1, 10, 'search', 'weight', 'desc');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
    });

    it('[B] Boundary: Should use default parameters when not provided', async () => {
        mockPaperRollService.findPaginated.mockResolvedValue(mockResult);
        
        // Calling without optional args
        await controller.findPaginated();
        
        // Expect default values: page=1, limit=10, sortBy='both', sortOrder='desc'
        expect(service.findPaginated).toHaveBeenCalledWith(1, 10, undefined, 'both', 'desc');
    });

    it('[A] Abnormal: Should propagate service errors', async () => {
      mockPaperRollService.findPaginated.mockRejectedValue(new Error('DB Error'));
      await expect(controller.findPaginated()).rejects.toThrow('DB Error');
    });
  });

  // =================================================================
  // 2. TEST: findOne
  // =================================================================
  describe('findOne', () => {
    it('[N] Normal: Should return a single paper roll', async () => {
      mockPaperRollService.findOne.mockResolvedValue(mockDoc);
      
      const result = await controller.findOne('mockId');
      
      expect(service.findOne).toHaveBeenCalledWith('mockId');
      expect(result.data).toEqual(mockDoc);
    });

    it('[A] Abnormal: Should throw error if service fails (e.g. invalid ID format)', async () => {
      mockPaperRollService.findOne.mockRejectedValue(new BadRequestException('Invalid ID'));
      await expect(controller.findOne('invalid')).rejects.toThrow(BadRequestException);
    });
  });

  // =================================================================
  // 3. TEST: create
  // =================================================================
  describe('create', () => {
    const createDto: CreatePaperRollDto = {
        paperSupplierId: 'supId',
        paperTypeId: 'typeId',
        weight: 1000,
        receivingDate: '2025-11-11',
        note: 'Note',
    };

    it('[N] Normal: Should create and return correct success message', async () => {
      // Logic check: Message format: ${SupplierName}${Seq}XC${YearLast2Digits}
      // SUP + 1 + XC + 25 = SUP1XC25
      mockPaperRollService.create.mockResolvedValue(mockDoc);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result.success).toBe(true);
      // Validating the specific logic inside controller:
      expect(result.message).toBe('Created paper roll SUP1XC25 successfully');
      expect(result.data).toEqual(mockDoc);
    });

    it('[B] Boundary: Should handle year boundary correctly (e.g., 2000 -> 00)', async () => {
        const doc2000 = { ...mockDoc, receivingDate: new Date('2000-01-01') };
        mockPaperRollService.create.mockResolvedValue(doc2000);
  
        const result = await controller.create(createDto);
        // 2000 % 100 = 0 -> expects "0" or "00"? Javascript number 0 is just "0".
        // Code: `lastTwoDigits = ... % 100` -> Result: `...XC0`
        expect(result.message).toContain('XC0'); 
    });

    it('[A] Abnormal: Service throws validation error', async () => {
      mockPaperRollService.create.mockRejectedValue(new BadRequestException());
      await expect(controller.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  // =================================================================
  // 4. TEST: createMultiple
  // =================================================================
  describe('createMultiple', () => {
    const multiDto: CreateMultiplePaperRollDto = { rolls: [] }; // Mock content irrelevant due to mockService

    it('[N] Normal: Should create multiple and join messages', async () => {
        const doc1 = { ...mockDoc, sequenceNumber: 1 }; // SUP1XC25
        const doc2 = { ...mockDoc, sequenceNumber: 2 }; // SUP2XC25
        mockPaperRollService.createMultiple.mockResolvedValue([doc1, doc2]);

        const result = await controller.createMultiple(multiDto);

        expect(service.createMultiple).toHaveBeenCalledWith(multiDto);
        expect(result.message).toContain('Created 2 paper rolls successfully');
        expect(result.message).toContain('SUP1XC25, SUP2XC25');
    });

    it('[B] Boundary: Should handle empty list if service allows', async () => {
        mockPaperRollService.createMultiple.mockResolvedValue([]);
        const result = await controller.createMultiple({ rolls: [] });
        expect(result.message).toBe('Created 0 paper rolls successfully: ');
        expect(result.data).toEqual([]);
    });
  });

  // =================================================================
  // 5. TEST: update
  // =================================================================
  describe('update', () => {
    const updateDto: UpdatePaperRollDto = { weight: 2000 };

    it('[N] Normal: Should update and return formatted message', async () => {
        mockPaperRollService.update.mockResolvedValue(mockDoc);

        const result = await controller.update('mockId', updateDto);

        expect(service.update).toHaveBeenCalledWith('mockId', updateDto);
        expect(result.message).toBe('Updated paper roll SUP1XC25 successfully');
    });

    it('[A] Abnormal: Should fail if ID not found', async () => {
        mockPaperRollService.update.mockRejectedValue(new NotFoundException());
        await expect(controller.update('missing', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  // =================================================================
  // 6. TEST: softDelete, restore, hardDelete
  // =================================================================
  describe('Delete and Restore operations', () => {
    it('[N] Normal: softDelete', async () => {
        mockPaperRollService.softDelete.mockResolvedValue(undefined);
        const result = await controller.softDelete('id');
        expect(service.softDelete).toHaveBeenCalledWith('id');
        expect(result.message).toBe('Soft deleted successfully');
    });

    it('[N] Normal: restore', async () => {
        mockPaperRollService.restore.mockResolvedValue(undefined);
        const result = await controller.restore('id');
        expect(service.restore).toHaveBeenCalledWith('id');
        expect(result.message).toBe('Restored successfully');
    });

    it('[N] Normal: hardDelete', async () => {
        mockPaperRollService.removeHard.mockResolvedValue(undefined);
        const result = await controller.hardDelete('id');
        expect(service.removeHard).toHaveBeenCalledWith('id');
        expect(result.message).toBe('Permanently deleted successfully');
    });

    it('[A] Abnormal: Service failure in delete', async () => {
        mockPaperRollService.softDelete.mockRejectedValue(new Error('Failed'));
        await expect(controller.softDelete('id')).rejects.toThrow('Failed');
    });
  });

  // =================================================================
  // 7. TEST: findDeleted
  // =================================================================
  describe('findDeleted', () => {
    it('[N] Normal: Should return paginated deleted items', async () => {
        const mockDeletedResult = { docs: [], totalDocs: 0 };
        mockPaperRollService.findDeleted.mockResolvedValue(mockDeletedResult);

        const result = await controller.findDeleted(1, 5);

        expect(service.findDeleted).toHaveBeenCalledWith(1, 5);
        expect(result.success).toBe(true);
    });
  });

  // =================================================================
  // 8. TEST: findByPaperRollId (Custom Logic)
  // =================================================================
  describe('findByPaperRollId', () => {
    // Note: The controller logic decodes the param
    
    it('[N] Normal: Should decode URL and find document', async () => {
        const rawId = 'SUP%20123'; // Encoded "SUP 123"
        const decodedId = 'SUP 123';
        mockPaperRollService.findByPaperRollId.mockResolvedValue(mockDoc);

        const result = await controller.findByPaperRollId(rawId);

        expect(service.findByPaperRollId).toHaveBeenCalledWith(decodedId);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockDoc);
    });

    it('[B] Boundary: Should handle empty string input', async () => {
       mockPaperRollService.findByPaperRollId.mockResolvedValue(null);

        const result = await controller.findByPaperRollId(undefined as any); 

        expect(service.findByPaperRollId).toHaveBeenCalledWith('');
        expect(result.success).toBe(false);
    });

    it('[A] Abnormal: Should return 404 structure (not throw) when doc is null', async () => {
        mockPaperRollService.findByPaperRollId.mockResolvedValue(null);
        const rawId = 'NonExistent';

        const result = await controller.findByPaperRollId(rawId);

        // Controller logic manually constructs a failure response instead of throwing
        expect(result.success).toBe(false);
        expect(result.message).toContain('not found');
        expect((result.error as any).status).toBe(404);
        expect(result.data).toBeUndefined();
    });
  });
});