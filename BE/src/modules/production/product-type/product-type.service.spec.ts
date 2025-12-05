import { Test, TestingModule } from "@nestjs/testing";
import { ProductTypeService } from "./product-type.service";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ProductType } from "../schemas/product-type.schema";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { CreateProductTypeDto } from "./dto/create-product-type.dto";

describe("ProductTypeService", () => {
  let service: ProductTypeService;
  let model: Model<ProductType>;

  // 1. Tạo các mock function cho instance methods (các hàm được gọi sau khi new Model())
  const mockSave = jest.fn();
  const mockSoftDeleteInstance = jest.fn();
  const mockRestoreInstance = jest.fn();

  // 2. Định nghĩa Mock Model dưới dạng CLASS để hỗ trợ "new this.pModel()"
  class MockProductTypeModel {
    constructor(dto: any) {
      // Gán dữ liệu dto vào instance
      Object.assign(this, dto);
    }

    // Instance methods (gắn các hàm mock vào đây)
    save = mockSave;
    softDelete = mockSoftDeleteInstance;
    restore = mockRestoreInstance;

    // Static methods (các hàm gọi trực tiếp từ Model như Model.find())
    static find = jest.fn();
    static findById = jest.fn();
    static countDocuments = jest.fn();
    static findByIdAndUpdate = jest.fn();
    static findByIdAndDelete = jest.fn();
    static create = jest.fn();
    static aggregate = jest.fn();
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductTypeService,
        {
          provide: getModelToken(ProductType.name),
          useValue: MockProductTypeModel, // Sử dụng Class Mock thay vì Object
        },
      ],
    }).compile();

    service = module.get<ProductTypeService>(ProductTypeService);
    model = module.get<Model<ProductType>>(getModelToken(ProductType.name));

    jest.clearAllMocks();

    // Reset behavior mặc định cho các instance methods
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

  describe("findPaginated (N)", () => {
    it("should return paginated list", async () => {
      const mockData = [{ _id: "1", code: "A", name: "Type A" }];
      (MockProductTypeModel.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      });
      (MockProductTypeModel.countDocuments as jest.Mock).mockResolvedValue(5);

      const result = await service.findPaginated(1, 10);

      expect(result.data).toEqual(mockData);
      expect(result.totalItems).toBe(5);
    });
  });

  describe("findAll (N)", () => {
    it("should return all product types", async () => {
      const list = [{ _id: "1", code: "A" }];
      (MockProductTypeModel.find as jest.Mock).mockResolvedValue(list);
      expect(await service.findAll()).toEqual(list);
    });
  });

  describe("findOne (N)", () => {
    it("should return product type by id", async () => {
      const doc = { _id: "123", code: "PT01", name: "Loại 1" };
      (MockProductTypeModel.findById as jest.Mock).mockResolvedValue(doc);
      expect(await service.findOne("123")).toEqual(doc);
    });
  });

  describe("createOne (N)", () => {
    it("should create a product type successfully", async () => {
      const dto: CreateProductTypeDto = {
        code: "NEW001",
        name: "Mới",
        description: "Test desc",
        note: "Test note",
      };

      const createdDoc = { ...dto, _id: "new_id" };

      // QUAN TRỌNG: Mock hàm save() của instance thay vì mockModel.create
      mockSave.mockResolvedValue(createdDoc);

      const result = await service.createOne(dto);

      // Kiểm tra hàm save có được gọi không
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(createdDoc);
    });
  });

  describe("updateOne (N)", () => {
    it("should update product type", async () => {
      const updated = { _id: "123", name: "Updated Name" };
      (MockProductTypeModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(updated);

      const result = await service.updateOne("123", { name: "Updated Name" });
      expect(result).toEqual(updated);
    });
  });

  describe("softDelete (N)", () => {
    it("should soft delete the product type", async () => {
      // Mock findById trả về một object có method softDelete (chính là instance mock của ta)
      // Ta dùng `new MockProductTypeModel({})` để giả lập việc findById trả về 1 document
      const docInstance = new MockProductTypeModel({});
      (MockProductTypeModel.findById as jest.Mock).mockResolvedValue(docInstance);
      
      mockSoftDeleteInstance.mockResolvedValue({ success: true });

      const result = await service.softDelete("123");

      expect(mockSoftDeleteInstance).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });

  describe("restore (N)", () => {
    it("should restore the product type", async () => {
      const docInstance = new MockProductTypeModel({});
      (MockProductTypeModel.findById as jest.Mock).mockResolvedValue(docInstance);
      
      mockRestoreInstance.mockResolvedValue({ success: true });

      const result = await service.restore("123");

      expect(mockRestoreInstance).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });

  describe("removeHard (N)", () => {
    it("should hard delete the product type", async () => {
      (MockProductTypeModel.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: "123" });

      const result = await service.removeHard("123");

      expect(MockProductTypeModel.findByIdAndDelete).toHaveBeenCalledWith("123");
      expect(result).toEqual({ success: true });
    });
  });

  // =============================================
  // ABNORMAL CASES
  // =============================================

  describe("findOne (A)", () => {
    it("should throw NotFoundException if not found", async () => {
      (MockProductTypeModel.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne("999")).rejects.toThrow(NotFoundException);
      await expect(service.findOne("999")).rejects.toThrow("Product type not found");
    });
  });

  describe("createOne (A)", () => {
    it("should throw BadRequestException on duplicate key error (code 11000)", async () => {
      const dto: CreateProductTypeDto = {
        code: "DUP",
        name: "Duplicate Code",
        description: "",
        note: "",
      };

      // QUAN TRỌNG: Service dùng `new Model(dto).save()`.
      // Vì vậy ta phải mock hàm `save()` bị reject, chứ không phải `create()`.
      mockSave.mockRejectedValue({
        code: 11000,
        keyValue: { code: "DUP" },
      });

      await expect(service.createOne(dto)).rejects.toThrow(BadRequestException);
      await expect(service.createOne(dto)).rejects.toThrow(
        'Mã loại sản phẩm "DUP" đã tồn tại.'
      );

      // Kiểm tra save() đã được gọi
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe("updateOne (A)", () => {
    it("should throw NotFoundException if document not found", async () => {
      (MockProductTypeModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
      await expect(service.updateOne("999", { name: "Test" })).rejects.toThrow(
        NotFoundException
      );
    });

    it("should throw BadRequestException on duplicate key error", async () => {
      (MockProductTypeModel.findByIdAndUpdate as jest.Mock).mockRejectedValue({
        code: 11000,
        keyValue: { name: "UNIQUE_NAME" },
      });

      await expect(
        service.updateOne("123", { name: "UNIQUE_NAME" })
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateOne("123", { name: "UNIQUE_NAME" })
      ).rejects.toThrow('Giá trị "UNIQUE_NAME" ở trường "name" đã tồn tại.');
    });
  });

  describe("softDelete (A)", () => {
    it("should throw NotFoundException if document not found", async () => {
      (MockProductTypeModel.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.softDelete("999")).rejects.toThrow(NotFoundException);
    });
  });

  describe("removeHard (A)", () => {
    it("should throw NotFoundException if document not found", async () => {
      (MockProductTypeModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);
      await expect(service.removeHard("999")).rejects.toThrow(NotFoundException);
    });
  });
});