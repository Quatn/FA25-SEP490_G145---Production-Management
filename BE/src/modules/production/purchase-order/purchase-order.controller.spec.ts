import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrderController } from './purchase-order.controller';
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { QueryListPurchaseOrderRequestDto } from './dto/query-list.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PurchaseOrderStatus } from '../schemas/purchase-order.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { QueryOrdersWithUnmanufacturedItemsRequestDto } from './dto/query-orders-with-unmanufactured-items.dto';

//src/modules/production/purchase-order/purchase-order.controller.spec.ts

describe('PurchaseOrderController', () => {
  let controller: PurchaseOrderController;
  let service: PurchaseOrderService;

  // Mock Data - Aligned with PurchaseOrder schema
  const mockPO: any = {
    _id: 'po-id-1',
    code: 'PO-2025-0001',
    customer: 'customer-id-1', 
    orderDate: new Date('2025-11-14'),
    deliveryAddress: 'Warehouse A',
    paymentTerms: '30 days',
    status: PurchaseOrderStatus.Draft,
    note: '',
    isDeleted: false, 
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCustomer = {
    _id: 'customer-id-1',
    name: 'Customer A',
    code: 'CUST-001',
  };

  const mockService = {
    queryList: jest.fn(),
    queryOrdersWithUnmanufacturedItems: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
    softDelete: jest.fn(),
    findDeleted: jest.fn(),
    restore: jest.fn(),
    removeHard: jest.fn(),
    getDetailWithSubs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseOrderController],
      providers: [
        {
          provide: PurchaseOrderService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PurchaseOrderController>(PurchaseOrderController);
    service = module.get<PurchaseOrderService>(PurchaseOrderService);

    jest.clearAllMocks();
  });

  describe('Definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
      expect(service).toBeDefined();
    });
  });

  // ==================================================================================
  // GET /query - Query purchase order items
  // ==================================================================================
  describe('queryList', () => {
    const queryDto: QueryListPurchaseOrderRequestDto = {
      page: 1,
      limit: 10,
      search: '',
    } as any;

    it('[NORMAL] should return paginated list of purchase orders', async () => {
      const mockResponse = {
        data: [mockPO],
        total: 1,
        page: 1,
        limit: 10,
        totalPage: 1,
      };
      mockService.queryList.mockResolvedValue(mockResponse);

      const result = await controller.queryList(queryDto);

      expect(service.queryList).toHaveBeenCalledWith(queryDto);
      expect(service.queryList).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockResponse,
      });
    });

    it('[NORMAL] should handle search query', async () => {
      const searchDto = { ...queryDto, search: 'PO-2025' };
      const mockResponse = {
        data: [mockPO],
        total: 1,
        page: 1,
        limit: 10,
        totalPage: 1,
      };
      mockService.queryList.mockResolvedValue(mockResponse);

      const result = await controller.queryList(searchDto);

      expect(service.queryList).toHaveBeenCalledWith(searchDto);
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
      mockService.queryList.mockResolvedValue(emptyResponse);

      const result = await controller.queryList(queryDto);

      expect(result.data).toEqual(emptyResponse);
      expect((result.data as any).data).toHaveLength(0);
    });

    it('[BOUNDARY] should handle large page numbers', async () => {
      const largePageDto = { ...queryDto, page: 1000 };
      const emptyResponse = {
        data: [],
        total: 0,
        page: 1000,
        limit: 10,
        totalPage: 0,
      };
      mockService.queryList.mockResolvedValue(emptyResponse);

      const result = await controller.queryList(largePageDto);

      expect(service.queryList).toHaveBeenCalledWith(largePageDto);
      expect(result.success).toBe(true);
    });

    it('[ABNORMAL] should propagate service errors', async () => {
      mockService.queryList.mockRejectedValue(new Error('Database error'));

      await expect(controller.queryList(queryDto)).rejects.toThrow('Database error');
      expect(service.queryList).toHaveBeenCalledWith(queryDto);
    });

    it('[ABNORMAL] should handle validation errors', async () => {
      mockService.queryList.mockRejectedValue(new BadRequestException('Invalid query'));

      await expect(controller.queryList(queryDto)).rejects.toThrow(BadRequestException);
    });
  });

  // ==================================================================================
  // GET /query/not-fully-scheduled - Query orders with unmanufactured items
  // ==================================================================================
  describe('queryOrdersWithUnmanufacturedItems', () => {
    const queryDto: QueryOrdersWithUnmanufacturedItemsRequestDto = {
      page: 1,
      limit: 10,
      search: 'PO',
    };

    it('[NORMAL] should return list of orders with unmanufactured items', async () => {
      const mockResponse = {
        data: [{ 
          ...mockPO, 
          unmanufacturedItemCount: 5,
          manufacturedItemCount: 3,
          subPurchaseOrders: []
        }],
        total: 1,
        page: 1,
        limit: 10,
        totalPage: 1,
      };
      mockService.queryOrdersWithUnmanufacturedItems.mockResolvedValue(mockResponse);

      const result = await controller.queryOrdersWithUnmanufacturedItems(queryDto);

      expect(service.queryOrdersWithUnmanufacturedItems).toHaveBeenCalledWith(queryDto);
      expect(service.queryOrdersWithUnmanufacturedItems).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect((result.data as any).data[0].unmanufacturedItemCount).toBe(5);
    });

    it('[NORMAL] should filter by search term', async () => {
      const searchDto = { ...queryDto, search: 'PO-2025' };
      const mockResponse = {
        data: [mockPO],
        total: 1,
        page: 1,
        limit: 10,
        totalPage: 1,
      };
      mockService.queryOrdersWithUnmanufacturedItems.mockResolvedValue(mockResponse);

      await controller.queryOrdersWithUnmanufacturedItems(searchDto);

      expect(service.queryOrdersWithUnmanufacturedItems).toHaveBeenCalledWith(searchDto);
    });

    it('[BOUNDARY] should return empty when no unmanufactured items', async () => {
      const emptyResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPage: 0,
      };
      mockService.queryOrdersWithUnmanufacturedItems.mockResolvedValue(emptyResponse);

      const result = await controller.queryOrdersWithUnmanufacturedItems(queryDto);

      expect(result.data).toEqual(emptyResponse);
    });

    it('[ABNORMAL] should handle service errors', async () => {
      mockService.queryOrdersWithUnmanufacturedItems.mockRejectedValue(
        new Error('Aggregation error')
      );

      await expect(
        controller.queryOrdersWithUnmanufacturedItems(queryDto)
      ).rejects.toThrow('Aggregation error');
    });
  });

  // ==================================================================================
  // GET /detail/:id - Purchase order detail
  // ==================================================================================
  describe('findOne', () => {
    it('[NORMAL] should return purchase order detail', async () => {
      mockService.findOne.mockResolvedValue(mockPO);

      const result = await controller.findOne('po-id-1');

      expect(service.findOne).toHaveBeenCalledWith('po-id-1');
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockPO,
      });
    });

    it('[NORMAL] should return complete purchase order data with populated customer', async () => {
      const completePO = {
        ...mockPO,
        customer: mockCustomer, // populated Customer object
      };
      mockService.findOne.mockResolvedValue(completePO);

      const result = await controller.findOne('po-id-1');

      expect(result.data).toHaveProperty('customer');
      expect((result.data as any).customer).toEqual(mockCustomer);
      expect((result.data as any).customer.name).toBe('Customer A');
    });

    it('[ABNORMAL] should throw NotFoundException when not found', async () => {
      mockService.findOne.mockRejectedValue(
        new NotFoundException('Purchase Order not found')
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
  // POST /create - Create new purchase order
  // ==================================================================================
  describe('create', () => {
    const createDto: CreatePurchaseOrderDto = {
      code: 'PO-2025-0001',
      orderDate: '2025-11-14', // ISO date string as per DTO
      deliveryAddress: 'Warehouse A',
      paymentTerms: '30 days',
      customer: 'customer-id-1', // Optional MongoId
    };

    it('[NORMAL] should create purchase order successfully', async () => {
      mockService.create.mockResolvedValue(mockPO);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: `Created purchase order ${mockPO.code} successfully`,
        data: mockPO,
      });
    });

    it('[NORMAL] should create with all optional fields', async () => {
      const dtoWithOptional = {
        ...createDto,
        status: PurchaseOrderStatus.Approved, // optional status
        note: 'Important order', // optional note
      };
      const createdPO = { 
        ...mockPO, 
        status: PurchaseOrderStatus.Approved,
        note: 'Important order' 
      };
      mockService.create.mockResolvedValue(createdPO);

      const result = await controller.create(dtoWithOptional);

      expect(result.data).toHaveProperty('status', PurchaseOrderStatus.Approved);
      expect(result.data).toHaveProperty('note', 'Important order');
    });

    it('[NORMAL] should create with default values when optional fields omitted', async () => {
      const minimalDto = { 
        code: 'PO-2025-0002',
        orderDate: '2025-11-14',
        deliveryAddress: 'Warehouse B',
        paymentTerms: '60 days',
      };
      const createdPO = { 
        ...mockPO, 
        code: 'PO-2025-0002',
        status: PurchaseOrderStatus.Draft, // default status
        note: '', // default empty note
        customer: undefined, // optional customer not provided
      };
      mockService.create.mockResolvedValue(createdPO);

      const result = await controller.create(minimalDto as any);

      expect(service.create).toHaveBeenCalledWith(minimalDto);
      expect((result.data as any).status).toBe(PurchaseOrderStatus.Draft);
      expect((result.data as any).note).toBe('');
    });

    it('[NORMAL] should create without optional customer', async () => {
      const dtoWithoutCustomer = { ...createDto };
      delete dtoWithoutCustomer.customer;
      mockService.create.mockResolvedValue({ ...mockPO, customer: null });

      const result = await controller.create(dtoWithoutCustomer);

      expect(service.create).toHaveBeenCalledWith(dtoWithoutCustomer);
      expect(result.success).toBe(true);
    });

    it('[ABNORMAL] should throw error when code already exists', async () => {
      mockService.create.mockRejectedValue(
        new BadRequestException('Code already exists')
      );

      await expect(controller.create(createDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle invalid date format', async () => {
      const invalidDto = { ...createDto, orderDate: 'invalid-date' };
      mockService.create.mockRejectedValue(
        new BadRequestException('Invalid date format')
      );

      await expect(controller.create(invalidDto as any)).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle invalid customer MongoId', async () => {
      const invalidDto = { ...createDto, customer: 'not-a-valid-objectid' };
      mockService.create.mockRejectedValue(
        new BadRequestException('Invalid customer ObjectId')
      );

      await expect(controller.create(invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ==================================================================================
  // PATCH /update/:id - Update purchase order
  // ==================================================================================
  describe('update', () => {
    const updateDto: UpdatePurchaseOrderDto = {
      status: PurchaseOrderStatus.Approved,
      note: 'Updated note',
    } as any;

    it('[NORMAL] should update purchase order successfully', async () => {
      const updatedPO = { 
        ...mockPO, 
        status: PurchaseOrderStatus.Approved, 
        note: 'Updated note' 
      };
      mockService.updateOne.mockResolvedValue(updatedPO);

      const result = await controller.update('po-id-1', updateDto);

      expect(service.updateOne).toHaveBeenCalledWith('po-id-1', updateDto);
      expect(service.updateOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: `Updated purchase order ${updatedPO.code} successfully`,
        data: updatedPO,
      });
    });

    it('[NORMAL] should update status to valid enum values', async () => {
      const validStatuses = [
        PurchaseOrderStatus.PendingApproval,
        PurchaseOrderStatus.Approved,
        PurchaseOrderStatus.Scheduled,
        PurchaseOrderStatus.InProduction,
        PurchaseOrderStatus.Completed,
        PurchaseOrderStatus.Finished,
        PurchaseOrderStatus.Closed,
      ];

      for (const status of validStatuses) {
        const statusDto = { status } as any;
        const updatedPO = { ...mockPO, status };
        mockService.updateOne.mockResolvedValue(updatedPO);

        const result = await controller.update('po-id-1', statusDto);

        expect((result.data as any).status).toBe(status);
      }
    });

    it('[NORMAL] should update multiple fields', async () => {
      const multiFieldDto = {
        status: PurchaseOrderStatus.InProduction,
        note: 'New note',
        deliveryAddress: 'New address',
      } as any;
      const updatedPO = { ...mockPO, ...multiFieldDto };
      mockService.updateOne.mockResolvedValue(updatedPO);

      const result = await controller.update('po-id-1', multiFieldDto);

      expect(service.updateOne).toHaveBeenCalledWith('po-id-1', multiFieldDto);
      expect(result.success).toBe(true);
    });

    it('[ABNORMAL] should throw NotFoundException if PO not found', async () => {
      mockService.updateOne.mockRejectedValue(
        new NotFoundException('Purchase Order not found')
      );

      await expect(controller.update('po-id-1', updateDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('[ABNORMAL] should handle validation errors for invalid enum status', async () => {
      const invalidStatusDto = { status: 'INVALID_STATUS' } as any;
      mockService.updateOne.mockRejectedValue(
        new BadRequestException('Invalid status enum value')
      );

      await expect(controller.update('po-id-1', invalidStatusDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle empty update dto', async () => {
      const emptyDto = {} as any;
      mockService.updateOne.mockRejectedValue(
        new BadRequestException('No fields to update')
      );

      await expect(controller.update('po-id-1', emptyDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ==================================================================================
  // DELETE /delete-soft/:id - Soft delete purchase order
  // ==================================================================================
  describe('softDelete', () => {
    it('[NORMAL] should soft delete successfully', async () => {
      mockService.softDelete.mockResolvedValue(undefined);

      const result = await controller.softDelete('po-id-1');

      expect(service.softDelete).toHaveBeenCalledWith('po-id-1');
      expect(service.softDelete).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Soft deleted successfully',
        data: null,
      });
    });

    it('[ABNORMAL] should throw NotFoundException when PO not found', async () => {
      mockService.softDelete.mockRejectedValue(
        new NotFoundException('Purchase Order not found')
      );

      await expect(controller.softDelete('non-existent')).rejects.toThrow(
        NotFoundException
      );
    });

    it('[ABNORMAL] should propagate error if deletion fails', async () => {
      mockService.softDelete.mockRejectedValue(new Error('Deletion failed'));

      await expect(controller.softDelete('po-id-1')).rejects.toThrow(
        'Deletion failed'
      );
    });

    it('[ABNORMAL] should handle soft-delete constraint (already deleted)', async () => {
      mockService.softDelete.mockRejectedValue(
        new BadRequestException('Purchase Order is already deleted')
      );

      await expect(controller.softDelete('po-id-1')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ==================================================================================
  // GET /deleted - Find deleted purchase orders
  // ==================================================================================
  describe('findDeleted', () => {
    it('[NORMAL] should return only soft-deleted items with explicit pagination', async () => {
      const paginationDto: PaginationQueryDto = { page: 2, limit: 50 };
      const deletedPO = { ...mockPO, isDeleted: true }; // soft-delete plugin sets isDeleted
      const mockResult = { 
        data: [deletedPO], 
        total: 1,
        page: 2,
        limit: 50,
        totalPage: 1,
      };
      mockService.findDeleted.mockResolvedValue(mockResult);

      const result = await controller.findDeleted(paginationDto);

      expect(service.findDeleted).toHaveBeenCalledWith(2, 50);
      expect(service.findDeleted).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
      expect((result as any).data[0].isDeleted).toBe(true);
    });

    it('[BOUNDARY] should use default pagination when not provided', async () => {
      const paginationDto: PaginationQueryDto = {};
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPage: 0,
      };
      mockService.findDeleted.mockResolvedValue(mockResult);

      await controller.findDeleted(paginationDto);

      expect(service.findDeleted).toHaveBeenCalledWith(1, 20);
    });

    it('[BOUNDARY] should handle page 1 explicitly', async () => {
      const paginationDto: PaginationQueryDto = { page: 1, limit: 10 };
      const mockResult = { data: [mockPO], total: 1 };
      mockService.findDeleted.mockResolvedValue(mockResult);

      await controller.findDeleted(paginationDto);

      expect(service.findDeleted).toHaveBeenCalledWith(1, 10);
    });

    it('[NORMAL] should return empty when no deleted items', async () => {
      const paginationDto: PaginationQueryDto = { page: 1, limit: 20 };
      const emptyResult = { data: [], total: 0 };
      mockService.findDeleted.mockResolvedValue(emptyResult);

      const result = await controller.findDeleted(paginationDto);

      expect((result as any).data).toHaveLength(0);
    });

    it('[ABNORMAL] should handle service errors', async () => {
      const paginationDto: PaginationQueryDto = { page: 1, limit: 20 };
      mockService.findDeleted.mockRejectedValue(new Error('Database error'));

      await expect(controller.findDeleted(paginationDto)).rejects.toThrow(
        'Database error'
      );
    });
  });

  // ==================================================================================
  // PATCH /restore/:id - Restore purchase order
  // ==================================================================================
  describe('restore', () => {
    it('[NORMAL] should restore successfully', async () => {
      mockService.restore.mockResolvedValue(undefined);

      const result = await controller.restore('po-id-1');

      expect(service.restore).toHaveBeenCalledWith('po-id-1');
      expect(service.restore).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Restored successfully',
        data: null,
      });
    });

    it('[ABNORMAL] should throw NotFoundException if PO not found in deleted items', async () => {
      mockService.restore.mockRejectedValue(
        new NotFoundException('Document not found')
      );

      await expect(controller.restore('po-id-1')).rejects.toThrow(
        NotFoundException
      );
    });

    it('[ABNORMAL] should handle item not in soft-deleted state', async () => {
      mockService.restore.mockRejectedValue(
        new BadRequestException('Purchase Order is not deleted (isDeleted: false)')
      );

      await expect(controller.restore('po-id-1')).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should propagate service errors', async () => {
      mockService.restore.mockRejectedValue(new Error('Restore failed'));

      await expect(controller.restore('po-id-1')).rejects.toThrow(
        'Restore failed'
      );
    });
  });

  // ==================================================================================
  // DELETE /delete-hard/:id - Hard delete purchase order
  // ==================================================================================
  describe('hardDelete', () => {
    it('[NORMAL] should hard delete successfully', async () => {
      mockService.removeHard.mockResolvedValue(undefined);

      const result = await controller.hardDelete('po-id-1');

      expect(service.removeHard).toHaveBeenCalledWith('po-id-1');
      expect(service.removeHard).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Permanently deleted successfully',
        data: null,
      });
    });

    it('[ABNORMAL] should throw NotFoundException when not found', async () => {
      mockService.removeHard.mockRejectedValue(
        new NotFoundException('Purchase Order not found')
      );

      await expect(controller.hardDelete('non-existent')).rejects.toThrow(
        NotFoundException
      );
    });

    it('[ABNORMAL] should handle deletion errors', async () => {
      mockService.removeHard.mockRejectedValue(
        new Error('Cannot delete: has dependencies')
      );

      await expect(controller.hardDelete('po-id-1')).rejects.toThrow(
        'Cannot delete: has dependencies'
      );
    });

    it('[ABNORMAL] should handle database constraints', async () => {
      mockService.removeHard.mockRejectedValue(
        new BadRequestException('Foreign key constraint')
      );

      await expect(controller.hardDelete('po-id-1')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ==================================================================================
  // GET /detailwithsub/:id - Get purchase order with sub-POs and items
  // ==================================================================================
  describe('detailWithSubs', () => {
    it('[NORMAL] should return purchase order with sub-orders', async () => {
      const mockDetailWithSubs = {
        ...mockPO,
        subPurchaseOrders: [
          { 
            _id: 'sub-1', 
            code: 'SPO-001',
            purchaseOrderItems: []
          }
        ],
      };
      mockService.getDetailWithSubs.mockResolvedValue(mockDetailWithSubs);

      const result = await controller.detailWithSubs('po-id-1');

      expect(service.getDetailWithSubs).toHaveBeenCalledWith('po-id-1');
      expect(service.getDetailWithSubs).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockDetailWithSubs,
      });
    });

    it('[NORMAL] should return populated sub-orders and items', async () => {
      const mockDetailWithSubs = {
        ...mockPO,
        subPurchaseOrders: [
          {
            _id: 'sub-1',
            code: 'SPO-001',
            purchaseOrderItems: [
              { _id: 'item-1', code: 'ITEM-001', quantity: 10 }
            ],
          }
        ],
      };
      mockService.getDetailWithSubs.mockResolvedValue(mockDetailWithSubs);

      const result = await controller.detailWithSubs('po-id-1');

      expect((result.data as any).subPurchaseOrders).toHaveLength(1);
      expect((result.data as any).subPurchaseOrders[0].purchaseOrderItems).toHaveLength(1);
    });

    it('[NORMAL] should handle PO without sub-orders', async () => {
      const mockDetailNoSubs = {
        ...mockPO,
        subPurchaseOrders: [],
      };
      mockService.getDetailWithSubs.mockResolvedValue(mockDetailNoSubs);

      const result = await controller.detailWithSubs('po-id-1');

      expect((result.data as any).subPurchaseOrders).toHaveLength(0);
    });

    it('[ABNORMAL] should throw NotFoundException when PO not found', async () => {
      mockService.getDetailWithSubs.mockRejectedValue(
        new NotFoundException('Not found')
      );

      await expect(controller.detailWithSubs('invalid-id')).rejects.toThrow(
        NotFoundException
      );
    });

    it('[ABNORMAL] should handle aggregation errors', async () => {
      mockService.getDetailWithSubs.mockRejectedValue(
        new Error('Aggregation pipeline failed')
      );

      await expect(controller.detailWithSubs('po-id-1')).rejects.toThrow(
        'Aggregation pipeline failed'
      );
    });

    it('[ABNORMAL] should handle invalid ObjectId', async () => {
      mockService.getDetailWithSubs.mockRejectedValue(
        new BadRequestException('Invalid ID format')
      );

      await expect(controller.detailWithSubs('invalid')).rejects.toThrow(
        BadRequestException
      );
    });
  });
});