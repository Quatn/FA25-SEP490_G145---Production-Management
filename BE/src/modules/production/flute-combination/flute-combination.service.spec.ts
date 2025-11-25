import { Test, TestingModule } from "@nestjs/testing";
import { FluteCombinationService } from "./flute-combination.service";
import { getModelToken } from "@nestjs/mongoose";
import { FluteCombination } from "../schemas/flute-combination.schema";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("FluteCombinationService", () => {
  let service: FluteCombinationService;
  let model: any; // Mock Model

  // 1. Định nghĩa Mock cho Document (kết quả trả về từ DB)
  const mockFluteCombinationDoc = {
    _id: "some-id",
    code: "FC001",
    description: "Test description",
    save: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
  };

  // 2. Định nghĩa Mock cho Model (Class và Static methods)
  // Vì service dùng "new this.fcModel()", ta cần mock nó như một Class
  class MockFluteCombinationModel {
    constructor(private data: any) {
      Object.assign(this, data);
    }
    save() {
      return Promise.resolve(mockFluteCombinationDoc);
    }

    // Static methods
    static find = jest.fn();
    static findById = jest.fn();
    static findByIdAndUpdate = jest.fn();
    static findByIdAndDelete = jest.fn();
    static countDocuments = jest.fn();
    static aggregate = jest.fn();
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FluteCombinationService,
        {
          provide: getModelToken(FluteCombination.name),
          useValue: MockFluteCombinationModel,
        },
      ],
    }).compile();

    service = module.get<FluteCombinationService>(FluteCombinationService);
    model = module.get(getModelToken(FluteCombination.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // --- Test: findAll ---
  describe("findAll", () => {
    it("should return an array of flute combinations", async () => {
      jest.spyOn(model, "find").mockResolvedValue([mockFluteCombinationDoc]);

      const result = await service.findAll();
      expect(result).toEqual([mockFluteCombinationDoc]);
      expect(model.find).toHaveBeenCalled();
    });
  });

  // --- Test: findOne ---
  describe("findOne", () => {
    it("should return a document if found", async () => {
      jest.spyOn(model, "findById").mockResolvedValue(mockFluteCombinationDoc);

      const result = await service.findOne("some-id");
      expect(result).toEqual(mockFluteCombinationDoc);
    });

    it("should throw NotFoundException if not found", async () => {
      jest.spyOn(model, "findById").mockResolvedValue(null);

      await expect(service.findOne("wrong-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // --- Test: createOne ---
  describe("createOne", () => {
    const dto = { code: "FC002", description: "New One" };

    it("should create and return a new document", async () => {
      const saveSpy = jest.spyOn(MockFluteCombinationModel.prototype, "save");

      const result = await service.createOne(dto as any);

      expect(result).toEqual(mockFluteCombinationDoc);
      expect(saveSpy).toHaveBeenCalled();
    });

    it("should throw BadRequestException on duplicate key error (code 11000)", async () => {
      jest
        .spyOn(MockFluteCombinationModel.prototype, "save")
        .mockRejectedValueOnce({
          code: 11000,
          keyValue: { code: "FC002" },
        });

      await expect(service.createOne(dto as any)).rejects.toThrow(
        'Mã sóng "FC002" đã tồn tại.',
      );
    });

    it("should re-throw other errors", async () => {
      jest
        .spyOn(MockFluteCombinationModel.prototype, "save")
        .mockRejectedValueOnce(new Error("DB Error"));

      await expect(service.createOne(dto as any)).rejects.toThrow("DB Error");
    });
  });

  // --- Test: updateOne ---
  describe("updateOne", () => {
    const dto = { description: "Updated" };

    it("should update and return the document", async () => {
      jest
        .spyOn(model, "findByIdAndUpdate")
        .mockResolvedValue(mockFluteCombinationDoc);

      const result = await service.updateOne("some-id", dto as any);
      expect(result).toEqual(mockFluteCombinationDoc);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith("some-id", dto, {
        new: true,
      });
    });

    it("should throw NotFoundException if document to update is not found", async () => {
      jest.spyOn(model, "findByIdAndUpdate").mockResolvedValue(null);
      await expect(service.updateOne("some-id", dto as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException on duplicate key error", async () => {
      jest.spyOn(model, "findByIdAndUpdate").mockRejectedValue({
        code: 11000,
        keyValue: { code: "EXISTING" },
      });

      await expect(service.updateOne("some-id", dto as any)).rejects.toThrow(
        'Mã sóng "EXISTING" đã tồn tại.',
      );
    });
  });

  // --- Test: checkDuplicates ---
  describe("checkDuplicates", () => {
    it("should throw BadRequestException if duplicates found", async () => {
      // Mock aggregate trả về 1 phần tử trùng
      jest.spyOn(model, "aggregate").mockResolvedValue([{ code: "DUPLICATE" }]);

      const dto = { code: "DUPLICATE" };
      await expect(service.checkDuplicates(dto as any)).rejects.toThrow(
        "Trùng lặp giá trị ở các trường: Mã sóng",
      );
    });

    it("should not throw if no duplicates found", async () => {
      jest.spyOn(model, "aggregate").mockResolvedValue([]); // Rỗng
      const dto = { code: "UNIQUE" };
      await expect(service.checkDuplicates(dto as any)).resolves.not.toThrow();
    });
  });

  // --- Test: findPaginated ---
  describe("findPaginated", () => {
    it("should return paginated result", async () => {
      // Mock chuỗi: find(query).skip(skip).limit(limit).exec()
      const mockFind = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockFluteCombinationDoc]),
      };
      jest.spyOn(model, "find").mockReturnValue(mockFind);
      jest.spyOn(model, "countDocuments").mockResolvedValue(10);

      const result = await service.findPaginated(1, 10, "test");

      expect(model.find).toHaveBeenCalled(); // Kiểm tra query regex
      expect(model.countDocuments).toHaveBeenCalled();
      expect(result).toEqual({
        data: [mockFluteCombinationDoc],
        page: 1,
        limit: 10,
        totalItems: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });
  });

  // --- Test: softDelete & restore ---
  describe("softDelete & restore", () => {
    it("should soft delete a document", async () => {
      // Mock findById trả về một doc có hàm softDelete
      const docWithMethods = {
        ...mockFluteCombinationDoc,
        softDelete: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(model, "findById").mockResolvedValue(docWithMethods);

      const result = await service.softDelete("some-id");
      expect(result).toEqual({ success: true });
      expect(docWithMethods.softDelete).toHaveBeenCalled();
    });

    it("should restore a document", async () => {
      const docWithMethods = {
        ...mockFluteCombinationDoc,
        restore: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(model, "findById").mockResolvedValue(docWithMethods);

      const result = await service.restore("some-id");
      expect(result).toEqual({ success: true });
      expect(docWithMethods.restore).toHaveBeenCalled();
    });

    it("should throw NotFoundException on softDelete if not found", async () => {
      jest.spyOn(model, "findById").mockResolvedValue(null);
      await expect(service.softDelete("bad-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // --- Test: removeHard ---
  describe("removeHard", () => {
    it("should remove document permanently", async () => {
      jest
        .spyOn(model, "findByIdAndDelete")
        .mockResolvedValue(mockFluteCombinationDoc);
      const result = await service.removeHard("some-id");
      expect(result).toEqual({ success: true });
    });

    it("should throw NotFoundException if document not found", async () => {
      jest.spyOn(model, "findByIdAndDelete").mockResolvedValue(null);
      await expect(service.removeHard("bad-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
