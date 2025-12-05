import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { PaperRollTransactionService } from "./paper-roll-transaction.service";
import { PaperRollTransaction } from "../schemas/paper-roll-transaction.schema";
import { CreatePaperRollTransactionDto } from "./dto/create-paper-roll-transaction.dto";
import { UpdatePaperRollTransactionDto } from "./dto/update-paper-roll-transaction.dto";
import { NotFoundException } from "@nestjs/common";
import mongoose, { Model } from "mongoose";

// src/modules/warehouse/paper-roll-transaction/paper-roll-transaction.service.spec.ts

describe("PaperRollTransactionService", () => {
  let service: PaperRollTransactionService;
  let model: Model<PaperRollTransaction>;

  // Mock Data
  const mockPaperRoll: any = {
    _id: new mongoose.Types.ObjectId("690f75f5e7115610c1866f93"),
    paperSupplierId: new mongoose.Types.ObjectId("690f75f5e7115610c1866f90"),
    paperTypeId: new mongoose.Types.ObjectId("690f75f5e7115610c1866f91"),
    sequenceNumber: 1,
    weight: 1200,
    receivingDate: new Date("2025-11-10"),
    note: "Test paper roll",
  };

  const mockEmployee: any = {
    _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
    code: "EMP001",
    name: "John Doe",
    email: "john@example.com",
  };

  const mockTransactionId = new mongoose.Types.ObjectId(
    "507f1f77bcf86cd799439020",
  );

  const mockTransaction: any = {
    _id: mockTransactionId,
    paperRollId: mockPaperRoll._id,
    employeeId: mockEmployee._id,
    transactionType: "NHAP",
    initialWeight: 1200,
    finalWeight: 1000,
    timeStamp: new Date("2025-11-12T08:30:00.000Z"),
    inCharge: "operator-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPopulatedTransaction = {
    ...mockTransaction,
    paperRoll: mockPaperRoll,
    employee: mockEmployee,
  };

  const mockModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    aggregate: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaperRollTransactionService,
        {
          provide: getModelToken(PaperRollTransaction.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<PaperRollTransactionService>(
      PaperRollTransactionService,
    );
    model = module.get<Model<PaperRollTransaction>>(
      getModelToken(PaperRollTransaction.name),
    );

    jest.clearAllMocks();
  });

  describe("Definition", () => {
    it("should be defined", () => {
      expect(service).toBeDefined();
      expect(model).toBeDefined();
    });
  });

  // ==================================================================================
  // findPaginated - Paginated list with filtering
  // ==================================================================================
  describe("findPaginated", () => {
    it("[NORMAL] should return paginated transactions", async () => {
      const mockAggregateResult = [
        {
          data: [mockPopulatedTransaction],
          totalCount: [{ count: 1 }],
        },
      ];

      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregateResult),
      });

      const result = await service.findPaginated(1, 10);

      expect(model.aggregate).toHaveBeenCalled();
      expect(result).toEqual({
        data: [mockPopulatedTransaction],
        page: 1,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });

    it("[NORMAL] should filter by paperRollId", async () => {
      const paperRollId = "690f75f5e7115610c1866f93";
      const mockAggregateResult = [
        {
          data: [mockPopulatedTransaction],
          totalCount: [{ count: 1 }],
        },
      ];

      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregateResult),
      });

      const result = await service.findPaginated(1, 10, undefined, paperRollId);

      expect(model.aggregate).toHaveBeenCalled();
      const pipelineCall = mockModel.aggregate.mock.calls[0][0];
      const matchStage = pipelineCall.find((stage: any) => stage.$match);
      expect(matchStage.$match.paperRollId).toEqual(
        new mongoose.Types.ObjectId(paperRollId),
      );
      expect(result.data).toHaveLength(1);
    });

    it("[NORMAL] should filter by search query", async () => {
      const search = "NHAP";
      const mockAggregateResult = [
        {
          data: [mockPopulatedTransaction],
          totalCount: [{ count: 1 }],
        },
      ];

      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregateResult),
      });

      const result = await service.findPaginated(1, 10, search);

      expect(model.aggregate).toHaveBeenCalled();
      const pipelineCall = mockModel.aggregate.mock.calls[0][0];
      const matchStage = pipelineCall.find((stage: any) => stage.$match);
      expect(matchStage.$match.$or).toBeDefined();
      expect(result.data).toHaveLength(1);
    });

    it("[NORMAL] should use default pagination values", async () => {
      const mockAggregateResult = [
        {
          data: [],
          totalCount: [],
        },
      ];

      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregateResult),
      });

      const result = await service.findPaginated();

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it("[BOUNDARY] should return empty data when no transactions found", async () => {
      const mockAggregateResult = [
        {
          data: [],
          totalCount: [],
        },
      ];

      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregateResult),
      });

      const result = await service.findPaginated(1, 10);

      expect(result.data).toEqual([]);
      expect(result.totalItems).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it("[BOUNDARY] should handle large page numbers", async () => {
      const mockAggregateResult = [
        {
          data: [],
          totalCount: [],
        },
      ];

      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregateResult),
      });

      const result = await service.findPaginated(1000, 10);

      expect(result.page).toBe(1000);
      expect(result.data).toEqual([]);
    });

    it("[BOUNDARY] should calculate pagination correctly with multiple pages", async () => {
      const mockAggregateResult = [
        {
          data: [mockPopulatedTransaction],
          totalCount: [{ count: 25 }],
        },
      ];

      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregateResult),
      });

      const result = await service.findPaginated(2, 10);

      expect(result.totalPages).toBe(3);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPrevPage).toBe(true);
    });

    it("[ABNORMAL] should propagate database errors", async () => {
      mockModel.aggregate.mockReturnValue({
        exec: jest
          .fn()
          .mockRejectedValue(new Error("Database connection failed")),
      });

      await expect(service.findPaginated(1, 10)).rejects.toThrow(
        "Database connection failed",
      );
    });
  });

  // ==================================================================================
  // findAll - Get all transactions
  // ==================================================================================
  describe("findAll", () => {
    it("[NORMAL] should return all transactions", async () => {
      const mockTransactions = [mockTransaction];
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTransactions),
      });

      const result = await service.findAll();

      expect(model.find).toHaveBeenCalled();
      expect(result).toEqual(mockTransactions);
      expect(result).toHaveLength(1);
    });

    it("[BOUNDARY] should return empty array when no transactions", async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("[ABNORMAL] should propagate database errors", async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      await expect(service.findAll()).rejects.toThrow("Database error");
    });
  });

  // ==================================================================================
  // findOne - Get transaction by ID
  // ==================================================================================
  describe("findOne", () => {
    it("[NORMAL] should return transaction by id", async () => {
      const id = "507f1f77bcf86cd799439020";
      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockPopulatedTransaction]),
      });

      const result = await service.findOne(id);

      expect(model.aggregate).toHaveBeenCalled();
      expect(result).toEqual(mockPopulatedTransaction);
      expect(result.paperRoll).toBeDefined();
      expect(result.employee).toBeDefined();
    });

    it("[NORMAL] should return complete transaction with all relationships", async () => {
      const id = "507f1f77bcf86cd799439020";
      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockPopulatedTransaction]),
      });

      const result = await service.findOne(id);

      expect(result).toHaveProperty("paperRollId");
      expect(result).toHaveProperty("employeeId");
      expect(result).toHaveProperty("transactionType");
      expect(result).toHaveProperty("initialWeight");
      expect(result).toHaveProperty("finalWeight");
      expect(result.paperRoll).toEqual(mockPaperRoll);
      expect(result.employee).toEqual(mockEmployee);
    });

    it("[ABNORMAL] should throw NotFoundException when transaction not found", async () => {
      const id = "507f1f77bcf86cd799439020";
      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(id)).rejects.toThrow(
        "Transaction not found",
      );
    });

    it("[ABNORMAL] should throw NotFoundException when aggregate returns null", async () => {
      const id = "507f1f77bcf86cd799439020";
      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });

    it("[ABNORMAL] should propagate database errors", async () => {
      const id = "507f1f77bcf86cd799439020";
      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      await expect(service.findOne(id)).rejects.toThrow("Database error");
    });
  });

  // ==================================================================================
  // createOne - Create new transaction
  // ==================================================================================
  describe("createOne", () => {
    const createDto: CreatePaperRollTransactionDto = {
      paperRollId: "690f75f5e7115610c1866f93",
      transactionType: "NHAP",
      initialWeight: 1200,
      finalWeight: 1000,
      timeStamp: "2025-11-12T08:30:00.000Z",
      inCharge: "operator-1",
      employeeId: "507f1f77bcf86cd799439011",
    };

    it("[NORMAL] should create transaction successfully", async () => {
      const mockDoc = {
        _id: mockTransactionId,
        ...mockTransaction,
        save: jest.fn().mockResolvedValue({ _id: mockTransactionId }),
      };

      const mockModelConstructor = jest.fn().mockReturnValue(mockDoc);
      (mockModelConstructor as any).aggregate = mockModel.aggregate;
      (service as any).txModel = mockModelConstructor;

      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockPopulatedTransaction]),
      });

      const result = await service.createOne(createDto);

      // Lấy argument thật mà hàm constructor nhận được
      const calledArg = mockModelConstructor.mock.calls[0][0];

      // Kiểm tra giá trị, không so sánh Date instance
      expect(calledArg.paperRollId.toString()).toBe(createDto.paperRollId);
      expect(calledArg.transactionType).toBe(createDto.transactionType);
      expect(calledArg.initialWeight).toBe(createDto.initialWeight);
      expect(calledArg.finalWeight).toBe(createDto.finalWeight);
      expect(calledArg.inCharge).toBe(createDto.inCharge);
      expect(calledArg.employeeId.toString()).toBe(createDto.employeeId);
      expect(calledArg.timeStamp.getTime()).toBe(
        new Date(createDto.timeStamp).getTime(),
      );

      expect(mockDoc.save).toHaveBeenCalled();
      expect(mockModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual(mockPopulatedTransaction);
      expect(result.paperRoll).toBeDefined();
      expect(result.employee).toBeDefined();
    });

    it("[NORMAL] should create with all required fields", async () => {
      const mockDoc = {
        _id: mockTransactionId,
        save: jest.fn().mockResolvedValue({ _id: mockTransactionId }),
      };

      const mockModelConstructor = jest.fn().mockReturnValue(mockDoc);
      (mockModelConstructor as any).aggregate = mockModel.aggregate;
      (service as any).txModel = mockModelConstructor;

      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockPopulatedTransaction]),
      });

      const result = await service.createOne(createDto);

      expect(result.transactionType).toBe("NHAP");
      expect(result.initialWeight).toBe(1200);
      expect(result.finalWeight).toBe(1000);
    });

    it("[NORMAL] should create with minimal required fields", async () => {
      const minimalDto: CreatePaperRollTransactionDto = {
        paperRollId: "690f75f5e7115610c1866f93",
        transactionType: "XUAT",
        initialWeight: 1000,
        finalWeight: 800,
        timeStamp: "2025-11-12T10:00:00.000Z",
      };

      const minimalTransaction = {
        ...mockPopulatedTransaction,
        transactionType: "XUAT",
        initialWeight: 1000,
        finalWeight: 800,
        inCharge: undefined,
        employeeId: undefined,
      };

      const mockDoc = {
        _id: mockTransactionId,
        save: jest.fn().mockResolvedValue({ _id: mockTransactionId }),
      };

      const mockModelConstructor = jest.fn().mockReturnValue(mockDoc);
      (mockModelConstructor as any).aggregate = mockModel.aggregate;
      (service as any).txModel = mockModelConstructor;

      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([minimalTransaction]),
      });

      const result = await service.createOne(minimalDto);

      expect(result.transactionType).toBe("XUAT");
      expect(result.inCharge).toBeUndefined();
    });

    it("[ABNORMAL] should propagate save errors", async () => {
      const mockDoc = {
        save: jest.fn().mockRejectedValue(new Error("Save failed")),
      };

      const mockModelConstructor = jest.fn().mockReturnValue(mockDoc);
      (mockModelConstructor as any).aggregate = mockModel.aggregate;
      (service as any).txModel = mockModelConstructor;

      await expect(service.createOne(createDto)).rejects.toThrow("Save failed");
    });

    it("[ABNORMAL] should handle invalid ObjectId conversion", async () => {
      const invalidDto = { ...createDto, paperRollId: "invalid-id" };

      const mockDoc = {
        save: jest.fn().mockRejectedValue(new Error("Invalid ObjectId")),
      };

      const mockModelConstructor = jest.fn().mockReturnValue(mockDoc);
      (service as any).txModel = mockModelConstructor;

      await expect(service.createOne(invalidDto)).rejects.toThrow();
    });
  });

  // ==================================================================================
  // updateOne - Update transaction
  // ==================================================================================
  describe("updateOne", () => {
    const updateDto: UpdatePaperRollTransactionDto = {
      transactionType: "XUAT",
      finalWeight: 900,
      inCharge: "operator-2",
    };

    it("[NORMAL] should update transaction successfully", async () => {
      const id = "507f1f77bcf86cd799439020";
      const updatedTransaction = {
        ...mockTransaction,
        transactionType: "XUAT",
        finalWeight: 900,
        inCharge: "operator-2",
      };

      mockModel.findByIdAndUpdate.mockResolvedValue(updatedTransaction);
      mockModel.aggregate.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([{ ...mockPopulatedTransaction, ...updateDto }]),
      });

      const result = await service.updateOne(id, updateDto);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        expect.objectContaining({
          transactionType: "XUAT",
          finalWeight: 900,
          inCharge: "operator-2",
        }),
        { new: true },
      );
      expect(result.transactionType).toBe("XUAT");
      expect(result.finalWeight).toBe(900);
    });

    it("[NORMAL] should update single field", async () => {
      const id = "507f1f77bcf86cd799439020";
      const singleFieldDto: UpdatePaperRollTransactionDto = {
        inCharge: "new-operator",
      };

      mockModel.findByIdAndUpdate.mockResolvedValue({
        ...mockTransaction,
        inCharge: "new-operator",
      });
      mockModel.aggregate.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([
            { ...mockPopulatedTransaction, inCharge: "new-operator" },
          ]),
      });

      const result = await service.updateOne(id, singleFieldDto);

      expect(result.inCharge).toBe("new-operator");
    });

    it("[NORMAL] should update multiple fields", async () => {
      const id = "507f1f77bcf86cd799439020";
      const multiFieldDto: UpdatePaperRollTransactionDto = {
        transactionType: "NHAPLAI",
        initialWeight: 800,
        finalWeight: 600,
        inCharge: "operator-3",
      };

      mockModel.findByIdAndUpdate.mockResolvedValue({
        ...mockTransaction,
        ...multiFieldDto,
      });
      mockModel.aggregate.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([
            { ...mockPopulatedTransaction, ...multiFieldDto },
          ]),
      });

      const result = await service.updateOne(id, multiFieldDto);

      expect(result.transactionType).toBe("NHAPLAI");
      expect(result.initialWeight).toBe(800);
      expect(result.finalWeight).toBe(600);
    });

    it("[NORMAL] should convert date string to Date object", async () => {
      const id = "507f1f77bcf86cd799439020";
      const dateDto: UpdatePaperRollTransactionDto = {
        timeStamp: "2025-11-15T10:00:00.000Z",
      };

      mockModel.findByIdAndUpdate.mockResolvedValue(mockTransaction);
      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockPopulatedTransaction]),
      });

      await service.updateOne(id, dateDto);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        expect.objectContaining({
          timeStamp: expect.any(Date),
        }),
        { new: true },
      );
    });

    it("[ABNORMAL] should throw NotFoundException if transaction not found", async () => {
      const id = "507f1f77bcf86cd799439020";
      mockModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.updateOne(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.updateOne(id, updateDto)).rejects.toThrow(
        "Transaction not found",
      );
    });

    it("[ABNORMAL] should propagate database errors", async () => {
      const id = "507f1f77bcf86cd799439020";
      mockModel.findByIdAndUpdate.mockRejectedValue(new Error("Update failed"));

      await expect(service.updateOne(id, updateDto)).rejects.toThrow(
        "Update failed",
      );
    });
  });

  // ==================================================================================
  // softDelete - Soft delete transaction
  // ==================================================================================
  describe("softDelete", () => {
    it("[NORMAL] should soft delete successfully", async () => {
      const id = "507f1f77bcf86cd799439020";
      const mockDoc = {
        ...mockTransaction,
        softDelete: jest.fn().mockResolvedValue(undefined),
      };

      mockModel.findById.mockResolvedValue(mockDoc);

      const result = await service.softDelete(id);

      expect(model.findById).toHaveBeenCalledWith(id);
      expect(mockDoc.softDelete).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it("[ABNORMAL] should throw NotFoundException when transaction not found", async () => {
      const id = "non-existent";
      mockModel.findById.mockResolvedValue(null);

      await expect(service.softDelete(id)).rejects.toThrow(NotFoundException);
      await expect(service.softDelete(id)).rejects.toThrow(
        "Transaction not found",
      );
    });

    it("[ABNORMAL] should propagate softDelete errors", async () => {
      const id = "507f1f77bcf86cd799439020";
      const mockDoc = {
        softDelete: jest
          .fn()
          .mockRejectedValue(new Error("Soft delete failed")),
      };

      mockModel.findById.mockResolvedValue(mockDoc);

      await expect(service.softDelete(id)).rejects.toThrow(
        "Soft delete failed",
      );
    });
  });

  // ==================================================================================
  // restore - Restore soft deleted transaction
  // ==================================================================================
  describe("restore", () => {
    it("[NORMAL] should restore successfully", async () => {
      const id = "507f1f77bcf86cd799439020";
      const mockDoc = {
        ...mockTransaction,
        restore: jest.fn().mockResolvedValue(undefined),
      };

      mockModel.findById.mockResolvedValue(mockDoc);

      const result = await service.restore(id);

      expect(model.findById).toHaveBeenCalledWith(id);
      expect(mockDoc.restore).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it("[ABNORMAL] should throw NotFoundException if transaction not found", async () => {
      const id = "507f1f77bcf86cd799439020";
      mockModel.findById.mockResolvedValue(null);

      await expect(service.restore(id)).rejects.toThrow(NotFoundException);
      await expect(service.restore(id)).rejects.toThrow(
        "Transaction not found",
      );
    });

    it("[ABNORMAL] should propagate restore errors", async () => {
      const id = "507f1f77bcf86cd799439020";
      const mockDoc = {
        restore: jest.fn().mockRejectedValue(new Error("Restore failed")),
      };

      mockModel.findById.mockResolvedValue(mockDoc);

      await expect(service.restore(id)).rejects.toThrow("Restore failed");
    });
  });

  // ==================================================================================
  // removeHard - Permanently delete transaction
  // ==================================================================================
  describe("removeHard", () => {
    it("[NORMAL] should hard delete successfully", async () => {
      const id = "507f1f77bcf86cd799439020";
      mockModel.findByIdAndDelete.mockResolvedValue(mockTransaction);

      const result = await service.removeHard(id);

      expect(model.findByIdAndDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual({ success: true });
    });

    it("[ABNORMAL] should throw NotFoundException when transaction not found", async () => {
      const id = "non-existent";
      mockModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.removeHard(id)).rejects.toThrow(NotFoundException);
      await expect(service.removeHard(id)).rejects.toThrow(
        "Transaction not found",
      );
    });

    it("[ABNORMAL] should propagate database errors", async () => {
      const id = "507f1f77bcf86cd799439020";
      mockModel.findByIdAndDelete.mockRejectedValue(
        new Error("Hard deletion failed"),
      );

      await expect(service.removeHard(id)).rejects.toThrow(
        "Hard deletion failed",
      );
    });
  });
});
