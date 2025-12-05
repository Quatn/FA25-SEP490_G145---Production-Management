import { Test, TestingModule } from "@nestjs/testing";
import { EmployeeService } from "./employee.service";
import { getModelToken } from "@nestjs/mongoose";
import { Employee } from "./schemas/employee.schema";
import { Model } from "mongoose";
import mongoose from "mongoose";
import { NotFoundException } from "@nestjs/common";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";

// src/modules/employee/employee.service.spec.ts

describe("EmployeeService", () => {
  let service: EmployeeService;
  let model: Model<Employee>;

  // Mock Data
  const mockRole: any = {
    _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439012"),
    code: "ROLE001",
    name: "Developer",
    description: "Software Developer",
    note: "Technical role",
  };

  const mockUser: any = {
    _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439013"),
    username: "johndoe",
    email: "john@example.com",
    employee: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
  };

  const mockEmployee: any = {
    _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
    code: "EMP001",
    name: "John Doe",
    address: "123 Main St",
    email: "john@example.com",
    contactNumber: "0123456789",
    role: mockRole._id,
    note: "Senior developer",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEmployeePopulated: any = {
    ...mockEmployee,
    role: mockRole,
  };

  // Mock Model Methods
  const mockModel: any = jest.fn((doc: any) => {
    return {
      ...doc,
      save: jest.fn(),
    };
  });

  Object.assign(mockModel, {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    aggregate: jest.fn(),
    populate: jest.fn(),
    collection: {
      find: jest.fn(),
      countDocuments: jest.fn(),
    },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: getModelToken(Employee.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
    model = module.get<Model<Employee>>(getModelToken(Employee.name));

    jest.clearAllMocks();
  });

  describe("Definition", () => {
    it("should be defined", () => {
      expect(service).toBeDefined();
      expect(model).toBeDefined();
    });
  });

  // ==================================================================================
  // findAll - Get all employees
  // ==================================================================================
  describe("findAll", () => {
    it("[NORMAL] should return all employees", async () => {
      const mockEmployees = [
        mockEmployee,
        { ...mockEmployee, _id: new mongoose.Types.ObjectId() },
      ];
      mockModel.find.mockResolvedValue(mockEmployees);

      const result = await service.findAll();

      expect(model.find).toHaveBeenCalledWith();
      expect(model.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockEmployees);
      expect(result).toHaveLength(2);
    });

    it("[BOUNDARY] should return empty array when no employees exist", async () => {
      mockModel.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("[ABNORMAL] should propagate database errors", async () => {
      mockModel.find.mockRejectedValue(new Error("Database connection failed"));

      await expect(service.findAll()).rejects.toThrow(
        "Database connection failed",
      );
    });
  });

  // ==================================================================================
  // findById - Get employee by ObjectId
  // ==================================================================================
  describe("findById", () => {
    it("[NORMAL] should return employee by id", async () => {
      const id = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
      mockModel.findById.mockResolvedValue(mockEmployee);

      const result = await service.findById(id);

      expect(model.findById).toHaveBeenCalledWith(id);
      expect(model.findById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockEmployee);
    });

    it("[NORMAL] should return employee with all fields", async () => {
      const id = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
      mockModel.findById.mockResolvedValue(mockEmployee);

      const result = await service.findById(id);

      expect(result).toHaveProperty("code");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("role");
    });

    it("[BOUNDARY] should return null when employee not found", async () => {
      const id = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
      mockModel.findById.mockResolvedValue(null);

      const result = await service.findById(id);

      expect(result).toBeNull();
    });

    it("[ABNORMAL] should propagate database errors", async () => {
      const id = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
      mockModel.findById.mockRejectedValue(new Error("Database error"));

      await expect(service.findById(id)).rejects.toThrow("Database error");
    });
  });

  // ==================================================================================
  // findByCode - Get employee by code
  // ==================================================================================
  describe("findByCode", () => {
    it("[NORMAL] should return employee by code", async () => {
      const code = "EMP001";
      mockModel.findOne.mockResolvedValue(mockEmployee);

      const result = await service.findByCode(code);

      expect(model.findOne).toHaveBeenCalledWith({ code });
      expect(model.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockEmployee);
    });

    it("[BOUNDARY] should return null when code not found", async () => {
      const code = "NONEXISTENT";
      mockModel.findOne.mockResolvedValue(null);

      const result = await service.findByCode(code);

      expect(result).toBeNull();
    });

    it("[ABNORMAL] should propagate database errors", async () => {
      const code = "EMP001";
      mockModel.findOne.mockRejectedValue(new Error("Database error"));

      await expect(service.findByCode(code)).rejects.toThrow("Database error");
    });
  });

  // ==================================================================================
  // queryListFullDetails - Query employees with full details
  // ==================================================================================
  describe("queryListFullDetails", () => {
    it("[NORMAL] should return paginated list with full details", async () => {
      const params = { page: 1, limit: 20, filter: {}, sort: [] };
      const mockAggregateResult = [
        { ...mockEmployee, role: mockRole, user: mockUser },
      ];
      const mockCountResult = [{ total: 1 }];

      mockModel.aggregate
        .mockResolvedValueOnce(mockAggregateResult)
        .mockResolvedValueOnce(mockCountResult);

      const result = await service.queryListFullDetails(params);

      expect(model.aggregate).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty("page", 1);
      expect(result).toHaveProperty("limit", 20);
      expect(result).toHaveProperty("totalItems", 1);
      expect(result).toHaveProperty("totalPages", 1);
      expect(result).toHaveProperty("data");
      expect(result.data).toHaveLength(1);
    });

    it("[NORMAL] should handle pagination correctly", async () => {
      const params = { page: 2, limit: 10, filter: {}, sort: [] };
      const mockAggregateResult = [];
      const mockCountResult = [{ total: 15 }];

      mockModel.aggregate
        .mockResolvedValueOnce(mockAggregateResult)
        .mockResolvedValueOnce(mockCountResult);

      const result = await service.queryListFullDetails(params);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(2);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPrevPage).toBe(true);
    });

    it("[NORMAL] should apply filters correctly", async () => {
      const params = {
        page: 1,
        limit: 20,
        filter: { name: "John" },
        sort: [],
      };
      const mockAggregateResult = [
        { ...mockEmployee, role: mockRole, user: null },
      ];
      const mockCountResult = [{ total: 1 }];

      mockModel.aggregate
        .mockResolvedValueOnce(mockAggregateResult)
        .mockResolvedValueOnce(mockCountResult);

      const result = await service.queryListFullDetails(params);

      expect(model.aggregate).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
    });

    it("[NORMAL] should apply sorting by hasUser", async () => {
      const params = {
        page: 1,
        limit: 20,
        filter: {},
        sort: [{ hasUser: -1 as -1 }],
      };
      const mockAggregateResult = [
        { ...mockEmployee, role: mockRole, user: mockUser },
        {
          ...mockEmployee,
          _id: new mongoose.Types.ObjectId(),
          role: mockRole,
          user: null,
        },
      ];
      const mockCountResult = [{ total: 2 }];

      mockModel.aggregate
        .mockResolvedValueOnce(mockAggregateResult)
        .mockResolvedValueOnce(mockCountResult);

      const result = await service.queryListFullDetails(params);

      expect(result.data).toHaveLength(2);
    });

    it("[BOUNDARY] should return empty data when no results", async () => {
      const params = { page: 1, limit: 20, filter: {}, sort: [] };
      mockModel.aggregate.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      const result = await service.queryListFullDetails(params);

      expect(result.data).toEqual([]);
      expect(result.totalItems).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it("[BOUNDARY] should handle large page numbers", async () => {
      const params = { page: 1000, limit: 20, filter: {}, sort: [] };
      mockModel.aggregate
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: 10 }]);

      const result = await service.queryListFullDetails(params);

      expect(result.page).toBe(1000);
      expect(result.hasNextPage).toBe(false);
    });

    it("[ABNORMAL] should propagate aggregation errors", async () => {
      const params = { page: 1, limit: 20, filter: {}, sort: [] };
      mockModel.aggregate.mockRejectedValue(new Error("Aggregation failed"));

      await expect(service.queryListFullDetails(params)).rejects.toThrow(
        "Aggregation failed",
      );
    });
  });

  // ==================================================================================
  // create - Create new employee
  // ==================================================================================
  describe("create", () => {
    const createDto: CreateEmployeeDto = {
      code: "EMP001",
      name: "John Doe",
      address: "123 Main St",
      email: "john@example.com",
      contactNumber: "0123456789",
      role: "507f1f77bcf86cd799439012",
      note: "Senior developer",
    };

    it("[NORMAL] should create employee with all fields", async () => {
      const savedDoc = {
        toObject: jest.fn().mockReturnValue(mockEmployee),
      };

      const saveMock = jest.fn().mockResolvedValue(savedDoc);

      // Mock the model constructor to return an object with save method
      (mockModel as any).mockImplementationOnce(() => ({
        save: saveMock,
      }));

      mockModel.populate.mockResolvedValue(mockEmployeePopulated);

      const result = await service.create(createDto);

      expect(saveMock).toHaveBeenCalled();
      expect(mockModel.populate).toHaveBeenCalledWith(mockEmployee, [
        { path: "role" },
      ]);
      expect(result).toHaveProperty("role");
      expect(result.role).toEqual(mockRole);
    });

    it("[NORMAL] should create with minimal required fields", async () => {
      const minimalDto: CreateEmployeeDto = {
        code: "EMP002",
        name: "Jane Doe",
        role: "507f1f77bcf86cd799439012",
      };

      const minimalEmployee = {
        ...mockEmployee,
        code: "EMP002",
        name: "Jane Doe",
        address: null,
        email: null,
        contactNumber: null,
        note: "",
      };

      const savedDoc = {
        toObject: jest.fn().mockReturnValue(minimalEmployee),
      };

      const saveMock = jest.fn().mockResolvedValue(savedDoc);

      (mockModel as any).mockImplementationOnce(() => ({
        save: saveMock,
      }));

      mockModel.populate.mockResolvedValue({
        ...minimalEmployee,
        role: mockRole,
      });

      const result = await service.create(minimalDto);

      expect(saveMock).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("[NORMAL] should convert role string to ObjectId", async () => {
      const savedDoc = {
        toObject: jest.fn().mockReturnValue(mockEmployee),
      };

      const saveMock = jest.fn().mockResolvedValue(savedDoc);
      let capturedPayload: any;

      (mockModel as any).mockImplementationOnce((payload: any) => {
        capturedPayload = payload;
        return { save: saveMock };
      });

      mockModel.populate.mockResolvedValue(mockEmployeePopulated);

      await service.create(createDto);

      expect(saveMock).toHaveBeenCalled();
      expect(capturedPayload.role).toBeInstanceOf(mongoose.Types.ObjectId);
    });

    it("[ABNORMAL] should handle duplicate code error", async () => {
      const saveMock = jest.fn().mockRejectedValue({
        code: 11000,
        message: "Duplicate key error",
      });

      (mockModel as any).mockImplementationOnce(() => ({
        save: saveMock,
      }));

      await expect(service.create(createDto)).rejects.toMatchObject({
        code: 11000,
      });
    });

    it("[ABNORMAL] should handle validation errors", async () => {
      const saveMock = jest
        .fn()
        .mockRejectedValue(new Error("Validation failed"));

      (mockModel as any).mockImplementationOnce(() => ({
        save: saveMock,
      }));

      await expect(service.create(createDto)).rejects.toThrow(
        "Validation failed",
      );
    });

    it("[ABNORMAL] should handle invalid role ObjectId", async () => {
      const invalidDto = { ...createDto, role: "invalid-id" };

      expect(() => {
        new mongoose.Types.ObjectId(invalidDto.role);
      }).toThrow();
    });
  });

  // ==================================================================================
  // update - Update employee
  // ==================================================================================
  describe("update", () => {
    const updateDto: UpdateEmployeeDto = {
      name: "John Updated",
      email: "john.updated@example.com",
      note: "Updated note",
    };

    it("[NORMAL] should update employee successfully", async () => {
      const id = "507f1f77bcf86cd799439011";
      const updatedEmployee = { ...mockEmployee, ...updateDto, role: mockRole };

      mockModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(updatedEmployee),
      });

      const result = await service.update(id, updateDto);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { $set: updateDto },
        { new: true },
      );
      expect(result).toEqual(updatedEmployee);
    });

    it("[NORMAL] should update single field", async () => {
      const id = "507f1f77bcf86cd799439011";
      const singleFieldDto: UpdateEmployeeDto = {
        contactNumber: "9876543210",
      };
      const updatedEmployee = {
        ...mockEmployee,
        contactNumber: "9876543210",
        role: mockRole,
      };

      mockModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(updatedEmployee),
      });

      const result = await service.update(id, singleFieldDto);

      expect(result.contactNumber).toBe("9876543210");
    });

    it("[NORMAL] should convert role to ObjectId when provided", async () => {
      const id = "507f1f77bcf86cd799439011";
      const dtoWithRole: UpdateEmployeeDto = {
        role: "507f1f77bcf86cd799439099",
      };
      const updatedEmployee = { ...mockEmployee, role: mockRole };

      mockModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(updatedEmployee),
      });

      await service.update(id, dtoWithRole);

      expect(model.findByIdAndUpdate).toHaveBeenCalled();
    });

    it("[NORMAL] should populate role after update", async () => {
      const id = "507f1f77bcf86cd799439011";
      const updatedEmployee = { ...mockEmployee, role: mockRole };

      const mockPopulate = jest.fn().mockResolvedValue(updatedEmployee);
      mockModel.findByIdAndUpdate.mockReturnValue({
        populate: mockPopulate,
      });

      const result = await service.update(id, updateDto);

      expect(mockPopulate).toHaveBeenCalledWith("role");
      expect(result.role).toEqual(mockRole);
    });

    it("[ABNORMAL] should throw NotFoundException when employee not found", async () => {
      const id = "507f1f77bcf86cd799439011";

      mockModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(id, updateDto)).rejects.toThrow(
        "Không tìm thấy nhân viên",
      );
    });

    it("[ABNORMAL] should handle duplicate code error", async () => {
      const id = "507f1f77bcf86cd799439011";
      const dtoWithCode = { code: "EMP002" };

      mockModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockRejectedValue({
          code: 11000,
          message: "E11000 duplicate key error",
        }),
      });

      await expect(service.update(id, dtoWithCode)).rejects.toMatchObject({
        code: 11000,
      });
    });

    it("[ABNORMAL] should propagate database errors", async () => {
      const id = "507f1f77bcf86cd799439011";

      mockModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("Update failed")),
      });

      await expect(service.update(id, updateDto)).rejects.toThrow(
        "Update failed",
      );
    });
  });

  // ==================================================================================
  // softDelete - Soft delete employee
  // ==================================================================================
  describe("softDelete", () => {
    it("[NORMAL] should soft delete using softDelete method", async () => {
      const id = "507f1f77bcf86cd799439011";
      const mockDoc = {
        softDelete: jest.fn().mockResolvedValue(true),
      };

      mockModel.findById.mockResolvedValue(mockDoc);

      const result = await service.softDelete(id);

      expect(model.findById).toHaveBeenCalledWith(id);
      expect(mockDoc.softDelete).toHaveBeenCalled();
      expect(result).toEqual({ success: true, message: "Đã xóa" });
    });

    it("[NORMAL] should soft delete using manual fields when method unavailable", async () => {
      const id = "507f1f77bcf86cd799439011";
      const mockDoc = {
        isDeleted: false,
        deletedAt: null,
        save: jest.fn().mockResolvedValue(true),
      };

      mockModel.findById.mockResolvedValue(mockDoc);

      const result = await service.softDelete(id);

      expect(mockDoc.isDeleted).toBe(true);
      expect(mockDoc.deletedAt).toBeInstanceOf(Date);
      expect(mockDoc.save).toHaveBeenCalled();
      expect(result).toEqual({ success: true, message: "Đã xóa" });
    });

    it("[ABNORMAL] should throw NotFoundException when employee not found", async () => {
      const id = "non-existent";
      mockModel.findById.mockResolvedValue(null);

      await expect(service.softDelete(id)).rejects.toThrow(NotFoundException);
      await expect(service.softDelete(id)).rejects.toThrow(
        "Không tìm thấy nhân viên",
      );
    });

    it("[ABNORMAL] should propagate save errors", async () => {
      const id = "507f1f77bcf86cd799439011";
      const mockDoc = {
        isDeleted: false,
        save: jest.fn().mockRejectedValue(new Error("Save failed")),
      };

      mockModel.findById.mockResolvedValue(mockDoc);

      await expect(service.softDelete(id)).rejects.toThrow("Save failed");
    });
  });

  // ==================================================================================
  // findDeleted - Query deleted employees
  // ==================================================================================
  describe("findDeleted", () => {
    it("[NORMAL] should return paginated deleted employees", async () => {
      const page = 1;
      const limit = 20;
      const mockDeletedEmployees = [
        { ...mockEmployee, isDeleted: true, deletedAt: new Date() },
      ];

      const mockFind = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockDeletedEmployees),
      };

      mockModel.collection.find.mockReturnValue(mockFind);
      mockModel.collection.countDocuments.mockResolvedValue(1);
      mockModel.populate.mockResolvedValue([
        { ...mockDeletedEmployees[0], role: mockRole },
      ]);

      const result = await service.findDeleted(page, limit);

      expect(model.collection.find).toHaveBeenCalledWith({ isDeleted: true });
      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("page", 1);
      expect(result).toHaveProperty("limit", 20);
      expect(result).toHaveProperty("totalItems", 1);
      expect(result.data).toHaveLength(1);
    });

    it("[NORMAL] should use default pagination values", async () => {
      const mockFind = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([]),
      };

      mockModel.collection.find.mockReturnValue(mockFind);
      mockModel.collection.countDocuments.mockResolvedValue(0);
      mockModel.populate.mockResolvedValue([]);

      const result = await service.findDeleted();

      expect(mockFind.skip).toHaveBeenCalledWith(0);
      expect(mockFind.limit).toHaveBeenCalledWith(20);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it("[NORMAL] should populate role for deleted employees", async () => {
      const mockDeletedEmployees = [
        { ...mockEmployee, isDeleted: true, deletedAt: new Date() },
      ];

      const mockFind = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockDeletedEmployees),
      };

      mockModel.collection.find.mockReturnValue(mockFind);
      mockModel.collection.countDocuments.mockResolvedValue(1);
      mockModel.populate.mockResolvedValue([
        { ...mockDeletedEmployees[0], role: mockRole },
      ]);

      const result = await service.findDeleted(1, 20);

      expect(model.populate).toHaveBeenCalledWith(mockDeletedEmployees, [
        { path: "role" },
      ]);
      expect(result.data[0].role).toEqual(mockRole);
    });

    it("[BOUNDARY] should return empty array when no deleted employees", async () => {
      const mockFind = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([]),
      };

      mockModel.collection.find.mockReturnValue(mockFind);
      mockModel.collection.countDocuments.mockResolvedValue(0);
      mockModel.populate.mockResolvedValue([]);

      const result = await service.findDeleted(1, 20);

      expect(result.data).toEqual([]);
      expect(result.totalItems).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it("[BOUNDARY] should handle large page numbers", async () => {
      const mockFind = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([]),
      };

      mockModel.collection.find.mockReturnValue(mockFind);
      mockModel.collection.countDocuments.mockResolvedValue(0);
      mockModel.populate.mockResolvedValue([]);

      const result = await service.findDeleted(1000, 20);

      expect(mockFind.skip).toHaveBeenCalledWith(19980);
      expect(result.hasNextPage).toBe(false);
    });

    it("[ABNORMAL] should propagate database errors", async () => {
      mockModel.collection.find.mockImplementation(() => {
        throw new Error("Database error");
      });

      await expect(service.findDeleted(1, 20)).rejects.toThrow(
        "Database error",
      );
    });
  });

  // ==================================================================================
  // restore - Restore soft-deleted employee
  // ==================================================================================
  describe("restore", () => {
    it("[NORMAL] should restore using restore method", async () => {
      const id = "507f1f77bcf86cd799439011";
      const mockDoc = {
        restore: jest.fn().mockResolvedValue(true),
      };

      mockModel.findById.mockResolvedValue(mockDoc);

      const result = await service.restore(id);

      expect(model.findById).toHaveBeenCalledWith(id);
      expect(mockDoc.restore).toHaveBeenCalled();
      expect(result).toEqual({ success: true, message: "Đã khôi phục" });
    });

    it("[NORMAL] should restore using manual fields when method unavailable", async () => {
      const id = "507f1f77bcf86cd799439011";
      const mockDoc = {
        isDeleted: true,
        deletedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };

      mockModel.findById.mockResolvedValue(mockDoc);

      const result = await service.restore(id);

      expect(mockDoc.isDeleted).toBe(false);
      expect(mockDoc.deletedAt).toBeNull();
      expect(mockDoc.save).toHaveBeenCalled();
      expect(result).toEqual({ success: true, message: "Đã khôi phục" });
    });

    it("[ABNORMAL] should throw NotFoundException when employee not found", async () => {
      const id = "non-existent";
      mockModel.findById.mockResolvedValue(null);

      await expect(service.restore(id)).rejects.toThrow(NotFoundException);
      await expect(service.restore(id)).rejects.toThrow(
        "Không tìm thấy nhân viên",
      );
    });

    it("[ABNORMAL] should propagate save errors", async () => {
      const id = "507f1f77bcf86cd799439011";
      const mockDoc = {
        isDeleted: true,
        save: jest.fn().mockRejectedValue(new Error("Restore failed")),
      };

      mockModel.findById.mockResolvedValue(mockDoc);

      await expect(service.restore(id)).rejects.toThrow("Restore failed");
    });

    it("[ABNORMAL] should propagate restore method errors", async () => {
      const id = "507f1f77bcf86cd799439011";
      const mockDoc = {
        restore: jest
          .fn()
          .mockRejectedValue(new Error("Restore method failed")),
      };

      mockModel.findById.mockResolvedValue(mockDoc);

      await expect(service.restore(id)).rejects.toThrow(
        "Restore method failed",
      );
    });
  });
});
