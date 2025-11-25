import { Test, TestingModule } from '@nestjs/testing';
import { ProductTypeController } from './product-type.controller';
import { ProductTypeService } from './product-type.service';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProductTypeController', () => {
  let controller: ProductTypeController;
  let service: ProductTypeService;

  // 1. Mock Service - Cập nhật để khớp với tên hàm mới
  const mockProductTypeService = {
    findPaginated: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    createOne: jest.fn(), 
    updateOne: jest.fn(), 
    softDelete: jest.fn(),
    restore: jest.fn(),
    removeHard: jest.fn(), 
  };

  // 2. Mock Data (Dựa trên Schema ProductType)
  const mockDoc = {
    _id: 'some-id',
    code: 'PT01',
    name: 'Loại sản phẩm 1',
    description: 'Mô tả test',
    note: 'Ghi chú test',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductTypeController],
      providers: [
        {
          provide: ProductTypeService,
          useValue: mockProductTypeService,
        },
      ],
    }).compile();

    controller = module.get<ProductTypeController>(ProductTypeController);
    service = module.get<ProductTypeService>(ProductTypeService);
    jest.clearAllMocks(); // Đảm bảo clear mocks trước mỗi test
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ---------------------------------------------------------
  // 🟩 NORMAL CASES (Happy Path)
  // ---------------------------------------------------------

  describe('findPaginated (N)', () => {
    it('should return paginated list', async () => {
      const mockResult = { data: [mockDoc], page: 1, limit: 10, totalItems: 1, totalPages: 1 };
      mockProductTypeService.findPaginated.mockResolvedValue(mockResult);

      const result = await controller.findPaginated(1, 10, 'test');

      expect(service.findPaginated).toHaveBeenCalledWith(1, 10, 'test');
      expect(result.data).toEqual(mockResult);
      expect(result.message).toBe('Fetch successful');
    });
  });

  describe('findAll (N)', () => {
    it('should return all items', async () => {
      mockProductTypeService.findAll.mockResolvedValue([mockDoc]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result.data).toEqual([mockDoc]);
    });
  });

  describe('findOne (N)', () => {
    it('should return one item by id', async () => {
      mockProductTypeService.findOne.mockResolvedValue(mockDoc);

      const result = await controller.findOne('some-id');

      expect(service.findOne).toHaveBeenCalledWith('some-id');
      expect(result.data).toEqual(mockDoc);
    });
  });

  describe('create (N)', () => {
    it('should create a new product type', async () => {
      const dto: CreateProductTypeDto = { code: 'PT01', name: 'Loại sản phẩm 1', description: '', note: '' };
      mockProductTypeService.createOne.mockResolvedValue(mockDoc);

      const result = await controller.create(dto);

      expect(service.createOne).toHaveBeenCalledWith(dto);
      expect(result.message).toBe(`Created type PT01 - Loại sản phẩm 1 successfully`);
      expect(result.data).toEqual(mockDoc);
    });
  });

  describe('update (N)', () => {
    it('should update an existing product type', async () => {
      const dto: UpdateProductTypeDto = { name: 'Updated Name' };
      const updatedDoc = { ...mockDoc, name: 'Updated Name' };

      mockProductTypeService.updateOne.mockResolvedValue(updatedDoc);

      const result = await controller.update('some-id', dto);

      expect(service.updateOne).toHaveBeenCalledWith('some-id', dto);
      expect(result.message).toBe(`Updated type PT01 - Updated Name successfully`);
      expect(result.data).toEqual(updatedDoc);
    });
  });

  describe('softDelete (N)', () => {
    it('should soft delete the item', async () => {
      mockProductTypeService.softDelete.mockResolvedValue({ success: true });

      const result = await controller.softDelete('some-id');

      expect(service.softDelete).toHaveBeenCalledWith('some-id');
      expect(result.message).toBe('Soft deleted successfully');
      expect(result.data).toBeNull();
    });
  });

  describe('restore (N)', () => {
    it('should restore the item', async () => {
      mockProductTypeService.restore.mockResolvedValue({ success: true });

      const result = await controller.restore('some-id');

      expect(service.restore).toHaveBeenCalledWith('some-id');
      expect(result.message).toBe('Restored successfully');
      expect(result.data).toBeNull();
    });
  });

  describe('hardDelete (N)', () => {
    it('should permanently delete the item', async () => {
      mockProductTypeService.removeHard.mockResolvedValue({ success: true });

      const result = await controller.hardDelete('some-id');

      expect(service.removeHard).toHaveBeenCalledWith('some-id');
      expect(result.message).toBe('Permanently deleted successfully');
      expect(result.data).toBeNull();
    });
  });

  // ---------------------------------------------------------
  // 🟥 ABNORMAL CASES (Error Handling)
  // ---------------------------------------------------------

  describe('findOne (A)', () => {
    it('should throw NotFoundException when findOne fails (ID not found)', async () => {
      mockProductTypeService.findOne.mockRejectedValue(new NotFoundException('Product type not found'));

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(controller.findOne('non-existent-id')).rejects.toThrow('Product type not found');
    });
  });

  describe('create (A)', () => {
    it('should throw BadRequestException when createOne fails (e.g., duplicate code)', async () => {
      const dto: CreateProductTypeDto = { code: 'PT01', name: 'Loại sản phẩm 1', description: '', note: '' };
      mockProductTypeService.createOne.mockRejectedValue(new BadRequestException('Mã loại sản phẩm "PT01" đã tồn tại.'));

      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
      await expect(controller.create(dto)).rejects.toThrow('Mã loại sản phẩm "PT01" đã tồn tại.');
    });
  });

  describe('update (A)', () => {
    it('should throw BadRequestException when updateOne fails (e.g., duplicate code)', async () => {
      const dto: UpdateProductTypeDto = { code: 'PT01' };
      mockProductTypeService.updateOne.mockRejectedValue(new BadRequestException('Mã loại sản phẩm "PT01" đã tồn tại.'));

      await expect(controller.update('some-id', dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when updateOne fails (ID not found)', async () => {
      const dto: UpdateProductTypeDto = { name: 'New Name' };
      mockProductTypeService.updateOne.mockRejectedValue(new NotFoundException('Product type not found'));

      await expect(controller.update('non-existent-id', dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete (A)', () => {
    it('should throw NotFoundException when softDelete fails (ID not found)', async () => {
      mockProductTypeService.softDelete.mockRejectedValue(new NotFoundException('Product type not found'));

      await expect(controller.softDelete('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('hardDelete (A)', () => {
    it('should throw NotFoundException when removeHard fails (ID not found)', async () => {
      mockProductTypeService.removeHard.mockRejectedValue(new NotFoundException('Product type not found'));

      await expect(controller.hardDelete('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});