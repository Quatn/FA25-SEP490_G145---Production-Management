import { Test, TestingModule } from '@nestjs/testing';
import { WareManufacturingProcessTypeController } from './ware-manufacturing-process-type.controller';
import { WareManufacturingProcessTypeService } from './ware-manufacturing-process-type.service';
import { CreateWareManufacturingProcessTypeDto } from './dto/create-ware-manufacturing-process-type.dto';
import { UpdateWareManufacturingProcessTypeDto } from './dto/update-ware-manufacturing-process-type.dto';

//src/modules/production/ware-manufacturing-process-type/ware-manufacturing-process-type.controller.spec.ts

describe('WareManufacturingProcessTypeController', () => {
  let controller: WareManufacturingProcessTypeController;
  let service: WareManufacturingProcessTypeService;

  // 1. Tạo Mock Object cho Service
  // Chỉ mock các hàm public được gọi trong Controller
  const mockService = {
    findPaginated: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    createOne: jest.fn(),
    updateOne: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    removeHard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WareManufacturingProcessTypeController],
      providers: [
        {
          provide: WareManufacturingProcessTypeService,
          useValue: mockService, // Sử dụng Mock thay vì Service thật
        },
      ],
    }).compile();

    controller = module.get<WareManufacturingProcessTypeController>(
      WareManufacturingProcessTypeController,
    );
    service = module.get<WareManufacturingProcessTypeService>(
      WareManufacturingProcessTypeService,
    );

    // Reset mocks trước mỗi test case để đảm bảo tính độc lập
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ==========================================
  // 1. Test findPaginated (GET /list)
  // ==========================================
  describe('findPaginated', () => {
    it('should return paginated list wrapped in BaseResponse', async () => {
      const mockResult = {
        data: [],
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };

      // Giả lập service trả về kết quả trên
      mockService.findPaginated.mockResolvedValue(mockResult);

      const result = await controller.findPaginated(1, 10, 'search');

      // Kiểm tra service được gọi đúng tham số
      expect(service.findPaginated).toHaveBeenCalledWith(1, 10, 'search');
      // Kiểm tra kết quả trả về từ controller
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockResult,
      });
    });
  });

  // ==========================================
  // 2. Test findAll (GET /list-all)
  // ==========================================
  describe('findAll', () => {
    it('should return all types', async () => {
      const mockDocs = [{ code: 'A', name: 'Type A' }];
      mockService.findAll.mockResolvedValue(mockDocs);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockDocs,
      });
    });
  });

  // ==========================================
  // 3. Test findOne (GET /detail/:id)
  // ==========================================
  describe('findOne', () => {
    it('should return one type details', async () => {
      const mockDoc = { _id: '123', code: 'A' };
      mockService.findOne.mockResolvedValue(mockDoc);

      const result = await controller.findOne('123');

      expect(service.findOne).toHaveBeenCalledWith('123');
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockDoc,
      });
    });
  });

  // ==========================================
  // 4. Test create (POST /create)
  // ==========================================
  describe('create', () => {
    it('should create a new type and return success message', async () => {
      const dto: CreateWareManufacturingProcessTypeDto = {
        code: 'NEW',
        name: 'New Type',
        description: 'Desc',
        note: 'Note',
      };
      
      const createdDoc = { ...dto, _id: 'new_id' };
      mockService.createOne.mockResolvedValue(createdDoc);

      const result = await controller.create(dto);

      expect(service.createOne).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        success: true,
        message: `Created type ${createdDoc.code} - ${createdDoc.name} successfully`,
        data: createdDoc,
      });
    });
  });

  // ==========================================
  // 5. Test update (PATCH /update/:id)
  // ==========================================
  describe('update', () => {
    it('should update type and return success message', async () => {
      const dto: UpdateWareManufacturingProcessTypeDto = { name: 'Updated Name' };
      const updatedDoc = { _id: '123', code: 'CODE', name: 'Updated Name' };
      
      mockService.updateOne.mockResolvedValue(updatedDoc);

      const result = await controller.update('123', dto);

      expect(service.updateOne).toHaveBeenCalledWith('123', dto);
      expect(result).toEqual({
        success: true,
        message: `Updated type ${updatedDoc.code} - ${updatedDoc.name} successfully`,
        data: updatedDoc,
      });
    });
  });

  // ==========================================
  // 6. Test softDelete (DELETE /delete-soft/:id)
  // ==========================================
  describe('softDelete', () => {
    it('should soft delete and return success', async () => {
      mockService.softDelete.mockResolvedValue({ success: true });

      const result = await controller.softDelete('123');

      expect(service.softDelete).toHaveBeenCalledWith('123');
      expect(result).toEqual({
        success: true,
        message: 'Soft deleted successfully',
        data: null,
      });
    });
  });

  // ==========================================
  // 7. Test restore (PATCH /restore/:id)
  // ==========================================
  describe('restore', () => {
    it('should restore and return success', async () => {
      mockService.restore.mockResolvedValue({ success: true });

      const result = await controller.restore('123');

      expect(service.restore).toHaveBeenCalledWith('123');
      expect(result).toEqual({
        success: true,
        message: 'Restored successfully',
        data: null,
      });
    });
  });

  // ==========================================
  // 8. Test hardDelete (DELETE /delete-hard/:id)
  // ==========================================
  describe('hardDelete', () => {
    it('should hard delete and return success', async () => {
      mockService.removeHard.mockResolvedValue({ success: true });

      const result = await controller.hardDelete('123');

      expect(service.removeHard).toHaveBeenCalledWith('123');
      expect(result).toEqual({
        success: true,
        message: 'Permanently deleted successfully',
        data: null,
      });
    });
  });
});