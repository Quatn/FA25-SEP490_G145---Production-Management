import { Test, TestingModule } from "@nestjs/testing";
import { PaperTypeService } from "./paper-type.service";
import { getModelToken, getConnectionToken } from "@nestjs/mongoose";
import { PaperType } from "../schemas/paper-type.schema";
import { Connection, Model } from "mongoose";
import { CreatePaperTypeRequestDto } from "./dto/create-paper-type-request.dto";
import { UpdatePaperTypeRequestDto } from "./dto/update-paper-type-request.dto";
import { NotFoundException, BadRequestException } from "@nestjs/common";

// src/modules/warehouse/paper-type/paper-type.service.spec.ts

describe("PaperTypeService", () => {
  let service: PaperTypeService;
  let model: Model<PaperType>;
  let connection: Connection;

  // Mock Data
  const mockPaperColor = {
    _id: "color-id-1",
    code: "WHT",
    title: "White",
  };

  const mockPaperType = {
    _id: "pt-id-1",
    paperColorId: "color-id-1",
    width: 1200,
    grammage: 200,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaperTypeWithSoftDelete = {
    ...mockPaperType,
    softDelete: jest.fn().mockResolvedValue(undefined),
    restore: jest.fn().mockResolvedValue(undefined),
  };

  const mockModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    aggregate: jest.fn(),
    exec: jest.fn(),
    save: jest.fn(),
  };

  const mockConnection = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaperTypeService,
        {
          provide: getModelToken(PaperType.name),
          useValue: mockModel,
        },
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
      ],
    }).compile();

    service = module.get<PaperTypeService>(PaperTypeService);
    model = module.get<Model<PaperType>>(getModelToken(PaperType.name));
    connection = module.get<Connection>(getConnectionToken());

    jest.clearAllMocks();
  });

  describe("Definition", () => {
    it("should be defined", () => {
      expect(service).toBeDefined();
      expect(model).toBeDefined();
      expect(connection).toBeDefined();
    });
  });

  // ==================================================================================
  // checkDuplicates - Validation helper
  // ==================================================================================
  describe("checkDuplicates", () => {
    const dto: CreatePaperTypeRequestDto = {
      paperColorId: "color-id-1",
      width: 1200,
      grammage: 200,
    };

    it("[NORMAL] should pass when no duplicate exists", async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.checkDuplicates(dto)).resolves.not.toThrow();
      expect(mockModel.findOne).toHaveBeenCalledWith({
        paperColorId: dto.paperColorId,
        width: dto.width,
        grammage: dto.grammage,
      });
    });

    it("[ABNORMAL] should throw BadRequestException when duplicate exists", async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPaperType),
      });

      await expect(service.checkDuplicates(dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.checkDuplicates(dto)).rejects.toThrow(
        "Loại giấy với màu, khổ và định lượng này đã tồn tại.",
      );
    });

    it("[BOUNDARY] should check with different combinations", async () => {
      const dto2 = { ...dto, width: 1000 };
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.checkDuplicates(dto2)).resolves.not.toThrow();
      expect(mockModel.findOne).toHaveBeenCalledWith({
        paperColorId: dto2.paperColorId,
        width: dto2.width,
        grammage: dto2.grammage,
      });
    });
  });

  // ==================================================================================
  // findPaginated - Paginated list with search
  // ==================================================================================
  describe("findPaginated", () => {
    it("[NORMAL] should return paginated results without search", async () => {
      const mockAggregateResult = [
        {
          data: [{ ...mockPaperType, paperColor: mockPaperColor }],
          totalCount: [{ count: 1 }],
        },
      ];

      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregateResult),
      });

      const result = await service.findPaginated(1, 10);

      expect(mockModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual({
        data: [{ ...mockPaperType, paperColor: mockPaperColor }],
        page: 1,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });

    it("[NORMAL] should return paginated results with search query", async () => {
      const mockAggregateResult = [
        {
          data: [{ ...mockPaperType, paperColor: mockPaperColor }],
          totalCount: [{ count: 1 }],
        },
      ];

      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregateResult),
      });

      const result = await service.findPaginated(1, 10, "WHT");

      expect(mockModel.aggregate).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.totalItems).toBe(1);
    });

    it("[NORMAL] should search by width", async () => {
      const mockAggregateResult = [
        {
          data: [{ ...mockPaperType, paperColor: mockPaperColor }],
          totalCount: [{ count: 1 }],
        },
      ];

      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregateResult),
      });

      const result = await service.findPaginated(1, 10, "1200");

      expect(mockModel.aggregate).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
    });

    it("[NORMAL] should search by grammage", async () => {
      const mockAggregateResult = [
        {
          data: [{ ...mockPaperType, paperColor: mockPaperColor }],
          totalCount: [{ count: 1 }],
        },
      ];

      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregateResult),
      });

      const result = await service.findPaginated(1, 10, "200");

      expect(mockModel.aggregate).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
    });

    it("[BOUNDARY] should handle empty results", async () => {
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

      expect(result).toEqual({
        data: [],
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });

    it("[BOUNDARY] should handle large page numbers", async () => {
      const mockAggregateResult = [
        {
          data: [],
          totalCount: [{ count: 100 }],
        },
      ];

      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregateResult),
      });

      const result = await service.findPaginated(100, 10);

      expect(result.page).toBe(100);
      expect(result.hasPrevPage).toBe(true);
      expect(result.hasNextPage).toBe(false);
    });

    it("[BOUNDARY] should calculate pagination correctly with multiple pages", async () => {
      const mockAggregateResult = [
        {
          data: Array(10).fill(mockPaperType),
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

    it("[BOUNDARY] should trim search query", async () => {
      const mockAggregateResult = [
        {
          data: [],
          totalCount: [],
        },
      ];

      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregateResult),
      });

      await service.findPaginated(1, 10, "  WHT  ");

      expect(mockModel.aggregate).toHaveBeenCalled();
    });

    it("[BOUNDARY] should handle empty string search", async () => {
      const mockAggregateResult = [
        {
          data: [mockPaperType],
          totalCount: [{ count: 1 }],
        },
      ];

      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregateResult),
      });

      const result = await service.findPaginated(1, 10, "");

      expect(result.data).toHaveLength(1);
    });

    it("[ABNORMAL] should handle aggregation errors", async () => {
      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error("Aggregation failed")),
      });

      await expect(service.findPaginated(1, 10)).rejects.toThrow(
        "Aggregation failed",
      );
    });
  });

  // ==================================================================================
  // findAll - Get all paper types
  // ==================================================================================
  describe("findAll", () => {
    it("[NORMAL] should return all paper types", async () => {
      const mockPaperTypes = [
        mockPaperType,
        { ...mockPaperType, _id: "pt-id-2", width: 1000 },
      ];
      mockModel.find.mockResolvedValue(mockPaperTypes);

      const result = await service.findAll();

      expect(mockModel.find).toHaveBeenCalledWith();
      expect(result).toEqual(mockPaperTypes);
      expect(result).toHaveLength(2);
    });

    it("[BOUNDARY] should return empty array when no records", async () => {
      mockModel.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("[ABNORMAL] should propagate database errors", async () => {
      mockModel.find.mockRejectedValue(new Error("Database error"));

      await expect(service.findAll()).rejects.toThrow("Database error");
    });
  });

  // ==================================================================================
  // findOne - Get single paper type by ID
  // ==================================================================================
  describe("findOne", () => {
    it("[NORMAL] should return paper type by id", async () => {
      mockModel.findById.mockResolvedValue(mockPaperType);

      const result = await service.findOne("pt-id-1");

      expect(mockModel.findById).toHaveBeenCalledWith("pt-id-1");
      expect(result).toEqual(mockPaperType);
    });

    it("[ABNORMAL] should throw NotFoundException when not found", async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(service.findOne("non-existent")).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne("non-existent")).rejects.toThrow(
        "Paper type not found",
      );
    });

    it("[ABNORMAL] should handle invalid ObjectId", async () => {
      mockModel.findById.mockRejectedValue(new Error("Invalid ObjectId"));

      await expect(service.findOne("invalid-id")).rejects.toThrow(
        "Invalid ObjectId",
      );
    });
  });

  // ==================================================================================
  // createOne - Create new paper type
  // ==================================================================================
  describe("createOne", () => {
    const createDto: CreatePaperTypeRequestDto = {
      paperColorId: "color-id-1",
      width: 1200,
      grammage: 200,
    };

    it("[NORMAL] should create paper type successfully", async () => {
      // 1. Mock checkDuplicates - no duplicate found
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // 2. Mock save method (instance method)
      const saveMock = jest.fn().mockResolvedValue(mockPaperType);

      // 3. Mock the Constructor
      // Khi service gọi 'new this.PaperTypeModel()', nó sẽ chạy hàm này
      const MockConstructor = jest.fn().mockImplementation(() => ({
        save: saveMock,
      }));

      // QUAN TRỌNG: Gán các static method (findOne, find, etc.) từ mockModel vào MockConstructor
      // Nếu không làm bước này, service.checkDuplicates sẽ lỗi vì MockConstructor không có hàm findOne
      Object.assign(MockConstructor, mockModel);

      // 4. Lưu lại model gốc để restore sau khi test (tránh ảnh hưởng test case khác)
      // Ép kiểu 'any' để truy cập thuộc tính private
      const originalModel = (service as any).PaperTypeModel;

      // 5. Gán MockConstructor vào service
      // Ép kiểu 'any' để bypass lỗi "read-only property"
      (service as any).PaperTypeModel = MockConstructor;

      // 6. Run Test
      const result = await service.createOne(createDto);

      expect(mockModel.findOne).toHaveBeenCalled(); // checkDuplicates được gọi
      expect(saveMock).toHaveBeenCalled(); // .save() được gọi
      expect(result).toEqual(mockPaperType);

      // 7. Restore lại model gốc
      (service as any).PaperTypeModel = originalModel;
    });

    it("[ABNORMAL] should throw error when duplicate exists", async () => {
      // Case này không cần mock constructor vì nó fail ngay ở bước checkDuplicates
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPaperType),
      });

      await expect(service.createOne(createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createOne(createDto)).rejects.toThrow(
        "Loại giấy với màu, khổ và định lượng này đã tồn tại.",
      );
    });

    it("[BOUNDARY] should create with minimum values", async () => {
      const minDto = { ...createDto, width: 1, grammage: 1 };

      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const saveMock = jest
        .fn()
        .mockResolvedValue({ ...mockPaperType, ...minDto });

      const MockConstructor = jest.fn().mockImplementation(() => ({
        save: saveMock,
      }));
      Object.assign(MockConstructor, mockModel); // Copy static methods

      const originalModel = (service as any).PaperTypeModel;
      (service as any).PaperTypeModel = MockConstructor;

      const result = await service.createOne(minDto);

      expect(saveMock).toHaveBeenCalled();
      expect(result).toHaveProperty("width", 1);
      expect(result).toHaveProperty("grammage", 1);

      (service as any).PaperTypeModel = originalModel;
    });

    it("[ABNORMAL] should handle save errors", async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const saveMock = jest.fn().mockRejectedValue(new Error("Save failed"));

      const MockConstructor = jest.fn().mockImplementation(() => ({
        save: saveMock,
      }));
      Object.assign(MockConstructor, mockModel); // Copy static methods

      const originalModel = (service as any).PaperTypeModel;
      (service as any).PaperTypeModel = MockConstructor;

      await expect(service.createOne(createDto)).rejects.toThrow("Save failed");

      (service as any).PaperTypeModel = originalModel;
    });
  });

  // ==================================================================================
  // updateOne - Update paper type
  // ==================================================================================
  describe("updateOne", () => {
    const updateDto: UpdatePaperTypeRequestDto = {
      width: 1000,
      grammage: 250,
    };

    it("[NORMAL] should update paper type successfully", async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const updatedType = { ...mockPaperType, ...updateDto };
      mockModel.findByIdAndUpdate.mockResolvedValue(updatedType);

      const result = await service.updateOne("pt-id-1", updateDto);

      expect(mockModel.findOne).toHaveBeenCalled();
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "pt-id-1",
        updateDto,
        { new: true },
      );
      expect(result).toEqual(updatedType);
    });

    it("[NORMAL] should update single field", async () => {
      const singleFieldDto = { width: 900 };
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const updatedType = { ...mockPaperType, width: 900 };
      mockModel.findByIdAndUpdate.mockResolvedValue(updatedType);

      const result = await service.updateOne("pt-id-1", singleFieldDto);

      expect(result.width).toBe(900);
    });

    it("[ABNORMAL] should throw NotFoundException when not found", async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.updateOne("pt-id-1", updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.updateOne("pt-id-1", updateDto)).rejects.toThrow(
        "Paper type not found",
      );
    });

    it("[ABNORMAL] should throw error when duplicate exists", async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPaperType),
      });

      await expect(service.updateOne("pt-id-1", updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("[ABNORMAL] should handle update errors", async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockModel.findByIdAndUpdate.mockRejectedValue(new Error("Update failed"));

      await expect(service.updateOne("pt-id-1", updateDto)).rejects.toThrow(
        "Update failed",
      );
    });
  });

  // ==================================================================================
  // softDelete - Soft delete paper type
  // ==================================================================================
  describe("softDelete", () => {
    it("[NORMAL] should soft delete successfully", async () => {
      mockModel.findById.mockResolvedValue(mockPaperTypeWithSoftDelete);

      const result = await service.softDelete("pt-id-1");

      expect(mockModel.findById).toHaveBeenCalledWith("pt-id-1");
      expect(mockPaperTypeWithSoftDelete.softDelete).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it("[ABNORMAL] should throw NotFoundException when not found", async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(service.softDelete("non-existent")).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.softDelete("non-existent")).rejects.toThrow(
        "Paper type not found",
      );
    });

    it("[ABNORMAL] should handle soft delete errors", async () => {
      const errorMock = {
        ...mockPaperTypeWithSoftDelete,
        softDelete: jest.fn().mockRejectedValue(new Error("Delete failed")),
      };
      mockModel.findById.mockResolvedValue(errorMock);

      await expect(service.softDelete("pt-id-1")).rejects.toThrow(
        "Delete failed",
      );
    });
  });

  // ==================================================================================
  // restore - Restore soft deleted paper type
  // ==================================================================================
  describe("restore", () => {
    it("[NORMAL] should restore successfully", async () => {
      mockModel.findById.mockResolvedValue(mockPaperTypeWithSoftDelete);

      const result = await service.restore("pt-id-1");

      expect(mockModel.findById).toHaveBeenCalledWith("pt-id-1");
      expect(mockPaperTypeWithSoftDelete.restore).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it("[ABNORMAL] should throw NotFoundException when not found", async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(service.restore("non-existent")).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.restore("non-existent")).rejects.toThrow(
        "Paper type not found",
      );
    });

    it("[ABNORMAL] should handle restore errors", async () => {
      const errorMock = {
        ...mockPaperTypeWithSoftDelete,
        restore: jest.fn().mockRejectedValue(new Error("Restore failed")),
      };
      mockModel.findById.mockResolvedValue(errorMock);

      await expect(service.restore("pt-id-1")).rejects.toThrow(
        "Restore failed",
      );
    });
  });

  // ==================================================================================
  // removeHard - Permanently delete paper type
  // ==================================================================================
  describe("removeHard", () => {
    it("[NORMAL] should hard delete successfully", async () => {
      mockModel.findByIdAndDelete.mockResolvedValue(mockPaperType);

      const result = await service.removeHard("pt-id-1");

      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith("pt-id-1");
      expect(result).toEqual({ success: true });
    });

    it("[ABNORMAL] should throw NotFoundException when not found", async () => {
      mockModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.removeHard("non-existent")).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.removeHard("non-existent")).rejects.toThrow(
        "Paper type not found",
      );
    });

    it("[ABNORMAL] should handle deletion errors", async () => {
      mockModel.findByIdAndDelete.mockRejectedValue(
        new Error("Deletion failed"),
      );

      await expect(service.removeHard("pt-id-1")).rejects.toThrow(
        "Deletion failed",
      );
    });

    it("[ABNORMAL] should handle foreign key constraints", async () => {
      mockModel.findByIdAndDelete.mockRejectedValue(
        new Error("Foreign key constraint"),
      );

      await expect(service.removeHard("pt-id-1")).rejects.toThrow(
        "Foreign key constraint",
      );
    });
  });
});
