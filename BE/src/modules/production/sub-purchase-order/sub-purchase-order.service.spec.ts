import { Test, TestingModule } from "@nestjs/testing";
import { SubPurchaseOrderService } from "./sub-purchase-order.service";
import { getModelToken } from "@nestjs/mongoose";
import {
  SubPurchaseOrder,
  SubPurchaseOrderStatus,
} from "../schemas/sub-purchase-order.schema";
import { PurchaseOrderItem } from "../schemas/purchase-order-item.schema";
import { Product } from "../schemas/product.schema";
import { NotFoundException } from "@nestjs/common";
import { CreateSubFromProductsDto } from "./dto/create-sub-from-products.dto";
import { CreateSubPurchaseOrderDto } from "./dto/create-sub-purchase-order.dto";
import { UpdateSubPurchaseOrderDto } from "./dto/update-sub-purchase-order.dto";

//src/modules/production/sub-purchase-order/sub-purchase-order.service.spec.ts

describe("SubPurchaseOrderService", () => {
  let service: SubPurchaseOrderService;
  let subPoModel: any;
  let poItemModel: any;
  let productModel: any;

  // Mock data
  const mockSubPoId = "sub-po-id-123";
  const mockSubPoDoc: any = {
    _id: mockSubPoId,
    code: "SUB-001",
    purchaseOrder: "po-id-1",
    product: "product-id-1",
    deliveryDate: new Date("2025-01-15"),
    status: SubPurchaseOrderStatus.PendingApproval,
    note: "Test note",
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProductDoc: any = {
    _id: "product-id-1",
    code: "PROD-001",
    name: "Product Name",
    wares: ["ware-id-1", "ware-id-2", "ware-id-3"],
  };

  const mockPoItemDoc: any = {
    _id: "po-item-id-1",
    code: "ITEM-001",
    subPurchaseOrder: mockSubPoId,
    ware: "ware-id-1",
    amount: 0,
    status: "PENDINGAPPROVAL",
  };

  // Khai báo biến mock chain
  let mockQueryChain: any;
  let mockSubPoModel: any;
  let mockPoItemModel: any;
  let mockProductModel: any;

  beforeEach(async () => {
    // === FIX 1: Reset hoàn toàn mockQueryChain trước mỗi test case ===
    // Điều này ngăn chặn lỗi "Database connection failed" lây lan từ test này sang test khác
    mockQueryChain = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
      lean: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
    };

    // Khởi tạo lại các mock model để sử dụng mockQueryChain mới
    mockSubPoModel = {
      find: jest.fn(() => mockQueryChain),
      findById: jest.fn(() => mockQueryChain),
      findByIdAndUpdate: jest.fn(() => mockQueryChain),
      findOne: jest.fn(() => mockQueryChain),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockPoItemModel = {
      create: jest.fn(),
      insertMany: jest.fn(),
      find: jest.fn(() => mockQueryChain),
    };

    mockProductModel = {
      findById: jest.fn(() => mockQueryChain),
      find: jest.fn(() => mockQueryChain),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubPurchaseOrderService,
        {
          provide: getModelToken(SubPurchaseOrder.name),
          useValue: mockSubPoModel,
        },
        {
          provide: getModelToken(PurchaseOrderItem.name),
          useValue: mockPoItemModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<SubPurchaseOrderService>(SubPurchaseOrderService);
    subPoModel = module.get(getModelToken(SubPurchaseOrder.name));
    poItemModel = module.get(getModelToken(PurchaseOrderItem.name));
    productModel = module.get(getModelToken(Product.name));

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(subPoModel).toBeDefined();
    expect(poItemModel).toBeDefined();
    expect(productModel).toBeDefined();
  });

  // ==================================================================================
  // findAll - List sub purchase orders with optional filter
  // ==================================================================================
  describe("findAll", () => {
    it("[NORMAL] should find all sub-purchase-orders with purchaseOrderId filter", async () => {
      const mockDocs = [mockSubPoDoc, { ...mockSubPoDoc, _id: "sub-po-2" }];
      mockQueryChain.exec.mockResolvedValue(mockDocs);

      const result = await service.findAll({ purchaseOrderId: "po-id-1" });

      expect(subPoModel.find).toHaveBeenCalledWith({
        isDeleted: false,
        purchaseOrder: "po-id-1",
      });
      expect(mockQueryChain.populate).toHaveBeenCalledWith("product");
      expect(mockQueryChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockQueryChain.exec).toHaveBeenCalled();
      expect(result).toEqual(mockDocs);
      expect(result).toHaveLength(2);
    });

    it("[NORMAL] should find all without filter", async () => {
      const mockDocs = [mockSubPoDoc];
      mockQueryChain.exec.mockResolvedValue(mockDocs);

      const result = await service.findAll();

      expect(subPoModel.find).toHaveBeenCalledWith({ isDeleted: false });
      expect(mockQueryChain.populate).toHaveBeenCalledWith("product");
      expect(mockQueryChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual(mockDocs);
    });

    it("[NORMAL] should find with undefined purchaseOrderId", async () => {
      mockQueryChain.exec.mockResolvedValue([mockSubPoDoc]);

      await service.findAll({ purchaseOrderId: undefined });

      expect(subPoModel.find).toHaveBeenCalledWith({ isDeleted: false });
    });

    it("[BOUNDARY] should return empty array when no documents found", async () => {
      mockQueryChain.exec.mockResolvedValue([]);

      const result = await service.findAll({ purchaseOrderId: "non-existent" });

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("[ABNORMAL] should propagate database errors", async () => {
      mockQueryChain.exec.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(service.findAll()).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("[NORMAL] should filter out soft-deleted documents", async () => {
      mockQueryChain.exec.mockResolvedValue([]);
      
      await service.findAll();

      expect(subPoModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ isDeleted: false }),
      );
    });

    it("[NORMAL] should sort by createdAt descending", async () => {
      mockQueryChain.exec.mockResolvedValue([mockSubPoDoc]);

      await service.findAll();

      expect(mockQueryChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });

  // ==================================================================================
  // findOneById - Get single sub purchase order by id
  // ==================================================================================
  describe("findOneById", () => {
    it("[NORMAL] should return populated sub-purchase-order by id", async () => {
      mockQueryChain.exec.mockResolvedValue(mockSubPoDoc);

      const result = await service.findOneById(mockSubPoId);

      expect(subPoModel.findById).toHaveBeenCalledWith(mockSubPoId);
      expect(mockQueryChain.populate).toHaveBeenCalledWith("product");
      expect(mockQueryChain.exec).toHaveBeenCalled();
      expect(result).toEqual(mockSubPoDoc);
    });

    it("[NORMAL] should populate product field", async () => {
      const populatedDoc = {
        ...mockSubPoDoc,
        product: {
          _id: "product-id-1",
          name: "Product Name",
          code: "PROD-001",
        },
      };
      mockQueryChain.exec.mockResolvedValue(populatedDoc);

      const result = await service.findOneById(mockSubPoId);

      expect(mockQueryChain.populate).toHaveBeenCalledWith("product");
      expect(result.product).toBeDefined();
    });

    it("[ABNORMAL] should throw NotFoundException when document not found", async () => {
      mockQueryChain.exec.mockResolvedValue(null);

      await expect(service.findOneById("non-existent-id")).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOneById("non-existent-id")).rejects.toThrow(
        "SubPurchaseOrder not found",
      );
    });

    it("[ABNORMAL] should throw NotFoundException for invalid id format", async () => {
      mockQueryChain.exec.mockResolvedValue(null);

      await expect(service.findOneById("invalid-format")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("[BOUNDARY] should handle empty string id", async () => {
      mockQueryChain.exec.mockResolvedValue(null);

      await expect(service.findOneById("")).rejects.toThrow(NotFoundException);
    });

    it("[ABNORMAL] should propagate database errors", async () => {
      mockQueryChain.exec.mockRejectedValue(new Error("Database error"));

      await expect(service.findOneById(mockSubPoId)).rejects.toThrow(
        "Database error",
      );
    });
  });

  // ==================================================================================
  // createFromProducts - Create sub-POs and PO items from products
  // ==================================================================================
  describe("createFromProducts", () => {
    const validDto: CreateSubFromProductsDto = {
      purchaseOrderId: "po-id-1",
      products: [
        {
          productId: "product-id-1",
          deliveryDate: "2025-01-15",
          status: SubPurchaseOrderStatus.PendingApproval as any,
        },
      ],
    };

    it("[NORMAL] should create sub-PO and PO items for each ware", async () => {
      mockQueryChain.exec.mockResolvedValueOnce(mockProductDoc);
      mockSubPoModel.create.mockResolvedValue(mockSubPoDoc);
      mockPoItemModel.create.mockResolvedValue(mockPoItemDoc);
      mockQueryChain.exec.mockResolvedValueOnce(mockSubPoDoc);

      const result = await service.createFromProducts(validDto);

      expect(productModel.findById).toHaveBeenCalledWith("product-id-1");
      expect(subPoModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          purchaseOrder: "po-id-1",
          product: "product-id-1",
          status: SubPurchaseOrderStatus.PendingApproval,
        }),
      );
      expect(poItemModel.create).toHaveBeenCalledTimes(3);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].items).toHaveLength(3);
    });

    it("[NORMAL] should create multiple sub-POs for multiple products", async () => {
      const multiProductDto: CreateSubFromProductsDto = {
        purchaseOrderId: "po-id-1",
        products: [
          {
            productId: "product-id-1",
            deliveryDate: "2025-01-15",
            status: SubPurchaseOrderStatus.PendingApproval as any,
          },
          {
            productId: "product-id-2",
            deliveryDate: "2025-01-20",
            status: SubPurchaseOrderStatus.Approved as any,
          },
        ],
      };

      mockQueryChain.exec.mockResolvedValueOnce(mockProductDoc);
      mockQueryChain.exec.mockResolvedValueOnce({
        ...mockProductDoc,
        _id: "product-id-2",
      });
      mockSubPoModel.create.mockResolvedValueOnce(mockSubPoDoc);
      mockSubPoModel.create.mockResolvedValueOnce({
        ...mockSubPoDoc,
        _id: "sub-po-2",
      });
      mockPoItemModel.create.mockResolvedValue(mockPoItemDoc);
      mockQueryChain.exec.mockResolvedValueOnce(mockSubPoDoc);
      mockQueryChain.exec.mockResolvedValueOnce({
        ...mockSubPoDoc,
        _id: "sub-po-2",
      });

      const result = await service.createFromProducts(multiProductDto);

      expect(productModel.findById).toHaveBeenCalledTimes(2);
      expect(subPoModel.create).toHaveBeenCalledTimes(2);
      expect(result.data).toHaveLength(2);
    });

    it("[NORMAL] should set correct status for each sub-PO", async () => {
      const approvedDto: CreateSubFromProductsDto = {
        purchaseOrderId: "po-id-1",
        products: [
          {
            productId: "product-id-1",
            deliveryDate: "2025-01-15",
            status: SubPurchaseOrderStatus.Approved as any,
          },
        ],
      };

      mockQueryChain.exec.mockResolvedValueOnce(mockProductDoc);
      mockSubPoModel.create.mockResolvedValue({
        ...mockSubPoDoc,
        status: SubPurchaseOrderStatus.Approved,
      });
      mockPoItemModel.create.mockResolvedValue(mockPoItemDoc);
      mockQueryChain.exec.mockResolvedValueOnce(mockSubPoDoc);

      await service.createFromProducts(approvedDto);

      expect(subPoModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: SubPurchaseOrderStatus.Approved,
        }),
      );
    });

    it("[NORMAL] should create PO items with amount 0", async () => {
      mockQueryChain.exec.mockResolvedValueOnce(mockProductDoc);
      mockSubPoModel.create.mockResolvedValue(mockSubPoDoc);
      mockPoItemModel.create.mockResolvedValue(mockPoItemDoc);
      mockQueryChain.exec.mockResolvedValueOnce(mockSubPoDoc);

      await service.createFromProducts(validDto);

      expect(poItemModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 0,
        }),
      );
    });

    it("[BOUNDARY] should handle product with no wares", async () => {
      const productNoWares = { ...mockProductDoc, wares: [] };
      mockQueryChain.exec.mockResolvedValueOnce(productNoWares);
      mockSubPoModel.create.mockResolvedValue(mockSubPoDoc);
      mockQueryChain.exec.mockResolvedValueOnce(mockSubPoDoc);

      const result = await service.createFromProducts(validDto);

      expect(poItemModel.create).not.toHaveBeenCalled();
      expect(result.data[0].items).toHaveLength(0);
    });

    it("[BOUNDARY] should handle empty products array", async () => {
      const emptyDto: CreateSubFromProductsDto = {
        purchaseOrderId: "po-id-1",
        products: [],
      };

      const result = await service.createFromProducts(emptyDto);

      expect(productModel.findById).not.toHaveBeenCalled();
      expect(subPoModel.create).not.toHaveBeenCalled();
      expect(result.data).toHaveLength(0);
    });

    it("[ABNORMAL] should throw NotFoundException when product not found", async () => {
      mockQueryChain.exec.mockResolvedValueOnce(null);

      await expect(service.createFromProducts(validDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.createFromProducts(validDto)).rejects.toThrow(
        "Product not found",
      );
    });

    it("[ABNORMAL] should throw error when purchaseOrderId is invalid", async () => {
      const invalidDto: CreateSubFromProductsDto = {
        purchaseOrderId: "invalid-po-id",
        products: validDto.products,
      };

      mockQueryChain.exec.mockResolvedValueOnce(mockProductDoc);
      mockSubPoModel.create.mockRejectedValue(
        new Error("Invalid purchaseOrder reference"),
      );

      await expect(service.createFromProducts(invalidDto)).rejects.toThrow(
        "Invalid purchaseOrder reference",
      );
    });

    it("[ABNORMAL] should handle sub-PO creation failure", async () => {
      mockQueryChain.exec.mockResolvedValueOnce(mockProductDoc);
      mockSubPoModel.create.mockRejectedValue(new Error("Duplicate code"));

      await expect(service.createFromProducts(validDto)).rejects.toThrow(
        "Duplicate code",
      );
    });

    it("[ABNORMAL] should handle PO item creation failure", async () => {
      mockQueryChain.exec.mockResolvedValueOnce(mockProductDoc);
      mockSubPoModel.create.mockResolvedValue(mockSubPoDoc);
      mockPoItemModel.create.mockRejectedValue(
        new Error("Item creation failed"),
      );

      await expect(service.createFromProducts(validDto)).rejects.toThrow(
        "Item creation failed",
      );
    });

    it("[ABNORMAL] should propagate database errors", async () => {
      mockQueryChain.exec.mockRejectedValue(
        new Error("Database connection lost"),
      );

      await expect(service.createFromProducts(validDto)).rejects.toThrow(
        "Database connection lost",
      );
    });
  });

  // ==================================================================================
  // create - Create a single sub purchase order
  // ==================================================================================
  describe("create", () => {
    const createDto: CreateSubPurchaseOrderDto = {
      code: "SUB-002",
      purchaseOrder: "po-id-1" as any,
      product: "product-id-1" as any,
      deliveryDate: "2025-01-15",
      status: SubPurchaseOrderStatus.PendingApproval as any,
      note: "New sub PO",
    };

    it("[NORMAL] should create and return populated sub-purchase-order", async () => {
      mockSubPoModel.create.mockResolvedValue({ _id: mockSubPoId });
      mockQueryChain.exec.mockResolvedValue(mockSubPoDoc);

      const result = await service.create(createDto);

      expect(subPoModel.create).toHaveBeenCalledWith(createDto);
      expect(subPoModel.findById).toHaveBeenCalledWith(mockSubPoId);
      expect(mockQueryChain.populate).toHaveBeenCalledWith("product");
      expect(result).toEqual(mockSubPoDoc);
    });

    it("[NORMAL] should create with minimal required fields", async () => {
      const minimalDto: CreateSubPurchaseOrderDto = {
        code: "SUB-003",
        purchaseOrder: "po-id-1" as any,
        product: "product-id-1" as any,
        deliveryDate: "2025-01-15",
        status: SubPurchaseOrderStatus.PendingApproval as any,
      };

      mockSubPoModel.create.mockResolvedValue({ _id: mockSubPoId });
      mockQueryChain.exec.mockResolvedValue(mockSubPoDoc);

      const result = await service.create(minimalDto);

      expect(subPoModel.create).toHaveBeenCalledWith(minimalDto);
      expect(result).toEqual(mockSubPoDoc);
    });

    it("[ABNORMAL] should throw error on duplicate code", async () => {
      mockSubPoModel.create.mockRejectedValue(
        new Error("E11000 duplicate key error"),
      );

      await expect(service.create(createDto)).rejects.toThrow(
        "E11000 duplicate key error",
      );
    });

    it("[ABNORMAL] should throw error when purchaseOrder not found", async () => {
      mockSubPoModel.create.mockRejectedValue(
        new Error("Invalid purchaseOrder reference"),
      );

      await expect(service.create(createDto)).rejects.toThrow(
        "Invalid purchaseOrder reference",
      );
    });

    it("[ABNORMAL] should throw error when product not found", async () => {
      mockSubPoModel.create.mockRejectedValue(
        new Error("Invalid product reference"),
      );

      await expect(service.create(createDto)).rejects.toThrow(
        "Invalid product reference",
      );
    });

    it("[ABNORMAL] should throw NotFoundException if populate fails", async () => {
      mockSubPoModel.create.mockResolvedValue({ _id: mockSubPoId });
      mockQueryChain.exec.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("[ABNORMAL] should handle database errors", async () => {
      mockSubPoModel.create.mockRejectedValue(
        new Error("Database write failed"),
      );

      await expect(service.create(createDto)).rejects.toThrow(
        "Database write failed",
      );
    });
  });

  // ==================================================================================
  // update - Update sub purchase order
  // ==================================================================================
  describe("update", () => {
    const updateDto: UpdateSubPurchaseOrderDto = {
      status: SubPurchaseOrderStatus.Approved as any,
      note: "Updated note",
      deliveryDate: "2025-02-01",
    };

    it("[NORMAL] should update and return populated document", async () => {
      const updatedDoc = { ...mockSubPoDoc, ...updateDto };
      mockQueryChain.exec.mockResolvedValue(updatedDoc);

      const result = await service.update(mockSubPoId, updateDto);

      expect(subPoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockSubPoId,
        updateDto,
        { new: true },
      );
      expect(mockQueryChain.populate).toHaveBeenCalledWith("product");
      expect(mockQueryChain.exec).toHaveBeenCalled();
      expect(result).toEqual(updatedDoc);
    });

    it("[NORMAL] should update only status field", async () => {
      const statusOnlyDto: UpdateSubPurchaseOrderDto = {
        status: SubPurchaseOrderStatus.InProduction as any,
      };
      const updatedDoc = {
        ...mockSubPoDoc,
        status: SubPurchaseOrderStatus.InProduction,
      };
      mockQueryChain.exec.mockResolvedValue(updatedDoc);

      const result = await service.update(mockSubPoId, statusOnlyDto);

      expect(subPoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockSubPoId,
        statusOnlyDto,
        { new: true },
      );
      expect(result.status).toBe(SubPurchaseOrderStatus.InProduction);
    });

    it("[NORMAL] should update only note field", async () => {
      const noteOnlyDto: UpdateSubPurchaseOrderDto = {
        note: "New note",
      };
      mockQueryChain.exec.mockResolvedValue({
        ...mockSubPoDoc,
        note: "New note",
      });

      const result = await service.update(mockSubPoId, noteOnlyDto);

      expect(result.note).toBe("New note");
    });

    it("[NORMAL] should update deliveryDate", async () => {
      const newDate = "2025-03-01";
      const dateDto: UpdateSubPurchaseOrderDto = {
        deliveryDate: newDate,
      };
      mockQueryChain.exec.mockResolvedValue({
        ...mockSubPoDoc,
        deliveryDate: new Date(newDate),
      });

      const result = await service.update(mockSubPoId, dateDto);

      expect(subPoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockSubPoId,
        dateDto,
        { new: true },
      );
    });

    it("[BOUNDARY] should handle empty update dto", async () => {
      const emptyDto: UpdateSubPurchaseOrderDto = {};
      mockQueryChain.exec.mockResolvedValue(mockSubPoDoc);

      const result = await service.update(mockSubPoId, emptyDto);

      expect(subPoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockSubPoId,
        emptyDto,
        { new: true },
      );
      expect(result).toEqual(mockSubPoDoc);
    });

    it("[ABNORMAL] should throw NotFoundException when document not found", async () => {
      mockQueryChain.exec.mockResolvedValue(null);

      await expect(
        service.update("non-existent-id", updateDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update("non-existent-id", updateDto),
      ).rejects.toThrow("SubPurchaseOrder not found");
    });

    it("[ABNORMAL] should throw error on invalid status value", async () => {
      const invalidDto: UpdateSubPurchaseOrderDto = {
        status: "INVALID_STATUS" as any,
      };
      mockQueryChain.exec.mockRejectedValue(new Error("Invalid enum value"));

      await expect(service.update(mockSubPoId, invalidDto)).rejects.toThrow(
        "Invalid enum value",
      );
    });

    it("[ABNORMAL] should propagate database errors", async () => {
      mockQueryChain.exec.mockRejectedValue(
        new Error("Database update failed"),
      );

      await expect(service.update(mockSubPoId, updateDto)).rejects.toThrow(
        "Database update failed",
      );
    });

    it("[ABNORMAL] should handle concurrent update conflicts", async () => {
      mockQueryChain.exec.mockRejectedValue(new Error("Version conflict"));

      await expect(service.update(mockSubPoId, updateDto)).rejects.toThrow(
        "Version conflict",
      );
    });

    it("[NORMAL] should return document with new: true option", async () => {
      mockQueryChain.exec.mockResolvedValue(mockSubPoDoc);

      await service.update(mockSubPoId, updateDto);

      expect(subPoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockSubPoId,
        updateDto,
        { new: true },
      );
    });
  });

  // ==================================================================================
  // softRemove - Soft delete sub purchase order
  // ==================================================================================
  describe("softRemove", () => {
    it("[NORMAL] should set isDeleted to true", async () => {
      mockQueryChain.exec.mockResolvedValue({
        ...mockSubPoDoc,
        isDeleted: true,
      });

      await service.softRemove(mockSubPoId);

      expect(subPoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockSubPoId,
        { isDeleted: true },
        { new: true },
      );
      expect(mockQueryChain.exec).toHaveBeenCalled();
    });

    it("[NORMAL] should complete successfully", async () => {
      const deletedDoc = { ...mockSubPoDoc, isDeleted: true };
      mockQueryChain.exec.mockResolvedValue(deletedDoc);

      await expect(service.softRemove(mockSubPoId)).resolves.not.toThrow();
    });

    it("[ABNORMAL] should throw NotFoundException when document not found", async () => {
      mockQueryChain.exec.mockResolvedValue(null);

      await expect(service.softRemove("non-existent-id")).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.softRemove("non-existent-id")).rejects.toThrow(
        "SubPurchaseOrder not found",
      );
    });

    it("[ABNORMAL] should throw error when document already deleted", async () => {
      mockQueryChain.exec.mockResolvedValue(null);

      await expect(service.softRemove("already-deleted-id")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("[ABNORMAL] should propagate database errors", async () => {
      mockQueryChain.exec.mockRejectedValue(
        new Error("Database delete failed"),
      );

      await expect(service.softRemove(mockSubPoId)).rejects.toThrow(
        "Database delete failed",
      );
    });

    it("[BOUNDARY] should handle invalid id format", async () => {
      mockQueryChain.exec.mockResolvedValue(null);

      await expect(service.softRemove("invalid-id")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("[BOUNDARY] should handle empty string id", async () => {
      mockQueryChain.exec.mockResolvedValue(null);

      await expect(service.softRemove("")).rejects.toThrow(NotFoundException);
    });

    it("[NORMAL] should not physically delete the document", async () => {
      mockQueryChain.exec.mockResolvedValue({
        ...mockSubPoDoc,
        isDeleted: true,
      });

      await service.softRemove(mockSubPoId);

      expect(subPoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockSubPoId,
        { isDeleted: true },
        { new: true },
      );
    });
  });
});