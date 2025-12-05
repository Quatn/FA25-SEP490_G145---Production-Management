import { Test, TestingModule } from '@nestjs/testing';
import { WareFinishingProcessTypeController } from './ware-finishing-process-type.controller';
import { WareFinishingProcessTypeService } from './ware-finishing-process-type.service';
import { CreateWareFinishingProcessTypeDto } from './dto/create-ware-finishing-process-type.dto';
import { UpdateWareFinishingProcessTypeDto } from './dto/update-ware-finishing-process-type.dto';

describe('WareFinishingProcessTypeController', () => {
  let controller: WareFinishingProcessTypeController;
  let service: WareFinishingProcessTypeService;

  // 1. Tạo Mock Data mẫu để tái sử dụng
  const mockDoc = {
    _id: '64c9e1b2f1b2f1b2f1b2f1b2',
    code: 'WFP-001',
    name: 'Polishing',
    description: 'Standard polishing',
    note: 'None',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginatedList = {
    docs: [mockDoc],
    totalDocs: 1,
    limit: 10,
    totalPages: 1,
    page: 1,
    pagingCounter: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  };

  // 2. Tạo Mock Service implementation
  const mockService = {
    findPaginated: jest.fn().mockResolvedValue(mockPaginatedList),
    findAll: jest.fn().mockResolvedValue([mockDoc]),
    findOne: jest.fn().mockResolvedValue(mockDoc),
    createOne: jest.fn().mockResolvedValue(mockDoc),
    updateOne: jest.fn().mockResolvedValue(mockDoc),
    softDelete: jest.fn().mockResolvedValue(undefined),
    restore: jest.fn().mockResolvedValue(undefined),
    removeHard: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WareFinishingProcessTypeController],
      providers: [
        {
          provide: WareFinishingProcessTypeService,
          useValue: mockService, // Inject Mock Service
        },
      ],
    }).compile();

    controller = module.get<WareFinishingProcessTypeController>(
      WareFinishingProcessTypeController,
    );
    service = module.get<WareFinishingProcessTypeService>(
      WareFinishingProcessTypeService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- TEST: FIND PAGINATED ---
  describe('findPaginated', () => {
    it('should return a paginated list wrapped in BaseResponse', async () => {
      const page = 1;
      const limit = 10;
      const search = 'test';

      const result = await controller.findPaginated(page, limit, search);

      expect(service.findPaginated).toHaveBeenCalledWith(page, limit, search);
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockPaginatedList,
      });
    });
  });

  // --- TEST: FIND ALL ---
  describe('findAll', () => {
    it('should return all types wrapped in BaseResponse', async () => {
      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: [mockDoc],
      });
    });
  });

  // --- TEST: FIND ONE ---
  describe('findOne', () => {
    it('should return a single type detail', async () => {
      const id = 'some-id';
      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockDoc,
      });
    });
  });

  // --- TEST: CREATE ---
  describe('create', () => {
    it('should create a new type and return success message with code/name', async () => {
      const dto: CreateWareFinishingProcessTypeDto = {
        code: 'WFP-001',
        name: 'Polishing',
        description: 'Desc',
        note: 'Note',
      };

      const result = await controller.create(dto);

      expect(service.createOne).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        success: true,
        message: `Created type ${mockDoc.code} - ${mockDoc.name} successfully`,
        data: mockDoc,
      });
    });
  });

  // --- TEST: UPDATE ---
  describe('update', () => {
    it('should update a type and return success message', async () => {
      const id = 'some-id';
      const dto: UpdateWareFinishingProcessTypeDto = {
        name: 'Updated Name',
      };

      const result = await controller.update(id, dto);

      expect(service.updateOne).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual({
        success: true,
        message: `Updated type ${mockDoc.code} - ${mockDoc.name} successfully`,
        data: mockDoc,
      });
    });
  });

  // --- TEST: SOFT DELETE ---
  describe('softDelete', () => {
    it('should soft delete and return null data', async () => {
      const id = 'some-id';
      const result = await controller.softDelete(id);

      expect(service.softDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual({
        success: true,
        message: 'Soft deleted successfully',
        data: null,
      });
    });
  });

  // --- TEST: RESTORE ---
  describe('restore', () => {
    it('should restore and return null data', async () => {
      const id = 'some-id';
      const result = await controller.restore(id);

      expect(service.restore).toHaveBeenCalledWith(id);
      expect(result).toEqual({
        success: true,
        message: 'Restored successfully',
        data: null,
      });
    });
  });

  // --- TEST: HARD DELETE ---
  describe('hardDelete', () => {
    it('should permanently delete and return null data', async () => {
      const id = 'some-id';
      const result = await controller.hardDelete(id);

      expect(service.removeHard).toHaveBeenCalledWith(id);
      expect(result).toEqual({
        success: true,
        message: 'Permanently deleted successfully',
        data: null,
      });
    });
  });
});