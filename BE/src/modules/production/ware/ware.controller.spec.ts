import { Test, TestingModule } from '@nestjs/testing';
import { WareController } from './ware.controller';
import { WareService } from './ware.service';
import { CreateWareDto } from './dto/create-ware.dto';
import { UpdateWareDto } from './dto/update-ware.dto';

//src/modules/production/ware/ware.controller.spec.ts

// --- Mock Data ---
const mockWareDoc = {
  _id: 'mockId',
  code: 'WARE-001',
  unitPrice: 1000,
  wareWidth: 50,
  wareLength: 100,
  // ... các field khác không quan trọng cho logic controller
};

describe('WareController', () => {
  let controller: WareController;
  let service: WareService;

  const mockWareService = {
    findAll: jest.fn(),
    findOneById: jest.fn(),
    findAllNoPagination: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    removeHard: jest.fn(),
    findDeleted: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WareController],
      providers: [
        {
          provide: WareService,
          useValue: mockWareService,
        },
      ],
    }).compile();

    controller = module.get<WareController>(WareController);
    service = module.get<WareService>(WareService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // =================================================================
  // 1. TEST: findAll (Endpoint: GET /ware)
  // =================================================================
  describe('findAll', () => {
    it('[N] Normal: Should parse string params to numbers', async () => {
      mockWareService.findAll.mockResolvedValue({ data: [mockWareDoc], total: 1 });

      const result = await controller.findAll('2', '20', 'keyword');

      expect(service.findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 20,
        search: 'keyword',
      });
      expect(result).toEqual({ data: [mockWareDoc], total: 1 });
    });

    it('[B] Boundary: Should handle undefined params (pass undefined to service)', async () => {
      mockWareService.findAll.mockResolvedValue([]);
      
      // Controller logic: page ? Number(page) : undefined
      await controller.findAll(undefined, undefined, undefined);

      expect(service.findAll).toHaveBeenCalledWith({
        page: undefined,
        limit: undefined,
        search: undefined,
      });
    });
  });

  // =================================================================
  // 2. TEST: findOne (Endpoint: GET /ware/:id)
  // =================================================================
  describe('findOne', () => {
    it('[N] Normal: Should return a ware by ID', async () => {
      mockWareService.findOneById.mockResolvedValue(mockWareDoc);

      const result = await controller.findOne('mockId');

      expect(service.findOneById).toHaveBeenCalledWith('mockId');
      expect(result).toEqual(mockWareDoc);
    });

    it('[A] Abnormal: Should propagate service error', async () => {
      mockWareService.findOneById.mockRejectedValue(new Error('Not Found'));
      await expect(controller.findOne('badId')).rejects.toThrow('Not Found');
    });
  });

  // =================================================================
  // 3. TEST: findPaginated (Endpoint: GET /ware/list)
  // =================================================================
  describe('findPaginated', () => {
    it('[N] Normal: Should return wrapped BaseResponse', async () => {
      const mockResult = { docs: [mockWareDoc], totalDocs: 1, limit: 10, page: 1 };
      mockWareService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findPaginated('1', '10', 'search');

      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10, search: 'search' });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
    });

    it('[B] Boundary: Should use default values when params are missing', async () => {
      // Controller signature: findPaginated(page = "1", limit = "100", ...)
      mockWareService.findAll.mockResolvedValue([]);

      await controller.findPaginated();

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 100,
        search: undefined,
      });
    });
  });

  // =================================================================
  // 4. TEST: findAllNoPagination (Endpoint: GET /ware/list-all)
  // =================================================================
  describe('findAllNoPagination', () => {
    it('[N] Normal: Should return list without pagination', async () => {
      mockWareService.findAllNoPagination.mockResolvedValue([mockWareDoc]);

      const result = await controller.findAllNoPagination();

      expect(service.findAllNoPagination).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  // =================================================================
  // 5. TEST: create (Endpoint: POST /ware/create)
  // =================================================================
  describe('create', () => {
    // Mock DTO partial (đủ để pass type check trong test)
    const createDto = {
      code: 'WARE-001',
      unitPrice: 100,
      fluteCombination: 'fcId',
      wareWidth: 10,
      wareLength: 20,
      // ...
    } as CreateWareDto;

    it('[N] Normal: Should create and return success message with code', async () => {
      mockWareService.create.mockResolvedValue(mockWareDoc);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result.success).toBe(true);
      // Kiểm tra logic format message của controller: `Created ware ${doc.code} successfully`
      expect(result.message).toBe('Created ware WARE-001 successfully');
      expect(result.data).toEqual(mockWareDoc);
    });

    it('[A] Abnormal: Service throws error', async () => {
      mockWareService.create.mockRejectedValue(new Error('Exists'));
      await expect(controller.create(createDto)).rejects.toThrow('Exists');
    });
  });

  // =================================================================
  // 6. TEST: update (Endpoint: PATCH /ware/update/:id)
  // =================================================================
  describe('update', () => {
    const updateDto = { unitPrice: 2000 } as UpdateWareDto;

    it('[N] Normal: Should update and return success message with code', async () => {
      // Giả sử update xong trả về doc mới
      const updatedDoc = { ...mockWareDoc, unitPrice: 2000 };
      mockWareService.update.mockResolvedValue(updatedDoc);

      const result = await controller.update('mockId', updateDto);

      expect(service.update).toHaveBeenCalledWith('mockId', updateDto);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Updated ware WARE-001 successfully');
      expect(result.data).toEqual(updatedDoc);
    });

    it('[A] Abnormal: Update fails', async () => {
      mockWareService.update.mockRejectedValue(new Error('Update failed'));
      await expect(controller.update('mockId', updateDto)).rejects.toThrow('Update failed');
    });
  });

  // =================================================================
  // 7. TEST: Delete Operations (Soft, Restore, Hard)
  // =================================================================
  describe('Delete and Restore', () => {
    it('[N] Normal: softDelete', async () => {
      mockWareService.softDelete.mockResolvedValue(undefined);
      
      const result = await controller.softDelete('mockId');
      
      expect(service.softDelete).toHaveBeenCalledWith('mockId');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Soft deleted successfully');
    });

    it('[N] Normal: restore', async () => {
      mockWareService.restore.mockResolvedValue(undefined);
      
      const result = await controller.restore('mockId');
      
      expect(service.restore).toHaveBeenCalledWith('mockId');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Restored successfully');
    });

    it('[N] Normal: hardDelete', async () => {
      mockWareService.removeHard.mockResolvedValue(undefined);
      
      const result = await controller.hardDelete('mockId');
      
      expect(service.removeHard).toHaveBeenCalledWith('mockId');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Permanently deleted successfully');
    });

    it('[A] Abnormal: softDelete throws error', async () => {
      mockWareService.softDelete.mockRejectedValue(new Error('Cannot delete'));
      await expect(controller.softDelete('mockId')).rejects.toThrow('Cannot delete');
    });
  });

  // =================================================================
  // 8. TEST: listDeleted (Endpoint: GET /ware/list-deleted)
  // =================================================================
  describe('listDeleted', () => {
    it('[N] Normal: Should return paginated deleted items', async () => {
      const mockResult = { docs: [], totalDocs: 0 };
      mockWareService.findDeleted.mockResolvedValue(mockResult);

      // Call with default params from Controller logic (defaults are provided in @Query)
      // Note: In Controller @Query("page") page = "1"
      const result = await controller.listDeleted();

      expect(service.findDeleted).toHaveBeenCalledWith(1, 100);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Fetch deleted successful');
    });

    it('[N] Normal: Should parse provided params', async () => {
        mockWareService.findDeleted.mockResolvedValue({});
        
        await controller.listDeleted('2', '50');
  
        expect(service.findDeleted).toHaveBeenCalledWith(2, 50);
      });
  });
});