import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrderItemService } from './purchase-order-item.service';
import { getModelToken } from '@nestjs/mongoose';
import { PurchaseOrderItem } from '../schemas/purchase-order-item.schema';
import { NotFoundException } from '@nestjs/common';
import mongoose from 'mongoose';
import { UpdatePurchaseOrderItemDto } from './dto/update-purchase-order-item.dto';

// --- Mock Data ---
const mockId = new mongoose.Types.ObjectId().toString();
const mockObjectId = new mongoose.Types.ObjectId();

const mockPoiDoc = {
  _id: mockId,
  code: 'POI-001',
  amount: 100,
  subPurchaseOrder: mockObjectId,
  ware: mockObjectId,
};

const mockFullDetailDoc = {
  _id: mockId,
  code: 'POI-FULL',
  amount: 200,
  subPurchaseOrder: {
    _id: mockObjectId,
    purchaseOrder: {
      _id: mockObjectId,
      customer: { _id: mockObjectId, name: 'Customer' },
    },
    product: { _id: mockObjectId, code: 'PROD' },
  },
  ware: {
    _id: mockObjectId,
    fluteCombination: { _id: mockObjectId },
    wareManufacturingProcessType: { _id: mockObjectId },
    finishingProcesses: [],
    printColors: [],
  },
};

describe('PurchaseOrderItemService', () => {
  let service: PurchaseOrderItemService;
  let model: any;

  // --- Mock Query Chain ---
  // Định nghĩa chain với các hàm trả về 'this' (để chain tiếp)
  // Các hàm trả về kết quả (populate, lean, exec) sẽ được override trong từng test case
  const mockQueryChain = {
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(), // Mặc định trả về chain
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseOrderItemService,
        {
          provide: getModelToken(PurchaseOrderItem.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<PurchaseOrderItemService>(PurchaseOrderItemService);
    model = module.get(getModelToken(PurchaseOrderItem.name));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =================================================================
  // 1. TEST: findAll
  // =================================================================
  describe('findAll', () => {
    it('[N] Normal: Should return all documents', async () => {
      // SỬA LỖI 1: Dùng 'as any' để tránh lỗi type 'never' hoặc không khớp Query
      // findAll gọi trực tiếp await this.model.find()
      mockModel.find.mockResolvedValue([mockPoiDoc] as any);

      const result = await service.findAll();

      expect(model.find).toHaveBeenCalled();
      expect(result).toEqual([mockPoiDoc]);
    });
  });

  // =================================================================
  // 2. TEST: queryList
  // =================================================================
  describe('queryList', () => {
    it('[N] Normal: Should return paginated list', async () => {
      mockModel.countDocuments.mockResolvedValue(10);
      
      // SỬA LỖI 2: Mock find trả về chain
      mockModel.find.mockReturnValue(mockQueryChain as any);
      
      // QUAN TRỌNG: Trong hàm queryList, code là: .populate(...)
      // Nó await trực tiếp kết quả của populate. 
      // Nên ta phải mock populate trả về Promise chứa data thay vì trả về chain ('this')
      mockQueryChain.populate.mockResolvedValue([mockPoiDoc] as any);

      const result = await service.queryList({ page: 1, limit: 10 });

      expect(model.find).toHaveBeenCalledWith({});
      expect(mockQueryChain.skip).toHaveBeenCalledWith(0);
      expect(mockQueryChain.limit).toHaveBeenCalledWith(10);
      // populate được gọi cuối cùng và trả về data
      expect(result.data).toEqual([mockPoiDoc]);
      expect(result.totalItems).toBe(10);
    });

    it('[B] Boundary: Pagination params calculation', async () => {
      mockModel.countDocuments.mockResolvedValue(0);
      mockModel.find.mockReturnValue(mockQueryChain as any);
      mockQueryChain.populate.mockResolvedValue([] as any);

      const result = await service.queryList({ page: 2, limit: 50 });

      expect(mockQueryChain.skip).toHaveBeenCalledWith(50);
      expect(result.totalItems).toBe(0);
    });
  });

  // =================================================================
  // 3. TEST: queryListFullDetails
  // =================================================================
  describe('queryListFullDetails', () => {
    it('[N] Normal: Should return mapped DTOs', async () => {
      mockModel.countDocuments.mockResolvedValue(1);
      
      mockModel.find.mockReturnValue(mockQueryChain as any);
      
      // Trong queryListFullDetails, hàm cuối cùng là .lean()
      // Nên ta mock lean trả về Promise chứa data
      mockQueryChain.lean.mockResolvedValue([mockFullDetailDoc] as any);
      // Reset populate về mặc định (trả về chain) vì trong flow này populate đứng giữa
      mockQueryChain.populate.mockReturnValue(mockQueryChain as any);

      const result = await service.queryListFullDetails({ page: 1, limit: 10 });

      expect(mockQueryChain.populate).toHaveBeenCalled();
      expect(result.data[0].code).toBe('POI-FULL');
    });

    it('[A] Abnormal: DTO mapping fails if nested data missing', async () => {
        mockModel.countDocuments.mockResolvedValue(1);
        mockModel.find.mockReturnValue(mockQueryChain as any);
        mockQueryChain.populate.mockReturnValue(mockQueryChain as any);
        
        // Trả về data thiếu field nested để gây lỗi mapping
        const badDoc = { ...mockFullDetailDoc, subPurchaseOrder: { ...mockFullDetailDoc.subPurchaseOrder, purchaseOrder: {} } };
        mockQueryChain.lean.mockResolvedValue([badDoc] as any);
  
        await expect(service.queryListFullDetails({ page: 1, limit: 10 })).rejects.toThrow();
      });
  });

  // =================================================================
  // 4. TEST: queryListFullDetailsByIds
  // =================================================================
  describe('queryListFullDetailsByIds', () => {
    it('[N] Normal: Should find by IDs and return DTOs', async () => {
      mockModel.find.mockReturnValue(mockQueryChain as any);
      mockQueryChain.lean.mockResolvedValue([mockFullDetailDoc] as any);
      mockQueryChain.populate.mockReturnValue(mockQueryChain as any);

      const ids = [new mongoose.Types.ObjectId()];
      const result = await service.queryListFullDetailsByIds({ ids });

      expect(model.find).toHaveBeenCalledWith({ _id: { $in: ids } });
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('POI-FULL');
    });
  });

  // =================================================================
  // 5. TEST: update
  // =================================================================
  describe('update', () => {
    const updateDto: UpdatePurchaseOrderItemDto = { amount: 500 };

    it('[N] Normal: Should update and return doc', async () => {
      mockModel.findByIdAndUpdate.mockReturnValue(mockQueryChain as any);
      // Trong update, code gọi .exec() cuối cùng
      mockQueryChain.exec.mockResolvedValue(mockPoiDoc as any);
      // Reset populate để trả về chain
      mockQueryChain.populate.mockReturnValue(mockQueryChain as any);

      const result = await service.update(mockId, updateDto);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        mockId,
        updateDto,
        { new: true }
      );
      expect(result).toEqual(mockPoiDoc);
    });

    it('[A] Abnormal: Should throw NotFoundException', async () => {
      mockModel.findByIdAndUpdate.mockReturnValue(mockQueryChain as any);
      mockQueryChain.exec.mockResolvedValue(null);

      await expect(service.update(mockId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  // =================================================================
  // 6. TEST: softRemove
  // =================================================================
  describe('softRemove', () => {
    it('[N] Normal: Should set isDeleted: true', async () => {
      mockModel.findByIdAndUpdate.mockReturnValue(mockQueryChain as any);
      mockQueryChain.exec.mockResolvedValue(mockPoiDoc as any);

      await service.softRemove(mockId);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        mockId,
        { isDeleted: true },
        { new: true }
      );
    });

    it('[A] Abnormal: Should throw NotFoundException', async () => {
      mockModel.findByIdAndUpdate.mockReturnValue(mockQueryChain as any);
      mockQueryChain.exec.mockResolvedValue(null);

      await expect(service.softRemove(mockId)).rejects.toThrow(NotFoundException);
    });
  });
});