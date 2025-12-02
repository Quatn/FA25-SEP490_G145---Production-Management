import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryListFullDetailsEmployeeRequestDto } from './dto/query-list-full-details-employees.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import mongoose from 'mongoose';

// src/modules/employee/employee.controller.spec.ts

describe('EmployeeController', () => {
  let controller: EmployeeController;
  let service: EmployeeService;

  // Mock Data - Aligned with Employee schema
  const mockRole: any = {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
    code: 'ROLE001',
    name: 'Developer',
    description: 'Software Developer',
    note: 'Technical role',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser: any = {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
    username: 'johndoe',
    email: 'john@example.com',
    employee: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEmployee: any = {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    code: 'EMP001',
    name: 'John Doe',
    address: '123 Main St',
    email: 'john@example.com',
    contactNumber: '0123456789',
    role: mockRole,
    note: 'Senior developer',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFullDetailEmployee: any = {
    ...mockEmployee,
    user: mockUser,
  };

  const mockService = {
    queryListFullDetails: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    findDeleted: jest.fn(),
    restore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        {
          provide: EmployeeService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<EmployeeController>(EmployeeController);
    service = module.get<EmployeeService>(EmployeeService);

    jest.clearAllMocks();
  });

  describe('Definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
      expect(service).toBeDefined();
    });
  });

  // ==================================================================================
  // GET /query/full-details - Query full details employees
  // ==================================================================================
  describe('queryList', () => {
    it('[NORMAL] should return paginated list of employees with full details', async () => {
      const query: QueryListFullDetailsEmployeeRequestDto = {
        page: 1,
        limit: 20,
        query: 'John',
      };

      const mockResponse = {
        items: [mockFullDetailEmployee],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      mockService.queryListFullDetails.mockResolvedValue(mockResponse);

      const result = await controller.queryList(query);

      expect(service.queryListFullDetails).toHaveBeenCalledWith(query);
      expect(service.queryListFullDetails).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockResponse,
      });
    });

    it('[NORMAL] should return employees with populated role and user', async () => {
      const query: QueryListFullDetailsEmployeeRequestDto = {
        page: 1,
        limit: 20,
      };

      const mockResponse = {
        items: [mockFullDetailEmployee],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      mockService.queryListFullDetails.mockResolvedValue(mockResponse);

      const result = await controller.queryList(query);

      expect((result.data as any).items[0]).toHaveProperty('role');
      expect((result.data as any).items[0]).toHaveProperty('user');
      expect((result.data as any).items[0].role).toHaveProperty('code');
      expect((result.data as any).items[0].user).toHaveProperty('username');
    });

    it('[NORMAL] should handle empty query string', async () => {
      const query: QueryListFullDetailsEmployeeRequestDto = {
        page: 1,
        limit: 20,
      };

      const mockResponse = {
        items: [mockFullDetailEmployee],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      mockService.queryListFullDetails.mockResolvedValue(mockResponse);

      const result = await controller.queryList(query);

      expect(result.success).toBe(true);
      expect(service.queryListFullDetails).toHaveBeenCalledWith(query);
    });

    it('[BOUNDARY] should return empty data when no employees found', async () => {
      const query: QueryListFullDetailsEmployeeRequestDto = {
        page: 1,
        limit: 20,
        query: 'NonExistent',
      };

      const emptyResponse = {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      mockService.queryListFullDetails.mockResolvedValue(emptyResponse);

      const result = await controller.queryList(query);

      expect(result.data).toEqual(emptyResponse);
      expect((result.data as any).items).toHaveLength(0);
    });

    it('[BOUNDARY] should handle large page numbers', async () => {
      const query: QueryListFullDetailsEmployeeRequestDto = {
        page: 1000,
        limit: 20,
      };

      const emptyResponse = {
        items: [],
        total: 0,
        page: 1000,
        limit: 20,
        totalPages: 0,
      };

      mockService.queryListFullDetails.mockResolvedValue(emptyResponse);

      const result = await controller.queryList(query);

      expect(service.queryListFullDetails).toHaveBeenCalledWith(query);
      expect(result.success).toBe(true);
    });

    it('[ABNORMAL] should propagate service errors', async () => {
      const query: QueryListFullDetailsEmployeeRequestDto = {
        page: 1,
        limit: 20,
      };

      mockService.queryListFullDetails.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(controller.queryList(query)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('[ABNORMAL] should handle validation errors', async () => {
      const query: QueryListFullDetailsEmployeeRequestDto = {
        page: 1,
        limit: 20,
      };

      mockService.queryListFullDetails.mockRejectedValue(
        new BadRequestException('Invalid query parameters')
      );

      await expect(controller.queryList(query)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ==================================================================================
  // GET /query/get-employees-for-users-list - Query employees prioritizing those with users
  // ==================================================================================
  describe('queryListForUserLists', () => {
    it('[NORMAL] should return employees sorted by hasUser priority', async () => {
      const query: QueryListFullDetailsEmployeeRequestDto = {
        page: 1,
        limit: 20,
      };

      const mockResponse = {
        items: [mockFullDetailEmployee],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      mockService.queryListFullDetails.mockResolvedValue(mockResponse);

      const result = await controller.queryListForUserLists(query);

      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockResponse,
      });
      expect(service.queryListFullDetails).toHaveBeenCalledWith({
        ...query,
        sort: [{ hasUser: -1 }],
      });
    });

    it('[NORMAL] should prioritize employees with users', async () => {
      const query: QueryListFullDetailsEmployeeRequestDto = {
        page: 1,
        limit: 10,
        query: 'test',
      };

      const employeeWithUser = { ...mockEmployee, user: mockUser };
      const employeeWithoutUser = { ...mockEmployee, _id: 'emp-2', user: null };

      const mockResponse = {
        items: [employeeWithUser, employeeWithoutUser],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockService.queryListFullDetails.mockResolvedValue(mockResponse);

      const result = await controller.queryListForUserLists(query);

      expect(service.queryListFullDetails).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: [{ hasUser: -1 }],
        })
      );
      expect(result.success).toBe(true);
    });

    it('[BOUNDARY] should handle empty results', async () => {
      const query: QueryListFullDetailsEmployeeRequestDto = {
        page: 1,
        limit: 20,
      };

      const emptyResponse = {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      mockService.queryListFullDetails.mockResolvedValue(emptyResponse);

      const result = await controller.queryListForUserLists(query);

      expect(result.data).toEqual(emptyResponse);
      expect((result.data as any).items).toHaveLength(0);
    });

    it('[ABNORMAL] should propagate service errors', async () => {
      const query: QueryListFullDetailsEmployeeRequestDto = {
        page: 1,
        limit: 20,
      };

      mockService.queryListFullDetails.mockRejectedValue(
        new Error('Database error')
      );

      await expect(controller.queryListForUserLists(query)).rejects.toThrow(
        'Database error'
      );
    });
  });

  // ==================================================================================
  // POST / - Create new employee
  // ==================================================================================
  describe('create', () => {
    const createDto: CreateEmployeeDto = {
      code: 'EMP001',
      name: 'John Doe',
      address: '123 Main St',
      email: 'john@example.com',
      contactNumber: '0123456789',
      role: '507f1f77bcf86cd799439012',
      note: 'Senior developer',
    };

    it('[NORMAL] should create employee successfully', async () => {
      mockService.create.mockResolvedValue(mockEmployee);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Created',
        data: mockEmployee,
      });
    });

    it('[NORMAL] should create with all fields provided', async () => {
      mockService.create.mockResolvedValue(mockEmployee);

      const result = await controller.create(createDto);

      expect(result.data).toHaveProperty('code', 'EMP001');
      expect(result.data).toHaveProperty('name', 'John Doe');
      expect(result.data).toHaveProperty('address', '123 Main St');
      expect(result.data).toHaveProperty('email', 'john@example.com');
      expect(result.data).toHaveProperty('contactNumber', '0123456789');
      expect(result.data).toHaveProperty('role');
      expect(result.data).toHaveProperty('note', 'Senior developer');
    });

    it('[NORMAL] should create with minimal required fields only', async () => {
      const minimalDto: CreateEmployeeDto = {
        code: 'EMP002',
        name: 'Jane Doe',
        role: '507f1f77bcf86cd799439012',
      };

      const minimalEmployee = {
        ...mockEmployee,
        code: 'EMP002',
        name: 'Jane Doe',
        address: null,
        email: null,
        contactNumber: null,
        note: '',
      };

      mockService.create.mockResolvedValue(minimalEmployee);

      const result = await controller.create(minimalDto);

      expect(service.create).toHaveBeenCalledWith(minimalDto);
      expect(result.success).toBe(true);
    });

    it('[ABNORMAL] should throw error when code already exists', async () => {
      mockService.create.mockRejectedValue(
        new BadRequestException('Employee code already exists')
      );

      await expect(controller.create(createDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle invalid email format', async () => {
      const invalidDto = { ...createDto, email: 'invalid-email' };
      mockService.create.mockRejectedValue(
        new BadRequestException('Invalid email format')
      );

      await expect(controller.create(invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle validation errors', async () => {
      const invalidDto = { ...createDto, code: '' };
      mockService.create.mockRejectedValue(
        new BadRequestException('Code is required')
      );

      await expect(controller.create(invalidDto as CreateEmployeeDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle invalid role ObjectId', async () => {
      const invalidDto = { ...createDto, role: 'invalid-id' };
      mockService.create.mockRejectedValue(
        new BadRequestException('Invalid role ID')
      );

      await expect(controller.create(invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ==================================================================================
  // GET /:id - Get employee by id
  // ==================================================================================
  describe('getById', () => {
    it('[NORMAL] should return employee by id', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockService.findById.mockResolvedValue(mockEmployee);

      const result = await controller.getById(id);

      expect(service.findById).toHaveBeenCalledWith(
        new mongoose.Types.ObjectId(id)
      );
      expect(service.findById).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockEmployee,
      });
    });

    it('[NORMAL] should return complete employee data with all fields', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockService.findById.mockResolvedValue(mockEmployee);

      const result = await controller.getById(id);

      expect(result.data).toHaveProperty('code');
      expect(result.data).toHaveProperty('name');
      expect(result.data).toHaveProperty('address');
      expect(result.data).toHaveProperty('email');
      expect(result.data).toHaveProperty('contactNumber');
      expect(result.data).toHaveProperty('role');
      expect(result.data).toHaveProperty('note');
    });

    it('[ABNORMAL] should throw NotFoundException when employee not found', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockService.findById.mockResolvedValue(null);

      await expect(controller.getById(id)).rejects.toThrow(NotFoundException);
      await expect(controller.getById(id)).rejects.toThrow('Employee not found');
    });

    it('[ABNORMAL] should handle invalid ObjectId format', async () => {
      const invalidId = 'invalid-id-format';

      await expect(controller.getById(invalidId)).rejects.toThrow();
    });

    it('[ABNORMAL] should propagate service errors', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockService.findById.mockRejectedValue(new Error('Database error'));

      await expect(controller.getById(id)).rejects.toThrow('Database error');
    });
  });

  // ==================================================================================
  // PUT /:id - Update employee
  // ==================================================================================
  describe('update', () => {
    const updateDto: UpdateEmployeeDto = {
      name: 'John Updated',
      email: 'john.updated@example.com',
      note: 'Updated note',
    };

    it('[NORMAL] should update employee successfully', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updatedEmployee = {
        ...mockEmployee,
        name: 'John Updated',
        email: 'john.updated@example.com',
        note: 'Updated note',
      };

      mockService.update.mockResolvedValue(updatedEmployee);

      const result = await controller.update(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Updated',
        data: updatedEmployee,
      });
    });

    it('[NORMAL] should update single field', async () => {
      const id = '507f1f77bcf86cd799439011';
      const singleFieldDto: UpdateEmployeeDto = {
        contactNumber: '9876543210',
      };
      const updatedEmployee = {
        ...mockEmployee,
        contactNumber: '9876543210',
      };

      mockService.update.mockResolvedValue(updatedEmployee);

      const result = await controller.update(id, singleFieldDto);

      expect(service.update).toHaveBeenCalledWith(id, singleFieldDto);
      expect((result.data as any).contactNumber).toBe('9876543210');
    });

    it('[NORMAL] should update multiple fields', async () => {
      const id = '507f1f77bcf86cd799439011';
      const multiFieldDto: UpdateEmployeeDto = {
        name: 'New Name',
        address: 'New Address',
        email: 'new@example.com',
        contactNumber: '1111111111',
      };
      const updatedEmployee = { ...mockEmployee, ...multiFieldDto };

      mockService.update.mockResolvedValue(updatedEmployee);

      const result = await controller.update(id, multiFieldDto);

      expect(service.update).toHaveBeenCalledWith(id, multiFieldDto);
      expect(result.success).toBe(true);
    });

    it('[ABNORMAL] should throw NotFoundException if employee not found', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockService.update.mockRejectedValue(
        new NotFoundException('Employee not found')
      );

      await expect(controller.update(id, updateDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('[ABNORMAL] should handle duplicate code error', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateWithCode = { code: 'EMP002' };
      mockService.update.mockRejectedValue(
        new BadRequestException('Code already exists')
      );

      await expect(controller.update(id, updateWithCode)).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle invalid email format', async () => {
      const id = '507f1f77bcf86cd799439011';
      const invalidDto = { email: 'invalid-email' };
      mockService.update.mockRejectedValue(
        new BadRequestException('Invalid email format')
      );

      await expect(controller.update(id, invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should propagate service errors', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockService.update.mockRejectedValue(new Error('Update failed'));

      await expect(controller.update(id, updateDto)).rejects.toThrow(
        'Update failed'
      );
    });
  });

  // ==================================================================================
  // DELETE /:id - Soft delete employee
  // ==================================================================================
  describe('softDelete', () => {
    it('[NORMAL] should soft delete successfully', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockService.softDelete.mockResolvedValue({
        message: 'Employee deleted successfully',
      });

      const result = await controller.softDelete(id);

      expect(service.softDelete).toHaveBeenCalledWith(id);
      expect(service.softDelete).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Employee deleted successfully',
      });
    });

    it('[NORMAL] should use default message when service returns no message', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockService.softDelete.mockResolvedValue({});

      const result = await controller.softDelete(id);

      expect(result).toEqual({
        success: true,
        message: 'Deleted',
      });
    });

    it('[ABNORMAL] should throw NotFoundException when employee not found', async () => {
      const id = 'non-existent';
      mockService.softDelete.mockRejectedValue(
        new NotFoundException('Employee not found')
      );

      await expect(controller.softDelete(id)).rejects.toThrow(
        NotFoundException
      );
    });

    it('[ABNORMAL] should propagate error if deletion fails', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockService.softDelete.mockRejectedValue(new Error('Deletion failed'));

      await expect(controller.softDelete(id)).rejects.toThrow('Deletion failed');
    });

    it('[ABNORMAL] should handle already deleted employee', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockService.softDelete.mockRejectedValue(
        new BadRequestException('Employee is already deleted')
      );

      await expect(controller.softDelete(id)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ==================================================================================
  // GET /query/deleted - Query deleted employees
  // ==================================================================================
  describe('queryDeleted', () => {
    it('[NORMAL] should return paginated list of deleted employees', async () => {
      const page = 1;
      const limit = 20;

      const mockDeletedResponse = {
        items: [{ ...mockEmployee, deletedAt: new Date() }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      mockService.findDeleted.mockResolvedValue(mockDeletedResponse);

      const result = await controller.queryDeleted(page, limit);

      expect(service.findDeleted).toHaveBeenCalledWith(page, limit);
      expect(service.findDeleted).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockDeletedResponse,
      });
    });

    it('[NORMAL] should use default pagination values', async () => {
      const mockDeletedResponse = {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      mockService.findDeleted.mockResolvedValue(mockDeletedResponse);

      await controller.queryDeleted(undefined, undefined);

      expect(service.findDeleted).toHaveBeenCalledWith(1, 20);
    });

    it('[NORMAL] should handle custom pagination', async () => {
      const page = 3;
      const limit = 50;

      const mockDeletedResponse = {
        items: [],
        total: 0,
        page: 3,
        limit: 50,
        totalPages: 0,
      };

      mockService.findDeleted.mockResolvedValue(mockDeletedResponse);

      await controller.queryDeleted(page, limit);

      expect(service.findDeleted).toHaveBeenCalledWith(3, 50);
    });

    it('[BOUNDARY] should return empty array when no deleted employees', async () => {
      const emptyResponse = {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      mockService.findDeleted.mockResolvedValue(emptyResponse);

      const result = await controller.queryDeleted(1, 20);

      expect(result.data).toEqual(emptyResponse);
      expect((result.data as any).items).toHaveLength(0);
    });

    it('[BOUNDARY] should handle large page numbers', async () => {
      const emptyResponse = {
        items: [],
        total: 0,
        page: 1000,
        limit: 20,
        totalPages: 0,
      };

      mockService.findDeleted.mockResolvedValue(emptyResponse);

      const result = await controller.queryDeleted(1000, 20);

      expect(service.findDeleted).toHaveBeenCalledWith(1000, 20);
      expect(result.success).toBe(true);
    });

    it('[ABNORMAL] should propagate service errors', async () => {
      mockService.findDeleted.mockRejectedValue(new Error('Database error'));

      await expect(controller.queryDeleted(1, 20)).rejects.toThrow(
        'Database error'
      );
    });
  });

  // ==================================================================================
  // POST /:id/restore - Restore soft-deleted employee
  // ==================================================================================
  describe('restore', () => {
    it('[NORMAL] should restore successfully', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockService.restore.mockResolvedValue({
        message: 'Employee restored successfully',
      });

      const result = await controller.restore(id);

      expect(service.restore).toHaveBeenCalledWith(id);
      expect(service.restore).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Employee restored successfully',
      });
    });

    it('[NORMAL] should use default message when service returns no message', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockService.restore.mockResolvedValue({});

      const result = await controller.restore(id);

      expect(result).toEqual({
        success: true,
        message: 'Restored',
      });
    });

    it('[ABNORMAL] should throw NotFoundException if employee not found', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockService.restore.mockRejectedValue(
        new NotFoundException('Employee not found')
      );

      await expect(controller.restore(id)).rejects.toThrow(NotFoundException);
    });

    it('[ABNORMAL] should handle employee not in deleted state', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockService.restore.mockRejectedValue(
        new BadRequestException('Employee is not deleted')
      );

      await expect(controller.restore(id)).rejects.toThrow(BadRequestException);
    });

    it('[ABNORMAL] should propagate service errors', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockService.restore.mockRejectedValue(new Error('Restore failed'));

      await expect(controller.restore(id)).rejects.toThrow('Restore failed');
    });
  });
});