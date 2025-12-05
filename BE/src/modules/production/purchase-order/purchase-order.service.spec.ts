import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrderService } from './purchase-order.service';
import { getModelToken } from '@nestjs/mongoose';
import { PurchaseOrder, PurchaseOrderStatus } from '../schemas/purchase-order.schema';
import { PurchaseOrderItem } from '../schemas/purchase-order-item.schema';
import { Customer } from '../schemas/customer.schema';
import { Ware } from '../schemas/ware.schema';
import { NotFoundException } from '@nestjs/common';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { Types } from 'mongoose';

describe('PurchaseOrderService', () => {
  let service: PurchaseOrderService;
  let purchaseOrderModel: any;
  let purchaseOrderItemModel: any;
  let customerModel: any;
  let wareModel: any;

  // Mock Data
  const mockPOId = new Types.ObjectId().toString();
  const mockCustomerId = new Types.ObjectId().toString();
  
  const mockPO = {
    _id: mockPOId,
    code: 'PO-2025-0001',
    customer: mockCustomerId,
    orderDate: new Date('2025-11-14'),
    deliveryAddress: 'Warehouse A',
    paymentTerms: '30 days',
    status: PurchaseOrderStatus.Draft,
    note: '',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: jest.fn().mockReturnThis(),
  };

  const mockCustomer = {
    _id: mockCustomerId,
    name: 'Customer A',
    code: 'CUST-001',
  };

  // Mock Mongoose Model - Note: This will be a constructor function
  const createMockPurchaseOrderModel = () => {
    const mockModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
      populate: jest.fn(),
      collection: {
        find: jest.fn(),
        countDocuments: jest.fn(),
      },
    };
    return mockModel;
  };

  let mockPurchaseOrderModel: any;

  const mockPurchaseOrderItemModel = {
    aggregate: jest.fn(),
  };

  const mockCustomerModel = {
    populate: jest.fn(),
  };

  const mockWareModel = {
    populate: jest.fn(),
  };

  beforeEach(async () => {
    // Create a fresh mock model for each test
    mockPurchaseOrderModel = createMockPurchaseOrderModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseOrderService,
        {
          provide: getModelToken(PurchaseOrder.name),
          useValue: mockPurchaseOrderModel,
        },
        {
          provide: getModelToken(PurchaseOrderItem.name),
          useValue: mockPurchaseOrderItemModel,
        },
        {
          provide: getModelToken(Customer.name),
          useValue: mockCustomerModel,
        },
        {
          provide: getModelToken(Ware.name),
          useValue: mockWareModel,
        },
      ],
    }).compile();

    service = module.get<PurchaseOrderService>(PurchaseOrderService);
    purchaseOrderModel = module.get(getModelToken(PurchaseOrder.name));
    purchaseOrderItemModel = module.get(getModelToken(PurchaseOrderItem.name));
    customerModel = module.get(getModelToken(Customer.name));
    wareModel = module.get(getModelToken(Ware.name));

    jest.clearAllMocks();
  });

  describe('Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  // ==================================================================================
  // findAll - Get all purchase orders
  // ==================================================================================
  describe('findAll', () => {
    it('[NORMAL] should return all purchase orders', async () => {
      const mockPOs = [mockPO, { ...mockPO, _id: 'po-2', code: 'PO-2025-0002' }];
      purchaseOrderModel.find.mockResolvedValue(mockPOs);

      const result = await service.findAll();

      expect(purchaseOrderModel.find).toHaveBeenCalledWith();
      expect(purchaseOrderModel.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPOs);
      expect(result).toHaveLength(2);
    });

    it('[BOUNDARY] should return empty array when no records exist', async () => {
      purchaseOrderModel.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('[ABNORMAL] should propagate database errors', async () => {
      purchaseOrderModel.find.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  // ==================================================================================
  // queryList - Query with pagination
  // ==================================================================================
  describe('queryList', () => {
    const queryParams = { page: 1, limit: 10 };

    beforeEach(() => {
      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([mockPO]),
      };
      purchaseOrderModel.find.mockReturnValue(mockQuery);
    });

    it('[NORMAL] should return paginated list with data', async () => {
      purchaseOrderModel.countDocuments.mockResolvedValue(25);

      const result = await service.queryList(queryParams);

      expect(purchaseOrderModel.countDocuments).toHaveBeenCalledWith({});
      expect(purchaseOrderModel.find).toHaveBeenCalledWith({});
      expect(result).toEqual({
        page: 1,
        limit: 10,
        totalItems: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: false,
        data: [mockPO],
      });
    });

    it('[NORMAL] should calculate pagination correctly for page 2', async () => {
      const page2Params = { page: 2, limit: 10 };
      purchaseOrderModel.countDocuments.mockResolvedValue(25);

      const result = await service.queryList(page2Params);

      expect(result.page).toBe(2);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPrevPage).toBe(true);
    });

    it('[BOUNDARY] should handle last page correctly', async () => {
      const lastPageParams = { page: 3, limit: 10 };
      purchaseOrderModel.countDocuments.mockResolvedValue(25);

      const result = await service.queryList(lastPageParams);

      expect(result.page).toBe(3);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPrevPage).toBe(true);
    });

    it('[BOUNDARY] should return empty data when no records', async () => {
      purchaseOrderModel.countDocuments.mockResolvedValue(0);
      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([]),
      };
      purchaseOrderModel.find.mockReturnValue(mockQuery);

      const result = await service.queryList(queryParams);

      expect(result.totalItems).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.data).toEqual([]);
    });

    it('[ABNORMAL] should handle database errors', async () => {
      purchaseOrderModel.countDocuments.mockRejectedValue(new Error('DB error'));

      await expect(service.queryList(queryParams)).rejects.toThrow('DB error');
    });
  });

  // ==================================================================================
  // queryOrdersWithUnmanufacturedItems - Complex aggregation query
  // ==================================================================================
  describe('queryOrdersWithUnmanufacturedItems', () => {
    const queryParams = { page: 1, limit: 10, search: 'PO' };

    it('[NORMAL] should return orders with unmanufactured items', async () => {
      const mockAggregateData = [
        {
          purchaseOrder: mockPO,
          unmanufacturedItemCount: 5,
          manufacturedItemCount: 3,
          subPurchaseOrders: [],
        },
      ];
      
      purchaseOrderItemModel.aggregate.mockResolvedValue(mockAggregateData);
      customerModel.populate.mockResolvedValue(mockAggregateData);
      wareModel.populate.mockResolvedValue(mockAggregateData);

      const result = await service.queryOrdersWithUnmanufacturedItems(queryParams);

      expect(purchaseOrderItemModel.aggregate).toHaveBeenCalledTimes(1);
      expect(customerModel.populate).toHaveBeenCalledWith(mockAggregateData, [
        { path: 'purchaseOrder.customer' },
      ]);
      expect(wareModel.populate).toHaveBeenCalledWith(mockAggregateData, [
        { path: 'subPurchaseOrders.purchaseOrderItems.ware' },
      ]);
      expect(result.data).toEqual(mockAggregateData);
    });

    it('[NORMAL] should use search parameter in aggregation', async () => {
      const searchParams = { page: 1, limit: 10, search: 'PO-2025' };
      purchaseOrderItemModel.aggregate.mockResolvedValue([]);
      customerModel.populate.mockResolvedValue([]);
      wareModel.populate.mockResolvedValue([]);

      await service.queryOrdersWithUnmanufacturedItems(searchParams);

      // Verify aggregate was called with search parameter
      const aggregateCall = purchaseOrderItemModel.aggregate.mock.calls[0][0];
      expect(aggregateCall).toBeDefined();
    });

    it('[BOUNDARY] should return empty when no unmanufactured items', async () => {
      purchaseOrderItemModel.aggregate.mockResolvedValue([]);
      customerModel.populate.mockResolvedValue([]);
      wareModel.populate.mockResolvedValue([]);

      const result = await service.queryOrdersWithUnmanufacturedItems(queryParams);

      expect(result.data).toEqual([]);
      expect(result.totalItems).toBe(0);
    });

    it('[ABNORMAL] should handle aggregation errors', async () => {
      purchaseOrderItemModel.aggregate.mockRejectedValue(
        new Error('Aggregation failed')
      );

      await expect(
        service.queryOrdersWithUnmanufacturedItems(queryParams)
      ).rejects.toThrow('Aggregation failed');
    });

    it('[ABNORMAL] should handle populate errors', async () => {
      purchaseOrderItemModel.aggregate.mockResolvedValue([mockPO]);
      customerModel.populate.mockRejectedValue(new Error('Populate failed'));

      await expect(
        service.queryOrdersWithUnmanufacturedItems(queryParams)
      ).rejects.toThrow('Populate failed');
    });
  });

  // ==================================================================================
  // create - Create new purchase order
  // ==================================================================================
  describe('create', () => {
    const createDto: CreatePurchaseOrderDto = {
      code: 'PO-2025-0001',
      orderDate: '2025-11-14',
      deliveryAddress: 'Warehouse A',
      paymentTerms: '30 days',
      customer: mockCustomerId,
    };

    beforeEach(() => {
      // Reset the model constructor mock before each test in this suite
      mockPurchaseOrderModel = jest.fn();
      // Re-inject into service (we'll use spyOn instead)
    });

    it('[NORMAL] should create purchase order successfully', async () => {
      const mockSave = jest.fn().mockResolvedValue(mockPO);
      const mockInstance = { save: mockSave };
      
      // Mock the constructor behavior
      const originalModel = (service as any).purchaseOrderModel;
      const mockConstructor = jest.fn().mockImplementation(() => mockInstance);
      (service as any).purchaseOrderModel = mockConstructor;

      const result = await service.create(createDto);

      expect(mockConstructor).toHaveBeenCalledWith({
        ...createDto,
        orderDate: new Date(createDto.orderDate),
      });
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockPO);

      // Restore
      (service as any).purchaseOrderModel = originalModel;
    });

    it('[NORMAL] should transform date string to Date object', async () => {
      const mockSave = jest.fn().mockResolvedValue(mockPO);
      let capturedPayload: any = null;
      
      const mockInstance = { save: mockSave };
      const originalModel = (service as any).purchaseOrderModel;
      
      (service as any).purchaseOrderModel = jest.fn().mockImplementation((payload: any) => {
        capturedPayload = payload;
        expect(payload.orderDate).toBeInstanceOf(Date);
        expect(payload.orderDate.toISOString()).toContain('2025-11-14');
        return mockInstance;
      });

      await service.create(createDto);

      expect(mockSave).toHaveBeenCalled();
      expect(capturedPayload).not.toBeNull();
      expect(capturedPayload.orderDate).toBeInstanceOf(Date);

      // Restore
      (service as any).purchaseOrderModel = originalModel;
    });

    it('[NORMAL] should create with optional fields', async () => {
      const dtoWithOptional = {
        ...createDto,
        status: PurchaseOrderStatus.Approved,
        note: 'Important note',
      };
      const mockSave = jest.fn().mockResolvedValue({
        ...mockPO,
        status: PurchaseOrderStatus.Approved,
        note: 'Important note',
      });
      const mockInstance = { save: mockSave };
      const originalModel = (service as any).purchaseOrderModel;
      
      (service as any).purchaseOrderModel = jest.fn().mockImplementation(() => mockInstance);

      const result = await service.create(dtoWithOptional);

      expect(result.status).toBe(PurchaseOrderStatus.Approved);
      expect(result.note).toBe('Important note');

      // Restore
      (service as any).purchaseOrderModel = originalModel;
    });

    it('[ABNORMAL] should throw error when code already exists', async () => {
      const mockSave = jest.fn().mockRejectedValue({
        code: 11000,
        message: 'Duplicate key error',
      });
      const mockInstance = { save: mockSave };
      const originalModel = (service as any).purchaseOrderModel;
      
      (service as any).purchaseOrderModel = jest.fn().mockImplementation(() => mockInstance);

      await expect(service.create(createDto)).rejects.toEqual({
        code: 11000,
        message: 'Duplicate key error',
      });

      // Restore
      (service as any).purchaseOrderModel = originalModel;
    });

    it('[ABNORMAL] should throw validation errors', async () => {
      const mockSave = jest.fn().mockRejectedValue(
        new Error('Validation failed')
      );
      const mockInstance = { save: mockSave };
      const originalModel = (service as any).purchaseOrderModel;
      
      (service as any).purchaseOrderModel = jest.fn().mockImplementation(() => mockInstance);

      await expect(service.create(createDto)).rejects.toThrow(
        'Validation failed'
      );

      // Restore
      (service as any).purchaseOrderModel = originalModel;
    });
  });

  // ==================================================================================
  // findOne - Find purchase order by ID
  // ==================================================================================
  describe('findOne', () => {
    it('[NORMAL] should return purchase order by ID', async () => {
      purchaseOrderModel.findById.mockResolvedValue(mockPO);

      const result = await service.findOne(mockPOId);

      expect(purchaseOrderModel.findById).toHaveBeenCalledWith(mockPOId);
      expect(purchaseOrderModel.findById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPO);
    });

    it('[ABNORMAL] should throw NotFoundException when not found', async () => {
      purchaseOrderModel.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Purchase order non-existent-id not found'
      );
    });

    it('[ABNORMAL] should handle invalid ObjectId', async () => {
      purchaseOrderModel.findById.mockRejectedValue(
        new Error('Cast to ObjectId failed')
      );

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        'Cast to ObjectId failed'
      );
    });
  });

  // ==================================================================================
  // updateOne - Update purchase order
  // ==================================================================================
  describe('updateOne', () => {
    const updateDto: UpdatePurchaseOrderDto = {
      status: PurchaseOrderStatus.Approved,
      note: 'Updated note',
    } as any;

    it('[NORMAL] should update purchase order successfully', async () => {
      const updatedPO = { ...mockPO, ...updateDto };
      purchaseOrderModel.findByIdAndUpdate.mockResolvedValue(updatedPO);

      const result = await service.updateOne(mockPOId, updateDto);

      expect(purchaseOrderModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockPOId,
        updateDto,
        { new: true }
      );
      expect(result).toEqual(updatedPO);
    });

    it('[NORMAL] should transform orderDate when provided', async () => {
      const dtoWithDate = {
        ...updateDto,
        orderDate: '2025-12-01' as any,
      };
      const updatedPO = { ...mockPO, orderDate: new Date('2025-12-01') };
      purchaseOrderModel.findByIdAndUpdate.mockResolvedValue(updatedPO);

      await service.updateOne(mockPOId, dtoWithDate);

      const callArgs = purchaseOrderModel.findByIdAndUpdate.mock.calls[0];
      expect(callArgs[1].orderDate).toBeInstanceOf(Date);
    });

    it('[NORMAL] should update only provided fields', async () => {
      const partialDto = { note: 'Only note updated' } as any;
      purchaseOrderModel.findByIdAndUpdate.mockResolvedValue({
        ...mockPO,
        note: 'Only note updated',
      });

      await service.updateOne(mockPOId, partialDto);

      expect(purchaseOrderModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockPOId,
        partialDto,
        { new: true }
      );
    });

    it('[ABNORMAL] should throw NotFoundException when not found', async () => {
      purchaseOrderModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.updateOne('non-existent', updateDto)).rejects.toThrow(
        NotFoundException
      );
      await expect(service.updateOne('non-existent', updateDto)).rejects.toThrow(
        'Purchase order non-existent not found'
      );
    });

    it('[ABNORMAL] should handle validation errors', async () => {
      purchaseOrderModel.findByIdAndUpdate.mockRejectedValue(
        new Error('Validation failed')
      );

      await expect(service.updateOne(mockPOId, updateDto)).rejects.toThrow(
        'Validation failed'
      );
    });
  });

  // ==================================================================================
  // softDelete - Soft delete purchase order
  // ==================================================================================
  describe('softDelete', () => {
    it('[NORMAL] should soft delete successfully', async () => {
      const mockDoc = {
        ...mockPO,
        softDelete: jest.fn().mockResolvedValue(undefined),
      };
      purchaseOrderModel.findById.mockResolvedValue(mockDoc);

      const result = await service.softDelete(mockPOId);

      expect(purchaseOrderModel.findById).toHaveBeenCalledWith(mockPOId);
      expect(mockDoc.softDelete).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('[ABNORMAL] should throw NotFoundException when not found', async () => {
      purchaseOrderModel.findById.mockResolvedValue(null);

      await expect(service.softDelete('non-existent')).rejects.toThrow(
        NotFoundException
      );
      await expect(service.softDelete('non-existent')).rejects.toThrow(
        'Purchase order not found'
      );
    });

    it('[ABNORMAL] should handle soft delete plugin errors', async () => {
      const mockDoc = {
        ...mockPO,
        softDelete: jest.fn().mockRejectedValue(new Error('Plugin error')),
      };
      purchaseOrderModel.findById.mockResolvedValue(mockDoc);

      await expect(service.softDelete(mockPOId)).rejects.toThrow('Plugin error');
    });
  });

  // ==================================================================================
  // findDeleted - Find soft deleted purchase orders
  // ==================================================================================
  describe('findDeleted', () => {
    it('[NORMAL] should return deleted items with pagination', async () => {
      const deletedPOs = [{ ...mockPO, isDeleted: true }];
      const mockCursor = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(deletedPOs),
      };
      
      purchaseOrderModel.collection.find.mockReturnValue(mockCursor);
      purchaseOrderModel.collection.countDocuments.mockResolvedValue(15);
      purchaseOrderModel.populate.mockResolvedValue(deletedPOs);

      const result = await service.findDeleted(2, 10);

      expect(purchaseOrderModel.collection.find).toHaveBeenCalledWith({
        isDeleted: true,
      });
      expect(mockCursor.skip).toHaveBeenCalledWith(10);
      expect(mockCursor.limit).toHaveBeenCalledWith(10);
      expect(purchaseOrderModel.populate).toHaveBeenCalledWith(deletedPOs, [
        { path: 'customer' },
      ]);
      expect(result).toEqual({
        data: deletedPOs,
        page: 2,
        limit: 10,
        totalItems: 15,
        totalPages: 2,
        hasNextPage: false,
        hasPrevPage: true,
      });
    });

    it('[NORMAL] should use default pagination values', async () => {
      const mockCursor = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([]),
      };
      
      purchaseOrderModel.collection.find.mockReturnValue(mockCursor);
      purchaseOrderModel.collection.countDocuments.mockResolvedValue(0);
      purchaseOrderModel.populate.mockResolvedValue([]);

      const result = await service.findDeleted();

      expect(mockCursor.skip).toHaveBeenCalledWith(0);
      expect(mockCursor.limit).toHaveBeenCalledWith(20);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('[BOUNDARY] should return empty when no deleted items', async () => {
      const mockCursor = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([]),
      };
      
      purchaseOrderModel.collection.find.mockReturnValue(mockCursor);
      purchaseOrderModel.collection.countDocuments.mockResolvedValue(0);
      purchaseOrderModel.populate.mockResolvedValue([]);

      const result = await service.findDeleted(1, 20);

      expect(result.data).toEqual([]);
      expect(result.totalItems).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('[ABNORMAL] should handle database errors', async () => {
      purchaseOrderModel.collection.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.findDeleted()).rejects.toThrow('Database error');
    });
  });

  // ==================================================================================
  // restore - Restore soft deleted purchase order
  // ==================================================================================
  describe('restore', () => {
    it('[NORMAL] should restore successfully', async () => {
      const mockDoc = {
        ...mockPO,
        isDeleted: true,
        restore: jest.fn().mockResolvedValue(undefined),
      };
      purchaseOrderModel.findById.mockResolvedValue(mockDoc);

      const result = await service.restore(mockPOId);

      expect(purchaseOrderModel.findById).toHaveBeenCalledWith(mockPOId);
      expect(mockDoc.restore).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('[ABNORMAL] should throw NotFoundException when not found', async () => {
      purchaseOrderModel.findById.mockResolvedValue(null);

      await expect(service.restore('non-existent')).rejects.toThrow(
        NotFoundException
      );
      await expect(service.restore('non-existent')).rejects.toThrow(
        'Purchase order not found'
      );
    });

    it('[ABNORMAL] should handle restore plugin errors', async () => {
      const mockDoc = {
        ...mockPO,
        restore: jest.fn().mockRejectedValue(new Error('Restore failed')),
      };
      purchaseOrderModel.findById.mockResolvedValue(mockDoc);

      await expect(service.restore(mockPOId)).rejects.toThrow('Restore failed');
    });
  });

  // ==================================================================================
  // removeHard - Permanently delete purchase order
  // ==================================================================================
  describe('removeHard', () => {
    it('[NORMAL] should hard delete successfully', async () => {
      purchaseOrderModel.findByIdAndDelete.mockResolvedValue(mockPO);

      const result = await service.removeHard(mockPOId);

      expect(purchaseOrderModel.findByIdAndDelete).toHaveBeenCalledWith(mockPOId);
      expect(purchaseOrderModel.findByIdAndDelete).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: true });
    });

    it('[ABNORMAL] should throw NotFoundException when not found', async () => {
      purchaseOrderModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.removeHard('non-existent')).rejects.toThrow(
        NotFoundException
      );
      await expect(service.removeHard('non-existent')).rejects.toThrow(
        'Purchase order not found'
      );
    });

    it('[ABNORMAL] should handle database constraints', async () => {
      purchaseOrderModel.findByIdAndDelete.mockRejectedValue(
        new Error('Foreign key constraint failed')
      );

      await expect(service.removeHard(mockPOId)).rejects.toThrow(
        'Foreign key constraint failed'
      );
    });
  });

  // ==================================================================================
  // getDetailWithSubs - Get purchase order with sub-orders and items
  // ==================================================================================
  describe('getDetailWithSubs', () => {
    const validObjectId = new Types.ObjectId().toString();
    
    const mockDetailWithSubs = {
      ...mockPO,
      _id: validObjectId,
      subPurchaseOrders: [
        {
          _id: 'sub-1',
          code: 'SPO-001',
          product: { _id: 'prod-1', name: 'Product A' },
          items: [
            {
              _id: 'item-1',
              code: 'ITEM-001',
              ware: { _id: 'ware-1', name: 'Ware A' },
            },
          ],
        },
      ],
    };

    it('[NORMAL] should return purchase order with populated sub-orders', async () => {
      const mockExec = jest.fn().mockResolvedValue([mockDetailWithSubs]);
      purchaseOrderModel.aggregate.mockReturnValue({ exec: mockExec });

      const result = await service.getDetailWithSubs(validObjectId);

      expect(purchaseOrderModel.aggregate).toHaveBeenCalledTimes(1);
      
      // Verify aggregation pipeline structure
      const pipeline = purchaseOrderModel.aggregate.mock.calls[0][0];
      expect(pipeline[0].$match._id).toEqual(new Types.ObjectId(validObjectId));
      expect(pipeline[0].$match.isDeleted).toBe(false);
      
      expect(result).toEqual(mockDetailWithSubs);
      expect(result.subPurchaseOrders).toHaveLength(1);
      expect(result.subPurchaseOrders[0].items).toHaveLength(1);
    });

    it('[NORMAL] should populate products and wares in sub-orders', async () => {
      const mockExec = jest.fn().mockResolvedValue([mockDetailWithSubs]);
      purchaseOrderModel.aggregate.mockReturnValue({ exec: mockExec });

      const result = await service.getDetailWithSubs(validObjectId);

      expect(result.subPurchaseOrders[0].product).toBeDefined();
      expect(result.subPurchaseOrders[0].items[0].ware).toBeDefined();
    });

    it('[NORMAL] should filter out deleted sub-orders and items', async () => {
      const mockExec = jest.fn().mockResolvedValue([mockDetailWithSubs]);
      purchaseOrderModel.aggregate.mockReturnValue({ exec: mockExec });

      await service.getDetailWithSubs(validObjectId);

      const pipeline = purchaseOrderModel.aggregate.mock.calls[0][0];
      const lookupStage = pipeline.find((stage: any) => stage.$lookup);
      
      expect(lookupStage).toBeDefined();
    });

    it('[ABNORMAL] should throw NotFoundException when not found', async () => {
      const mockExec = jest.fn().mockResolvedValue([]);
      purchaseOrderModel.aggregate.mockReturnValue({ exec: mockExec });

      await expect(service.getDetailWithSubs(validObjectId)).rejects.toThrow(
        NotFoundException
      );
      await expect(service.getDetailWithSubs(validObjectId)).rejects.toThrow(
        `PurchaseOrder ${validObjectId} not found`
      );
    });

    it('[ABNORMAL] should handle aggregation errors', async () => {
      const mockExec = jest.fn().mockRejectedValue(
        new Error('Aggregation failed')
      );
      purchaseOrderModel.aggregate.mockReturnValue({ exec: mockExec });

      await expect(service.getDetailWithSubs(validObjectId)).rejects.toThrow(
        'Aggregation failed'
      );
    });

    it('[ABNORMAL] should handle invalid ObjectId format', async () => {
      // This will throw before even reaching the aggregate
      // because `new Types.ObjectId('invalid-id')` throws immediately
      const invalidId = 'invalid-id';

      await expect(service.getDetailWithSubs(invalidId)).rejects.toThrow();
      // The error message will be about invalid ObjectId format
      await expect(service.getDetailWithSubs(invalidId)).rejects.toThrow(
        /must be a 24 character hex string|12 byte Uint8Array|integer/
      );
    });
  });
});