import { Test, TestingModule } from '@nestjs/testing';
import { PaperRollService } from './paper-roll.service';
import { getModelToken } from '@nestjs/mongoose';
import { PaperRoll } from '../schemas/paper-roll.schema';
import { PaperSequenceNumber } from '../schemas/paper-sequence-number.schema';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

// --- Mock Data ---
const mockPaperRollId = new Types.ObjectId().toString(); // Valid ObjectId string
const mockDoc = {
  _id: mockPaperRollId,
  sequenceNumber: 1,
  weight: 1000,
  receivingDate: new Date('2025-11-11'),
  paperSupplier: { name: 'SUP' },
  paperType: { name: 'TYPE' },
  save: jest.fn(),
  softDelete: jest.fn(),
  restore: jest.fn(),
};

describe('PaperRollService', () => {
  let service: PaperRollService;
  let paperRollModel: any;
  let sequenceModel: any;

  // Mock cho PaperRollModel
  // Cần mock dạng Function để hỗ trợ: const roll = new this.PaperRollModel(dto)
  const mockPaperRollModel = jest.fn(() => mockDoc);
  
  // Gán các static methods cho mock model
  (mockPaperRollModel as any).aggregate = jest.fn();
  (mockPaperRollModel as any).findById = jest.fn();
  (mockPaperRollModel as any).findByIdAndUpdate = jest.fn();
  (mockPaperRollModel as any).findByIdAndDelete = jest.fn();
  (mockPaperRollModel as any).insertMany = jest.fn();
  (mockPaperRollModel as any).populate = jest.fn();

  // Mock property .collection cho hàm findDeleted (truy cập raw mongo driver)
  (mockPaperRollModel as any).collection = {
    find: jest.fn(() => ({
      skip: jest.fn(() => ({
        limit: jest.fn(() => ({
          toArray: jest.fn().mockResolvedValue([mockDoc]),
        })),
      })),
    })),
    countDocuments: jest.fn().mockResolvedValue(1),
  };

  const mockSequenceModel = {
    findOneAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaperRollService,
        {
          provide: getModelToken(PaperRoll.name),
          useValue: mockPaperRollModel,
        },
        {
          provide: getModelToken(PaperSequenceNumber.name),
          useValue: mockSequenceModel,
        },
      ],
    }).compile();

    service = module.get<PaperRollService>(PaperRollService);
    paperRollModel = module.get(getModelToken(PaperRoll.name));
    sequenceModel = module.get(getModelToken(PaperSequenceNumber.name));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =================================================================
  // 1. TEST: findPaginated
  // =================================================================
  describe('findPaginated', () => {
    it('[N] Normal: Should return paginated result structure', async () => {
      // Mock aggregate result structure: [{ data: [...], totalCount: [{ count: 1 }] }]
      const mockAggResult = [{
        data: [mockDoc],
        totalCount: [{ count: 1 }],
      }];

      // Mock .exec() chain
      const mockExec = jest.fn().mockResolvedValue(mockAggResult);
      paperRollModel.aggregate.mockReturnValue({ exec: mockExec });

      const result = await service.findPaginated(1, 10, 'search', 'weight', 'desc');

      expect(paperRollModel.aggregate).toHaveBeenCalled();
      expect(result.data).toEqual([mockDoc]);
      expect(result.totalItems).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('[B] Boundary: Should handle empty result (page out of range/no data)', async () => {
      // Mock empty result
      const mockAggResult = [{ data: [], totalCount: [] }];
      const mockExec = jest.fn().mockResolvedValue(mockAggResult);
      paperRollModel.aggregate.mockReturnValue({ exec: mockExec });

      const result = await service.findPaginated(1, 10);

      expect(result.data).toEqual([]);
      expect(result.totalItems).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('[A] Abnormal: Database error', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('DB Error'));
      paperRollModel.aggregate.mockReturnValue({ exec: mockExec });

      await expect(service.findPaginated()).rejects.toThrow('DB Error');
    });
  });

  // =================================================================
  // 2. TEST: create
  // =================================================================
  describe('create', () => {
    const dto = {
      paperSupplierId: new Types.ObjectId().toString(),
      paperTypeId: new Types.ObjectId().toString(),
      weight: 100,
      receivingDate: '2025-01-01',
      note: 'test',
    };

    it('[N] Normal: Should create new roll and return populated doc', async () => {
      // 1. Mock Sequence
      sequenceModel.findOneAndUpdate.mockResolvedValue({ currentSequence: 101 });
      
      // 2. Mock Save (mockDoc.save is defined at top)
      mockDoc.save.mockResolvedValue(mockDoc);

      // 3. Mock Aggregate (Population step)
      paperRollModel.aggregate.mockResolvedValue([mockDoc]);

      const result = await service.create(dto);

      expect(sequenceModel.findOneAndUpdate).toHaveBeenCalled();
      expect(mockPaperRollModel).toHaveBeenCalled(); // Constructor called
      expect(mockDoc.save).toHaveBeenCalled();
      expect(paperRollModel.aggregate).toHaveBeenCalled(); // For population
      expect(result).toEqual(mockDoc);
    });

    it('[A] Abnormal: Sequence generation fails', async () => {
        sequenceModel.findOneAndUpdate.mockRejectedValue(new Error('Seq Error'));
        await expect(service.create(dto)).rejects.toThrow('Seq Error');
    });
  });

  // =================================================================
  // 3. TEST: createMultiple
  // =================================================================
  describe('createMultiple', () => {
    const multiDto = {
        rolls: [
            { paperSupplierId: 'id1', paperTypeId: 'id1', weight: 10, receivingDate: '2025-01-01', note: '1' },
            { paperSupplierId: 'id2', paperTypeId: 'id2', weight: 20, receivingDate: '2025-01-01', note: '2' },
        ]
    };

    it('[N] Normal: Should insert multiple rolls and populate', async () => {
        // Mock Sequence increment by 2
        sequenceModel.findOneAndUpdate.mockResolvedValue({ currentSequence: 200 }); // End is 200

        // Mock insertMany
        const insertedDocs = [{ _id: '1' }, { _id: '2' }];
        paperRollModel.insertMany.mockResolvedValue(insertedDocs);

        // Mock Aggregate
        paperRollModel.aggregate.mockResolvedValue(insertedDocs);

        const result = await service.createMultiple(multiDto);

        expect(sequenceModel.findOneAndUpdate).toHaveBeenCalled();
        expect(paperRollModel.insertMany).toHaveBeenCalledWith(expect.any(Array));
        // Check calculation: end=200, length=2 -> start=199. Items: 199, 200.
        // insertMany should be called with objects containing correct sequenceNumbers
        expect(paperRollModel.insertMany.mock.calls[0][0][0].sequenceNumber).toBe(199);
        expect(result).toHaveLength(2);
    });

    it('[B] Boundary: Should return empty array if input list is empty', async () => {
        const result = await service.createMultiple({ rolls: [] });
        expect(result).toEqual([]);
        expect(sequenceModel.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  // =================================================================
  // 4. TEST: findOne
  // =================================================================
  describe('findOne', () => {
    it('[N] Normal: Should return populated document', async () => {
      paperRollModel.aggregate.mockResolvedValue([mockDoc]);
      
      const result = await service.findOne(mockPaperRollId);
      expect(result).toEqual(mockDoc);
    });

    it('[A] Abnormal: Should throw NotFoundException if aggregate returns empty', async () => {
      paperRollModel.aggregate.mockResolvedValue([]); // Not found
      
      await expect(service.findOne(mockPaperRollId)).rejects.toThrow(NotFoundException);
    });

    it('[A] Abnormal: Should throw Error if ID is invalid format', async () => {
       // new Types.ObjectId('invalid') will throw BSONError
       await expect(service.findOne('invalid-hex')).rejects.toThrow();
    });
  });

  // =================================================================
  // 5. TEST: update
  // =================================================================
  describe('update', () => {
    it('[N] Normal: Should update and return populated doc', async () => {
        paperRollModel.findByIdAndUpdate.mockResolvedValue(mockDoc); // Found and updated
        paperRollModel.aggregate.mockResolvedValue([mockDoc]); // Populated

        const result = await service.update(mockPaperRollId, { weight: 999 });

        expect(paperRollModel.findByIdAndUpdate).toHaveBeenCalled();
        expect(result).toEqual(mockDoc);
    });

    it('[A] Abnormal: Should throw NotFoundException if update returns null', async () => {
        paperRollModel.findByIdAndUpdate.mockResolvedValue(null);
        await expect(service.update(mockPaperRollId, {})).rejects.toThrow(NotFoundException);
    });
  });

  // =================================================================
  // 6. TEST: softDelete, restore, removeHard
  // =================================================================
  describe('softDelete & restore & hardRemove', () => {
    
    it('[N] Normal: softDelete success', async () => {
        paperRollModel.findById.mockResolvedValue(mockDoc); // doc has .softDelete mock
        const result = await service.softDelete(mockPaperRollId);
        
        expect(mockDoc.softDelete).toHaveBeenCalled();
        expect(result.success).toBe(true);
    });

    it('[A] Abnormal: softDelete doc not found', async () => {
        paperRollModel.findById.mockResolvedValue(null);
        await expect(service.softDelete(mockPaperRollId)).rejects.toThrow(NotFoundException);
    });

    it('[N] Normal: restore success', async () => {
        paperRollModel.findById.mockResolvedValue(mockDoc);
        const result = await service.restore(mockPaperRollId);

        expect(mockDoc.restore).toHaveBeenCalled();
        expect(result.success).toBe(true);
    });

    it('[N] Normal: removeHard success', async () => {
        paperRollModel.findByIdAndDelete.mockResolvedValue(mockDoc);
        const result = await service.removeHard(mockPaperRollId);
        expect(result.success).toBe(true);
    });

    it('[A] Abnormal: removeHard doc not found', async () => {
        paperRollModel.findByIdAndDelete.mockResolvedValue(null);
        await expect(service.removeHard(mockPaperRollId)).rejects.toThrow(NotFoundException);
    });
  });

  // =================================================================
  // 7. TEST: findDeleted
  // =================================================================
  describe('findDeleted', () => {
    it('[N] Normal: Should query raw collection and populate', async () => {
      // Mock collection behavior is defined in beforeEach via collection property
      paperRollModel.populate.mockResolvedValue([mockDoc]);

      const result = await service.findDeleted(1, 10);

      expect(paperRollModel.collection.find).toHaveBeenCalledWith({ isDeleted: true });
      expect(paperRollModel.populate).toHaveBeenCalled();
      expect(result.data).toEqual([mockDoc]);
      expect(result.totalItems).toBe(1);
    });
  });

  // =================================================================
  // 8. TEST: findByPaperRollId
  // =================================================================
  describe('findByPaperRollId', () => {
    it('[N] Normal: Should find document by custom ID', async () => {
        paperRollModel.aggregate.mockResolvedValue([mockDoc]);
        
        const result = await service.findByPaperRollId('SUP 123');
        expect(result).toEqual(mockDoc);
        // Verify aggregation pipeline matches $match: { paperRollId: ... }
        const pipeline = paperRollModel.aggregate.mock.calls[0][0];
        expect(pipeline[0].$match).toEqual({ paperRollId: 'SUP 123' });
    });

    it('[A] Abnormal: Should throw NotFound if not found', async () => {
        paperRollModel.aggregate.mockResolvedValue([]);
        await expect(service.findByPaperRollId('missing')).rejects.toThrow(NotFoundException);
    });
  });
});