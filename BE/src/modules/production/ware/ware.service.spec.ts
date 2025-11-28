import { Test, TestingModule } from '@nestjs/testing';
import { WareService } from './ware.service';
import { getModelToken } from '@nestjs/mongoose';
import { Ware } from '../schemas/ware.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateWareDto } from './dto/create-ware.dto';
import { UpdateWareDto } from './dto/update-ware.dto';

// --- Mock Data ---
const mockWareId = new Types.ObjectId().toString();
const mockWareDoc = {
  _id: mockWareId,
  code: 'WARE-001',
  unitPrice: 1000,
  wareWidth: 50,
  wareLength: 100,
  softDelete: jest.fn(), // Mock function cho soft delete plugin
};

describe('WareService', () => {
  let service: WareService;
  let model: any;

  // --- 1. Mock Query Chain (find, populate, sort, exec...) ---
  const mockQueryChain = {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  // --- 2. Mock Cursor (cho collection.find) ---
  const mockCursor = {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    toArray: jest.fn(),
  };

  // --- 3. Mock Model Wrapper ---
  // Phải dùng jest.fn() để có thể gọi "new model()"
  const mockWareModel = jest.fn(() => ({
    ...mockWareDoc,
    save: jest.fn().mockResolvedValue(mockWareDoc), // Instance method .save()
  }));

  // Gán các static methods vào mock model
  Object.assign(mockWareModel, {
    find: jest.fn(() => mockQueryChain),
    findById: jest.fn(() => mockQueryChain),
    findOne: jest.fn(() => mockQueryChain),
    findByIdAndUpdate: jest.fn(() => mockQueryChain),
    findByIdAndDelete: jest.fn(() => mockQueryChain),
    countDocuments: jest.fn(),
    populate: jest.fn(), // Static populate
    
    // Mock access direct vào collection native driver
    collection: {
      find: jest.fn(() => mockCursor),
      updateOne: jest.fn(),
      countDocuments: jest.fn(),
    },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WareService,
        {
          provide: getModelToken(Ware.name),
          useValue: mockWareModel,
        },
      ],
    }).compile();

    service = module.get<WareService>(WareService);
    model = module.get(getModelToken(Ware.name));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =================================================================
  // 1. TEST: findAll
  // =================================================================
  describe('findAll', () => {
    it('[N] Normal: Should return paginated list', async () => {
      mockQueryChain.exec.mockResolvedValue([mockWareDoc]);
      model.countDocuments.mockResolvedValue(10);

      const result = await service.findAll({ page: 1, limit: 10, search: 'code' });

      expect(model.find).toHaveBeenCalledWith(expect.objectContaining({
        $or: expect.arrayContaining([{ code: expect.any(RegExp) }])
      }));
      expect(mockQueryChain.skip).toHaveBeenCalledWith(0);
      expect(mockQueryChain.limit).toHaveBeenCalledWith(10);
      expect(result.data).toEqual([mockWareDoc]);
      expect(result.totalItems).toBe(10);
    });

    it('[B] Boundary: Should handle invalid page/limit numbers', async () => {
      mockQueryChain.exec.mockResolvedValue([]);
      model.countDocuments.mockResolvedValue(0);

      // Page < 1, Limit > 500
      const result = await service.findAll({ page: -5, limit: 1000 });

      // Service logic: page = Math.max(1, ...), limit = Math.min(500, ...)
      expect(result.page).toBe(1);
      expect(result.limit).toBe(500); 
    });

    it('[A] Abnormal: Database error', async () => {
      mockQueryChain.exec.mockRejectedValue(new Error('DB Error'));
      await expect(service.findAll({})).rejects.toThrow('DB Error');
    });
  });

  // =================================================================
  // 2. TEST: findOneById
  // =================================================================
  describe('findOneById', () => {
    it('[N] Normal: Should return populated document', async () => {
      mockQueryChain.exec.mockResolvedValue(mockWareDoc);

      const result = await service.findOneById(mockWareId);

      expect(model.findById).toHaveBeenCalledWith(mockWareId);
      expect(mockQueryChain.populate).toHaveBeenCalled(); // Should populate multiple fields
      expect(result).toEqual(mockWareDoc);
    });

    it('[A] Abnormal: Should throw NotFoundException if not found', async () => {
      mockQueryChain.exec.mockResolvedValue(null);
      await expect(service.findOneById(mockWareId)).rejects.toThrow(NotFoundException);
    });
  });

  // =================================================================
  // 3. TEST: create
  // =================================================================
  describe('create', () => {
    const createDto = {
      code: 'W1',
      unitPrice: 10,
      fluteCombination: new Types.ObjectId().toString(),
      wareManufacturingProcessType: new Types.ObjectId().toString(),
      wareWidth: 100,
      wareLength: 200,
      // Optional field is missing to test normalization
      wareHeight: undefined, 
    } as unknown as CreateWareDto;

    it('[N] Normal: Should normalize data, save, and return populated', async () => {
      // 1. Mock findById for the return population
      mockQueryChain.exec.mockResolvedValue(mockWareDoc);

      const result = await service.create(createDto);

      // Verify constructor was called with normalized data (wareHeight defaults to 0)
      expect(model).toHaveBeenCalledWith(expect.objectContaining({
        code: 'W1',
        wareHeight: 0, // Normalized
        fluteCombination: expect.any(Types.ObjectId), // Converted to ObjectId
      }));
      
      // Verify save called on the instance
      // Note: model.mock.results[0].value is the instance created by "new model()"
      const instance = model.mock.results[0].value;
      expect(instance.save).toHaveBeenCalled();
      
      // Verify population call
      expect(model.findById).toHaveBeenCalled();
      expect(result).toEqual(mockWareDoc);
    });

    it('[A] Abnormal: Should catch Duplicate Key Error (11000)', async () => {
      // Mock save to throw 11000 error
      model.mockImplementationOnce(() => ({
        save: jest.fn().mockRejectedValue({ code: 11000, keyValue: { code: 'W1' } }),
      }));

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('[A] Abnormal: Should propagate other errors', async () => {
      model.mockImplementationOnce(() => ({
        save: jest.fn().mockRejectedValue(new Error('Unknown DB Error')),
      }));

      await expect(service.create(createDto)).rejects.toThrow('Unknown DB Error');
    });
  });

  // =================================================================
  // 4. TEST: update
  // =================================================================
  describe('update', () => {
    const updateDto = { wareHeight: null } as unknown as UpdateWareDto;

    it('[N] Normal: Should check existence, update, and return populated', async () => {
      // 1. Check existence
      mockQueryChain.exec.mockResolvedValueOnce(mockWareDoc); 
      // 2. Update return (findByIdAndUpdate)
      mockQueryChain.exec.mockResolvedValueOnce({ _id: mockWareId });
      // 3. Populate return (findById)
      mockQueryChain.exec.mockResolvedValueOnce(mockWareDoc);

      const result = await service.update(mockWareId, updateDto);

      expect(model.findById).toHaveBeenCalledWith(mockWareId);
      
      // Verify normalization logic in update
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        mockWareId,
        expect.objectContaining({ wareHeight: 0 }), // null -> 0
        { new: true }
      );
      expect(result).toEqual(mockWareDoc);
    });

    it('[A] Abnormal: Should throw NotFoundException if ware not found (check step)', async () => {
      // First findById returns null
      mockQueryChain.exec.mockResolvedValueOnce(null);

      await expect(service.update(mockWareId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  // =================================================================
  // 5. TEST: findAllNoPagination
  // =================================================================
  describe('findAllNoPagination', () => {
    it('[N] Normal: Should return lean array', async () => {
      mockQueryChain.exec.mockResolvedValue([mockWareDoc]);
      
      const result = await service.findAllNoPagination();

      expect(model.find).toHaveBeenCalledWith({});
      expect(mockQueryChain.lean).toHaveBeenCalled();
      expect(result).toEqual([mockWareDoc]);
    });
  });

  // =================================================================
  // 6. TEST: softDelete
  // =================================================================
  describe('softDelete', () => {
    it('[N] Normal: Should call softDelete method on document', async () => {
      mockQueryChain.exec.mockResolvedValue(mockWareDoc);

      const result = await service.softDelete(mockWareId);

      expect(model.findById).toHaveBeenCalledWith(mockWareId);
      expect(mockWareDoc.softDelete).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('[A] Abnormal: Not found', async () => {
      mockQueryChain.exec.mockResolvedValue(null);
      await expect(service.softDelete(mockWareId)).rejects.toThrow(NotFoundException);
    });
  });

  // =================================================================
  // 7. TEST: restore
  // =================================================================
  describe('restore', () => {
    it('[N] Normal: Should update collection directly then find populated', async () => {
      // 1. Mock updateOne success
      model.collection.updateOne.mockResolvedValue({ matchedCount: 1 });
      // 2. Mock findById result
      mockQueryChain.exec.mockResolvedValue(mockWareDoc);

      const result = await service.restore(mockWareId);

      // Verify direct collection usage
      expect(model.collection.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(Types.ObjectId) },
        { $set: { isDeleted: false, deletedAt: null } }
      );
      // Verify findById called afterwards
      expect(model.findById).toHaveBeenCalledWith(mockWareId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockWareDoc);
    });

    it('[A] Abnormal: Not found (matchedCount = 0)', async () => {
      model.collection.updateOne.mockResolvedValue({ matchedCount: 0 });
      await expect(service.restore(mockWareId)).rejects.toThrow(NotFoundException);
    });
  });

  // =================================================================
  // 8. TEST: removeHard
  // =================================================================
  describe('removeHard', () => {
    it('[N] Normal: Should delete successfully', async () => {
      mockQueryChain.exec.mockResolvedValue(mockWareDoc);
      
      const result = await service.removeHard(mockWareId);
      
      expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockWareId);
      expect(result.success).toBe(true);
    });

    it('[A] Abnormal: Not found', async () => {
      mockQueryChain.exec.mockResolvedValue(null);
      await expect(service.removeHard(mockWareId)).rejects.toThrow(NotFoundException);
    });
  });

  // =================================================================
  // 9. TEST: findDeleted
  // =================================================================
  describe('findDeleted', () => {
    it('[N] Normal: Should query collection directly and populate manually', async () => {
      // 1. Mock cursor toArray
      mockCursor.toArray.mockResolvedValue([mockWareDoc]);
      // 2. Mock count
      model.collection.countDocuments.mockResolvedValue(5);
      // 3. Mock populate static method
      model.populate.mockResolvedValue([mockWareDoc]);

      const result = await service.findDeleted(1, 10);

      // Verify collection.find call
      expect(model.collection.find).toHaveBeenCalledWith({ isDeleted: true });
      expect(mockCursor.skip).toHaveBeenCalledWith(0);
      expect(mockCursor.limit).toHaveBeenCalledWith(10);
      
      // Verify manual populate
      expect(model.populate).toHaveBeenCalledWith([mockWareDoc], expect.any(Array));
      
      expect(result.data).toEqual([mockWareDoc]);
      expect(result.totalItems).toBe(5);
    });

    it('[B] Boundary: Pagination calculation', async () => {
      // Total 15 items, limit 10 -> 2 pages
      mockCursor.toArray.mockResolvedValue([]);
      model.collection.countDocuments.mockResolvedValue(15);
      model.populate.mockResolvedValue([]);

      const result = await service.findDeleted(1, 10);
      expect(result.totalPages).toBe(2);
    });
  });
});