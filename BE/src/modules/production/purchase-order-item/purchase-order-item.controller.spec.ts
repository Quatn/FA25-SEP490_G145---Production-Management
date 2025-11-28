import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrderItemController } from './purchase-order-item.controller';
import { PurchaseOrderItemService } from './purchase-order-item.service';
import { QueryListPurchaseOrderItemRequestDto } from './dto/query-list.dto';
import { QueryListFullDetailsPurchaseOrderItemByIdsRequestDto } from './dto/query-list-full-details-by-ids.dto';
import { UpdatePurchaseOrderItemDto } from './dto/update-purchase-order-item.dto';
import { NotFoundException } from '@nestjs/common';
import mongoose from 'mongoose';

//src/modules/production/purchase-order-item/purchase-order-item.controller.spec.ts

// --- Mock Data ---
const mockId = new mongoose.Types.ObjectId().toString();
const mockDoc = {
  _id: mockId,
  code: 'POI-001',
  amount: 100,
  unitPrice: 50,
  status: 'PENDING',
};

const mockPaginatedResult = {
  docs: [mockDoc],
  totalDocs: 1,
  limit: 10,
  page: 1,
  totalPages: 1,
};

describe('PurchaseOrderItemController', () => {
  let controller: PurchaseOrderItemController;
  let service: PurchaseOrderItemService;

  const mockPoiService = {
    queryList: jest.fn(),
    queryListFullDetails: jest.fn(),
    queryListFullDetailsByIds: jest.fn(),
    update: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseOrderItemController],
      providers: [
        {
          provide: PurchaseOrderItemService,
          useValue: mockPoiService,
        },
      ],
    }).compile();

    controller = module.get<PurchaseOrderItemController>(PurchaseOrderItemController);
    service = module.get<PurchaseOrderItemService>(PurchaseOrderItemService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // =================================================================
  // 1. TEST: queryList (GET /query)
  // =================================================================
  describe('queryList', () => {
    const queryDto: QueryListPurchaseOrderItemRequestDto = {
      page: 1,
      limit: 10,
    };

    it('[N] Normal: Should return wrapped paginated list', async () => {
      mockPoiService.queryList.mockResolvedValue(mockPaginatedResult);

      const result = await controller.queryList(queryDto);

      expect(service.queryList).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockPaginatedResult,
      });
    });

    it('[B] Boundary: Should handle empty query params (defaults)', async () => {
      mockPoiService.queryList.mockResolvedValue(mockPaginatedResult);

      // Call with empty object (simulating no query params provided)
      await controller.queryList({} as any);

      expect(service.queryList).toHaveBeenCalledWith({});
    });

    it('[A] Abnormal: Should propagate service errors', async () => {
      mockPoiService.queryList.mockRejectedValue(new Error('DB Connection Failed'));
      await expect(controller.queryList(queryDto)).rejects.toThrow('DB Connection Failed');
    });
  });

  // =================================================================
  // 2. TEST: queryListFullDetails (GET /query/full-details)
  // =================================================================
  describe('queryListFullDetails', () => {
    const queryDto: QueryListPurchaseOrderItemRequestDto = {
      page: 1,
      limit: 10,
    };

    it('[N] Normal: Should return wrapped fully populated list', async () => {
      // Mocking a complex structure for full details
      const fullDetailResult = { ...mockPaginatedResult, docs: [{ ...mockDoc, populatedField: true }] };
      mockPoiService.queryListFullDetails.mockResolvedValue(fullDetailResult);

      const result = await controller.queryListFullDetails(queryDto);

      expect(service.queryListFullDetails).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: fullDetailResult,
      });
    });

    it('[A] Abnormal: Service failure', async () => {
      mockPoiService.queryListFullDetails.mockRejectedValue(new Error('Population Error'));
      await expect(controller.queryListFullDetails(queryDto)).rejects.toThrow('Population Error');
    });
  });

  // =================================================================
  // 3. TEST: queryListFullDetailsByIds (GET /query/full-details/by-ids)
  // =================================================================
  describe('queryListFullDetailsByIds', () => {
    // Note: The Transformation logic (String -> ObjectId) happens in the DTO Pipe.
    // In unit tests for Controller, we pass the DTO object as if it was already transformed.
    const validObjectId = new mongoose.Types.ObjectId();
    const queryDto: QueryListFullDetailsPurchaseOrderItemByIdsRequestDto = {
      ids: [validObjectId],
    };

    it('[N] Normal: Should return wrapped list by IDs', async () => {
      const mockResultDocs = [{ ...mockDoc, _id: validObjectId }];
      mockPoiService.queryListFullDetailsByIds.mockResolvedValue(mockResultDocs);

      const result = await controller.queryListFullDetailsByIds(queryDto);

      expect(service.queryListFullDetailsByIds).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockResultDocs,
      });
    });

    it('[B] Boundary: Should handle empty array of IDs', async () => {
      const emptyDto = { ids: [] };
      mockPoiService.queryListFullDetailsByIds.mockResolvedValue([]);

      const result = await controller.queryListFullDetailsByIds(emptyDto);

      expect(service.queryListFullDetailsByIds).toHaveBeenCalledWith(emptyDto);
      expect(result.data).toEqual([]);
    });

    it('[A] Abnormal: Service failure', async () => {
      mockPoiService.queryListFullDetailsByIds.mockRejectedValue(new Error('Fail'));
      await expect(controller.queryListFullDetailsByIds(queryDto)).rejects.toThrow('Fail');
    });
  });

  // =================================================================
  // 4. TEST: update (PATCH /:id)
  // =================================================================
  describe('update', () => {
    const updateDto: UpdatePurchaseOrderItemDto = {
      amount: 200,
      note: 'Updated note',
    };

    it('[N] Normal: Should update and return result directly', async () => {
      const updatedDoc = { ...mockDoc, amount: 200, note: 'Updated note' };
      // Note: In your controller code for `update`, you return `this.poiService.update(...)` directly
      // without wrapping it in `{ success: true ... }`. The test reflects this.
      mockPoiService.update.mockResolvedValue(updatedDoc);

      const result = await controller.update(mockId, updateDto);

      expect(service.update).toHaveBeenCalledWith(mockId, updateDto);
      expect(result).toEqual(updatedDoc);
    });

    it('[A] Abnormal: Should throw NotFoundException if service throws', async () => {
      mockPoiService.update.mockRejectedValue(new NotFoundException('Item not found'));
      await expect(controller.update(mockId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  // =================================================================
  // 5. TEST: remove (DELETE /delete-soft/:id)
  // =================================================================
  describe('remove', () => {
    it('[N] Normal: Should soft delete and return result directly', async () => {
      const response = { success: true };
      // Note: In your controller code for `remove`, you return `this.poiService.softRemove(...)` directly.
      mockPoiService.softRemove.mockResolvedValue(response);

      const result = await controller.remove(mockId);

      expect(service.softRemove).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(response);
    });

    it('[A] Abnormal: Should propagate error if service throws', async () => {
      mockPoiService.softRemove.mockRejectedValue(new Error('Cannot delete'));
      await expect(controller.remove(mockId)).rejects.toThrow('Cannot delete');
    });
  });
});