import { Test, TestingModule } from "@nestjs/testing";
import { WareManufacturingProcessTypeService } from "./ware-manufacturing-process-type.service";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { WareManufacturingProcessType } from "../schemas/ware-manufacturing-process-type.schema";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { CreateWareManufacturingProcessTypeDto } from "./dto/create-ware-manufacturing-process-type.dto";
import { UpdateWareManufacturingProcessTypeDto } from "./dto/update-ware-manufacturing-process-type.dto";

//src/modules/production/ware-manufacturing-process-type/ware-manufacturing-process-type.service.spec.ts

describe("WareManufacturingProcessTypeService", () => {
  let service: WareManufacturingProcessTypeService;
  let model: Model<WareManufacturingProcessType>;

  // 1. Tạo các mock function cho instance methods
  const mockSave = jest.fn();
  const mockSoftDeleteInstance = jest.fn();
  const mockRestoreInstance = jest.fn();

  // 2. Định nghĩa Mock Model dưới dạng CLASS
  class MockWareManufacturingProcessTypeModel {
    constructor(dto: any) {
      Object.assign(this, dto);
    }

    // Instance methods
    save = mockSave;
    softDelete = mockSoftDeleteInstance;
    restore = mockRestoreInstance;

    // Static methods
    static find = jest.fn();
    static findById = jest.fn();
    static countDocuments = jest.fn();
    static findByIdAndUpdate = jest.fn();
    static findByIdAndDelete = jest.fn();
    static create = jest.fn();
    static aggregate = jest.fn(); // Mock thêm aggregate cho hàm checkDuplicates
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WareManufacturingProcessTypeService,
        {
          provide: getModelToken(WareManufacturingProcessType.name),
          useValue: MockWareManufacturingProcessTypeModel,
        },
      ],
    }).compile();

    service = module.get<WareManufacturingProcessTypeService>(
      WareManufacturingProcessTypeService
    );
    model = module.get<Model<WareManufacturingProcessType>>(
      getModelToken(WareManufacturingProcessType.name)
    );

    jest.clearAllMocks();

    mockSave.mockReset();
    mockSoftDeleteInstance.mockReset();
    mockRestoreInstance.mockReset();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // =============================================
  // NORMAL CASES
  // =============================================

  describe("checkDuplicates (N)", () => {
    it("should return void if no duplicates found", async () => {
      // Mock aggregate trả về mảng rỗng (không trùng)
      (MockWareManufacturingProcessTypeModel.aggregate as jest.Mock).mockResolvedValue([]);
      
      const dto: CreateWareManufacturingProcessTypeDto = { code: "A", name: "B", description: "", note: "" };
      await expect(service.checkDuplicates(dto)).resolves.not.toThrow();
    });
  });

  describe("findPaginated (N)", () => {
    it("should return paginated list without search", async () => {
      const mockData = [{ _id: "1", code: "A", name: "Type A" }];
      (MockWareManufacturingProcessTypeModel.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      });
      (MockWareManufacturingProcessTypeModel.countDocuments as jest.Mock).mockResolvedValue(5);

      const result = await service.findPaginated(1, 10);

      expect(result.data).toEqual(mockData);
      expect(result.totalItems).toBe(5);
    });

    it("should return paginated list WITH search", async () => {
        const mockData = [{ _id: "1", code: "SEARCH_MATCH", name: "Type A" }];
        // Verify mock được gọi với query regex
        const findMock = MockWareManufacturingProcessTypeModel.find as jest.Mock;
        findMock.mockReturnValue({
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockData),
        });
        (MockWareManufacturingProcessTypeModel.countDocuments as jest.Mock).mockResolvedValue(1);
  
        const result = await service.findPaginated(1, 10, "SEARCH");
  
        expect(result.data).toEqual(mockData);
        // Kiểm tra xem find có được gọi với đúng cấu trúc $or không
        expect(findMock).toHaveBeenCalledWith(expect.objectContaining({
            $or: expect.any(Array)
        }));
      });
  });

  describe("findAll (N)", () => {
    it("should return all items", async () => {
      const list = [{ _id: "1", code: "A" }];
      (MockWareManufacturingProcessTypeModel.find as jest.Mock).mockResolvedValue(list);
      expect(await service.findAll()).toEqual(list);
    });
  });

  describe("findOne (N)", () => {
    it("should return item by id", async () => {
      const doc = { _id: "123", code: "PT01", name: "Loại 1" };
      (MockWareManufacturingProcessTypeModel.findById as jest.Mock).mockResolvedValue(doc);
      expect(await service.findOne("123")).toEqual(doc);
    });
  });

  describe("createOne (N)", () => {
    it("should create item successfully", async () => {
      const dto: CreateWareManufacturingProcessTypeDto = {
        code: "NEW001",
        name: "Mới",
        description: "Test desc",
        note: "Test note",
      };

      const createdDoc = { ...dto, _id: "new_id" };
      mockSave.mockResolvedValue(createdDoc);

      const result = await service.createOne(dto);

      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(createdDoc);
    });
  });

  describe("updateOne (N)", () => {
    it("should update item", async () => {
      const updated = { _id: "123", name: "Updated Name" };
      (MockWareManufacturingProcessTypeModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(updated);

      const result = await service.updateOne("123", { name: "Updated Name" } as UpdateWareManufacturingProcessTypeDto);
      expect(result).toEqual(updated);
    });
  });

  describe("softDelete (N)", () => {
    it("should soft delete item", async () => {
      const docInstance = new MockWareManufacturingProcessTypeModel({});
      (MockWareManufacturingProcessTypeModel.findById as jest.Mock).mockResolvedValue(docInstance);
      
      mockSoftDeleteInstance.mockResolvedValue({ success: true });

      const result = await service.softDelete("123");

      expect(mockSoftDeleteInstance).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });

  describe("restore (N)", () => {
    it("should restore item", async () => {
      const docInstance = new MockWareManufacturingProcessTypeModel({});
      (MockWareManufacturingProcessTypeModel.findById as jest.Mock).mockResolvedValue(docInstance);
      
      mockRestoreInstance.mockResolvedValue({ success: true });

      const result = await service.restore("123");

      expect(mockRestoreInstance).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });

  describe("removeHard (N)", () => {
    it("should hard delete item", async () => {
      (MockWareManufacturingProcessTypeModel.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: "123" });

      const result = await service.removeHard("123");

      expect(MockWareManufacturingProcessTypeModel.findByIdAndDelete).toHaveBeenCalledWith("123");
      expect(result).toEqual({ success: true });
    });
  });

  // =============================================
  // ABNORMAL CASES
  // =============================================

  describe("checkDuplicates (A)", () => {
    it("should throw BadRequestException if duplicates found", async () => {
        // Giả lập aggregate trả về 1 bản ghi trùng
        const duplicates = [{ code: "DUP", name: "Existing" }];
        (MockWareManufacturingProcessTypeModel.aggregate as jest.Mock).mockResolvedValue(duplicates);
  
        const dto: CreateWareManufacturingProcessTypeDto = { code: "DUP", name: "New Name", description: "", note: "" };
        
        await expect(service.checkDuplicates(dto)).rejects.toThrow(BadRequestException);
        await expect(service.checkDuplicates(dto)).rejects.toThrow("Trùng lặp giá trị ở các trường: Mã loại quy trình");
    });
  });

  describe("findOne (A)", () => {
    it("should throw NotFoundException if not found", async () => {
      (MockWareManufacturingProcessTypeModel.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne("999")).rejects.toThrow(NotFoundException);
      await expect(service.findOne("999")).rejects.toThrow("Ware manufacturing process type not found");
    });
  });

  describe("createOne (A)", () => {
    it("should throw BadRequestException on duplicate key error (code)", async () => {
      const dto: CreateWareManufacturingProcessTypeDto = {
        code: "DUP",
        name: "Valid",
        description: "",
        note: "",
      };

      mockSave.mockRejectedValue({
        code: 11000,
        keyValue: { code: "DUP" },
      });

      await expect(service.createOne(dto)).rejects.toThrow(BadRequestException);
      await expect(service.createOne(dto)).rejects.toThrow(
        'Mã loại quy trình "DUP" đã tồn tại.'
      );
    });

    it("should throw BadRequestException on duplicate key error (name or other field)", async () => {
        const dto: CreateWareManufacturingProcessTypeDto = {
          code: "CODE",
          name: "DUP_NAME",
          description: "",
          note: "",
        };
  
        mockSave.mockRejectedValue({
          code: 11000,
          keyValue: { name: "DUP_NAME" },
        });
  
        await expect(service.createOne(dto)).rejects.toThrow(BadRequestException);
        await expect(service.createOne(dto)).rejects.toThrow(
          'Giá trị "DUP_NAME" ở trường "name" đã tồn tại.'
        );
      });
  });

  describe("updateOne (A)", () => {
    it("should throw NotFoundException if document not found", async () => {
      (MockWareManufacturingProcessTypeModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
      await expect(service.updateOne("999", {} as any)).rejects.toThrow(
        NotFoundException
      );
    });

    it("should throw BadRequestException on duplicate key error", async () => {
      (MockWareManufacturingProcessTypeModel.findByIdAndUpdate as jest.Mock).mockRejectedValue({
        code: 11000,
        keyValue: { code: "UNIQUE_CODE" },
      });

      await expect(
        service.updateOne("123", { code: "UNIQUE_CODE" } as any)
      ).rejects.toThrow(BadRequestException);
      
      await expect(
        service.updateOne("123", { code: "UNIQUE_CODE" } as any)
      ).rejects.toThrow('Mã loại quy trình "UNIQUE_CODE" đã tồn tại.');
    });
  });

  describe("softDelete (A)", () => {
    it("should throw NotFoundException if document not found", async () => {
      (MockWareManufacturingProcessTypeModel.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.softDelete("999")).rejects.toThrow(NotFoundException);
    });
  });

  describe("removeHard (A)", () => {
    it("should throw NotFoundException if document not found", async () => {
      (MockWareManufacturingProcessTypeModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);
      await expect(service.removeHard("999")).rejects.toThrow(NotFoundException);
    });
  });
});