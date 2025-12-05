import { Test, TestingModule } from "@nestjs/testing";
import { SubPurchaseOrderController } from "./sub-purchase-order.controller";
import { SubPurchaseOrderService } from "./sub-purchase-order.service";
import { CreateSubFromProductsDto } from "./dto/create-sub-from-products.dto";
import { UpdateSubPurchaseOrderDto } from "./dto/update-sub-purchase-order.dto";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { SubPurchaseOrderStatus } from "../schemas/sub-purchase-order.schema";

//src/modules/production/sub-purchase-order/sub-purchase-order.controller.spec.ts

describe("SubPurchaseOrderController", () => {
  let controller: SubPurchaseOrderController;
  let service: SubPurchaseOrderService;

  // Mock data
  const mockSubPO: any = {
    _id: "sub-po-id-1",
    code: "SPO-001",
    purchaseOrder: "po-id-1",
    product: "product-id-1",
    deliveryDate: new Date("2025-01-15"),
    status: SubPurchaseOrderStatus.PendingApproval,
    note: "Test note",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockService = {
    createFromProducts: jest.fn(),
    findAll: jest.fn(),
    findOneById: jest.fn(),
    update: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubPurchaseOrderController],
      providers: [
        {
          provide: SubPurchaseOrderService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SubPurchaseOrderController>(
      SubPurchaseOrderController,
    );
    service = module.get<SubPurchaseOrderService>(SubPurchaseOrderService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  // ==================================================================================
  // POST /create-from-products - Create sub-purchase-orders from products (bulk)
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
        {
          productId: "product-id-2",
          deliveryDate: "2025-01-20",
          status: SubPurchaseOrderStatus.Approved as any,
        },
      ],
    };

    it("[NORMAL] should create sub-purchase-orders successfully with multiple products", async () => {
      const mockResult = [
        { ...mockSubPO, _id: "sub-po-1", code: "SPO-001" },
        { ...mockSubPO, _id: "sub-po-2", code: "SPO-002" },
      ];
      mockService.createFromProducts.mockResolvedValue(mockResult);

      const result = await controller.createFromProducts(validDto);

      expect(service.createFromProducts).toHaveBeenCalledWith(validDto);
      expect(service.createFromProducts).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
      expect(result).toHaveLength(2);
    });

    it("[NORMAL] should create single sub-purchase-order", async () => {
      const singleProductDto = {
        ...validDto,
        products: [validDto.products[0]],
      };
      const mockResult = [mockSubPO];
      mockService.createFromProducts.mockResolvedValue(mockResult);

      const result = await controller.createFromProducts(singleProductDto);

      expect(service.createFromProducts).toHaveBeenCalledWith(singleProductDto);
      expect(result).toEqual(mockResult);
      expect(result).toHaveLength(1);
    });

    it("[BOUNDARY] should handle empty products array", async () => {
      const emptyDto = { ...validDto, products: [] };
      mockService.createFromProducts.mockResolvedValue([]);

      const result = await controller.createFromProducts(emptyDto);

      expect(service.createFromProducts).toHaveBeenCalledWith(emptyDto);
      expect(result).toEqual([]);
    });

    it("[ABNORMAL] should throw error when purchaseOrderId is invalid", async () => {
      mockService.createFromProducts.mockRejectedValue(
        new NotFoundException("Purchase order not found"),
      );

      await expect(controller.createFromProducts(validDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.createFromProducts).toHaveBeenCalledWith(validDto);
    });

    it("[ABNORMAL] should throw error when product does not exist", async () => {
      mockService.createFromProducts.mockRejectedValue(
        new NotFoundException("Product not found"),
      );

      await expect(controller.createFromProducts(validDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("[ABNORMAL] should throw error when service fails", async () => {
      mockService.createFromProducts.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(controller.createFromProducts(validDto)).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("[ABNORMAL] should propagate validation errors", async () => {
      mockService.createFromProducts.mockRejectedValue(
        new BadRequestException("Invalid delivery date format"),
      );

      await expect(controller.createFromProducts(validDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ==================================================================================
  // GET / - List sub purchase orders with optional purchaseOrderId filter
  // ==================================================================================
  describe("findAll", () => {
    it("[NORMAL] should return all sub-purchase-orders with purchaseOrderId filter", async () => {
      const mockDocs = [mockSubPO, { ...mockSubPO, _id: "sub-po-2" }];
      mockService.findAll.mockResolvedValue(mockDocs);

      const result = await controller.findAll("po-id-1");

      expect(service.findAll).toHaveBeenCalledWith({
        purchaseOrderId: "po-id-1",
      });
      expect(result).toEqual({
        success: true,
        message: "Fetch successful",
        data: mockDocs,
      });
      expect(result.data).toHaveLength(2);
    });

    it("[NORMAL] should return all sub-purchase-orders without filter", async () => {
      const mockDocs = [mockSubPO, { ...mockSubPO, _id: "sub-po-2" }];
      mockService.findAll.mockResolvedValue(mockDocs);

      const result = await controller.findAll(undefined);

      expect(service.findAll).toHaveBeenCalledWith({
        purchaseOrderId: undefined,
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDocs);
    });

    it("[BOUNDARY] should return empty array when no documents found", async () => {
      mockService.findAll.mockResolvedValue([]);

      const result = await controller.findAll("non-existent-po-id");

      expect(service.findAll).toHaveBeenCalledWith({
        purchaseOrderId: "non-existent-po-id",
      });
      expect(result.data).toEqual([]);
      expect(result.data).toHaveLength(0);
    });

    it("[NORMAL] should handle query parameter correctly", async () => {
      mockService.findAll.mockResolvedValue([mockSubPO]);

      await controller.findAll("po-id-123");

      expect(service.findAll).toHaveBeenCalledWith({
        purchaseOrderId: "po-id-123",
      });
    });

    it("[ABNORMAL] should propagate service errors", async () => {
      mockService.findAll.mockRejectedValue(new Error("Database query failed"));

      await expect(controller.findAll("po-id-1")).rejects.toThrow(
        "Database query failed",
      );
    });
  });

  // ==================================================================================
  // GET /detail/:id - Get sub purchase order by id with populated fields
  // ==================================================================================
  describe("getDetail", () => {
    it("[NORMAL] should return sub-purchase-order detail by id", async () => {
      mockService.findOneById.mockResolvedValue(mockSubPO);

      const result = await controller.getDetail("sub-po-id-1");

      expect(service.findOneById).toHaveBeenCalledWith("sub-po-id-1");
      expect(result).toEqual({
        success: true,
        message: "Fetch successful",
        data: mockSubPO,
      });
    });

    it("[NORMAL] should return populated sub-purchase-order", async () => {
      const populatedSubPO: any = {
        ...mockSubPO,
        purchaseOrder: {
          _id: "po-id-1",
          code: "PO-001",
          customer: "customer-id-1",
        },
        product: {
          _id: "product-id-1",
          code: "PROD-001",
          name: "Product Name",
        },
      };
      mockService.findOneById.mockResolvedValue(populatedSubPO);

      const result = await controller.getDetail("sub-po-id-1");

      expect(result.data).toHaveProperty("purchaseOrder");
      expect(result.data).toHaveProperty("product");
      expect((result.data as any).purchaseOrder).toHaveProperty("code");
    });

    it("[ABNORMAL] should throw NotFoundException when document not found", async () => {
      mockService.findOneById.mockResolvedValue(null);

      await expect(controller.getDetail("non-existent-id")).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getDetail("non-existent-id")).rejects.toThrow(
        "SubPurchaseOrder not found",
      );
    });

    it("[ABNORMAL] should throw NotFoundException when id is invalid format", async () => {
      mockService.findOneById.mockResolvedValue(null);

      await expect(controller.getDetail("invalid-id-format")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("[BOUNDARY] should handle empty string id", async () => {
      mockService.findOneById.mockResolvedValue(null);

      await expect(controller.getDetail("")).rejects.toThrow(NotFoundException);
    });

    it("[ABNORMAL] should propagate service errors", async () => {
      mockService.findOneById.mockRejectedValue(
        new Error("Database connection error"),
      );

      await expect(controller.getDetail("sub-po-id-1")).rejects.toThrow(
        "Database connection error",
      );
    });
  });

  // ==================================================================================
  // GET /:id - Get sub-PO detail with items populated (direct service result)
  // ==================================================================================
  describe("findOne", () => {
    it("[NORMAL] should return sub-purchase-order directly from service", async () => {
      mockService.findOneById.mockResolvedValue(mockSubPO);

      const result = await controller.findOne("sub-po-id-1");

      expect(service.findOneById).toHaveBeenCalledWith("sub-po-id-1");
      expect(result).toEqual(mockSubPO);
      expect(result).not.toHaveProperty("success");
    });

    it("[NORMAL] should return null when document not found", async () => {
      mockService.findOneById.mockResolvedValue(null);

      const result = await controller.findOne("non-existent-id");

      expect(result).toBeNull();
    });

    it("[NORMAL] should return populated data", async () => {
      const populatedData: any = {
        ...mockSubPO,
        purchaseOrder: { code: "PO-001" },
        product: { name: "Product 1" },
      };
      mockService.findOneById.mockResolvedValue(populatedData);

      const result = await controller.findOne("sub-po-id-1");

      expect(result).toEqual(populatedData);
      expect((result as any).purchaseOrder).toBeDefined();
      expect((result as any).product).toBeDefined();
    });

    it("[ABNORMAL] should propagate service errors", async () => {
      mockService.findOneById.mockRejectedValue(new Error("Database error"));

      await expect(controller.findOne("sub-po-id-1")).rejects.toThrow(
        "Database error",
      );
    });

    it("[BOUNDARY] should handle various id formats", async () => {
      const testIds = ["123", "abc-def", "507f1f77bcf86cd799439011"];

      for (const id of testIds) {
        mockService.findOneById.mockResolvedValue(mockSubPO);
        await controller.findOne(id);
        expect(service.findOneById).toHaveBeenCalledWith(id);
      }
    });
  });

  // ==================================================================================
  // PATCH /:id - Update sub-purchase-order
  // ==================================================================================
  describe("update", () => {
    const updateDto: UpdateSubPurchaseOrderDto = {
      status: SubPurchaseOrderStatus.Approved as any,
      note: "Updated note",
      deliveryDate: "2025-02-01",
    };

    it("[NORMAL] should update sub-purchase-order successfully", async () => {
      const updatedDoc = { ...mockSubPO, ...updateDto };
      mockService.update.mockResolvedValue(updatedDoc);

      const result = await controller.update("sub-po-id-1", updateDto);

      expect(service.update).toHaveBeenCalledWith("sub-po-id-1", updateDto);
      expect(result).toEqual(updatedDoc);
      expect(result.status).toBe(SubPurchaseOrderStatus.Approved);
      expect(result.note).toBe("Updated note");
    });

    it("[NORMAL] should update only status field", async () => {
      const statusOnlyDto: UpdateSubPurchaseOrderDto = {
        status: SubPurchaseOrderStatus.InProduction as any,
      };
      const updatedDoc = {
        ...mockSubPO,
        status: SubPurchaseOrderStatus.InProduction,
      };
      mockService.update.mockResolvedValue(updatedDoc);

      const result = await controller.update("sub-po-id-1", statusOnlyDto);

      expect(service.update).toHaveBeenCalledWith("sub-po-id-1", statusOnlyDto);
      expect(result.status).toBe(SubPurchaseOrderStatus.InProduction);
    });

    it("[NORMAL] should update only note field", async () => {
      const noteOnlyDto: UpdateSubPurchaseOrderDto = { note: "New note only" };
      const updatedDoc = { ...mockSubPO, note: "New note only" };
      mockService.update.mockResolvedValue(updatedDoc);

      const result = await controller.update("sub-po-id-1", noteOnlyDto);

      expect(result.note).toBe("New note only");
    });

    it("[NORMAL] should update deliveryDate", async () => {
      const newDate = "2025-03-01";
      const dateDto: UpdateSubPurchaseOrderDto = { deliveryDate: newDate };
      const updatedDoc = { ...mockSubPO, deliveryDate: new Date(newDate) };
      mockService.update.mockResolvedValue(updatedDoc);

      const result = await controller.update("sub-po-id-1", dateDto);

      expect(result.deliveryDate).toEqual(updatedDoc.deliveryDate);
    });

    it("[BOUNDARY] should handle empty update dto", async () => {
      const emptyDto: UpdateSubPurchaseOrderDto = {};
      mockService.update.mockResolvedValue(mockSubPO);

      const result = await controller.update("sub-po-id-1", emptyDto);

      expect(service.update).toHaveBeenCalledWith("sub-po-id-1", emptyDto);
      expect(result).toEqual(mockSubPO);
    });

    it("[ABNORMAL] should throw NotFoundException when document not found", async () => {
      mockService.update.mockRejectedValue(
        new NotFoundException("SubPurchaseOrder not found"),
      );

      await expect(
        controller.update("non-existent-id", updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it("[ABNORMAL] should throw error on invalid status", async () => {
      mockService.update.mockRejectedValue(
        new BadRequestException("Invalid status value"),
      );

      await expect(controller.update("sub-po-id-1", updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("[ABNORMAL] should propagate database errors", async () => {
      mockService.update.mockRejectedValue(
        new Error("Update operation failed"),
      );

      await expect(controller.update("sub-po-id-1", updateDto)).rejects.toThrow(
        "Update operation failed",
      );
    });

    it("[ABNORMAL] should handle concurrent update conflicts", async () => {
      mockService.update.mockRejectedValue(new Error("Version conflict"));

      await expect(controller.update("sub-po-id-1", updateDto)).rejects.toThrow(
        "Version conflict",
      );
    });
  });

  // ==================================================================================
  // DELETE /delete-soft/:id - Soft delete sub-purchase-order
  // ==================================================================================
  describe("remove", () => {
    it("[NORMAL] should soft delete sub-purchase-order successfully", async () => {
      const mockResponse = {
        success: true,
        message: "Deleted successfully",
        deletedCount: 1,
      };
      mockService.softRemove.mockResolvedValue(mockResponse);

      const result: any = await controller.remove("sub-po-id-1");

      expect(service.softRemove).toHaveBeenCalledWith("sub-po-id-1");
      expect(service.softRemove).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
    });

    it("[NORMAL] should return success response with deleted document", async () => {
      const mockResponse: any = {
        success: true,
        data: { ...mockSubPO, deletedAt: new Date() },
      };
      mockService.softRemove.mockResolvedValue(mockResponse);

      const result: any = await controller.remove("sub-po-id-1");

      expect(result.data).toHaveProperty("deletedAt");
    });

    it("[ABNORMAL] should throw NotFoundException when document not found", async () => {
      mockService.softRemove.mockRejectedValue(
        new NotFoundException("SubPurchaseOrder not found"),
      );

      await expect(controller.remove("non-existent-id")).rejects.toThrow(
        NotFoundException,
      );
      expect(service.softRemove).toHaveBeenCalledWith("non-existent-id");
    });

    it("[ABNORMAL] should throw error when document already deleted", async () => {
      mockService.softRemove.mockRejectedValue(
        new BadRequestException("Document already deleted"),
      );

      await expect(controller.remove("already-deleted-id")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("[ABNORMAL] should throw error on database failure", async () => {
      mockService.softRemove.mockRejectedValue(
        new Error("Cannot delete: database connection lost"),
      );

      await expect(controller.remove("sub-po-id-1")).rejects.toThrow(
        "Cannot delete: database connection lost",
      );
    });

    it("[ABNORMAL] should handle foreign key constraint errors", async () => {
      mockService.softRemove.mockRejectedValue(
        new BadRequestException(
          "Cannot delete: related purchase order items exist",
        ),
      );

      await expect(controller.remove("sub-po-id-1")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("[BOUNDARY] should handle invalid id format", async () => {
      mockService.softRemove.mockRejectedValue(
        new BadRequestException("Invalid id format"),
      );

      await expect(controller.remove("invalid-id")).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
