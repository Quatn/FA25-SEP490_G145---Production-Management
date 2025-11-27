import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// --- Mock Data ---
const mockProduct = {
  _id: '6745d0f5e7115610c1866f93',
  code: 'PROD001',
  name: 'Test Product',
  customer: '6745d0f5e7115610c1866f94',
  productType: '6745d0f5e7115610c1866f95',
  wares: ['6745d0f5e7115610c1866f96'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  // Mock Service: Giả lập các hàm của ProductService
  const mockProductService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOneById: jest.fn(), // Lưu ý: Controller gọi findOneById
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // =================================================================
  // 1. TEST: create
  // =================================================================
  describe('create', () => {
    const createDto: CreateProductDto = {
      code: 'P01',
      name: 'Product 01',
      productName: 'Product 01 Full Name', // Dựa trên DTO
      customer: 'customerId',
      productType: 'typeId',
      wares: ['wareId'],
      description: 'desc',
    };

    it('[N] Normal: Should call service.create and return result', async () => {
      mockProductService.create.mockResolvedValue(mockProduct);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockProduct);
    });

    it('[A] Abnormal: Should propagate error if service throws', async () => {
      const error = new Error('Creation failed');
      mockProductService.create.mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow(error);
    });
  });

  // =================================================================
  // 2. TEST: findAll
  // =================================================================
  describe('findAll', () => {
    const mockResult = {
      data: [mockProduct],
      total: 1,
      page: 1,
      limit: 10,
    };

    it('[N] Normal: Should parse query params and call service', async () => {
      mockProductService.findAll.mockResolvedValue(mockResult);

      // Giả lập query params dạng string (vì @Query nhận string từ URL)
      await controller.findAll('1', '10', 'keyword', 'typeId', 'custId');

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'keyword',
        productType: 'typeId',
        customer: 'custId',
      });
    });

    it('[B] Boundary: Should handle missing optional params (undefined)', async () => {
      mockProductService.findAll.mockResolvedValue(mockResult);

      // Gọi không truyền tham số nào
      await controller.findAll(undefined, undefined, undefined, undefined, undefined);

      expect(service.findAll).toHaveBeenCalledWith({
        page: undefined,
        limit: undefined,
        search: undefined,
        productType: undefined,
        customer: undefined,
      });
    });

    it('[N] Normal: Should convert numeric strings correctly', async () => {
        mockProductService.findAll.mockResolvedValue(mockResult);
  
        await controller.findAll('5', '20'); // page=5, limit=20
  
        expect(service.findAll).toHaveBeenCalledWith({
          page: 5,
          limit: 20,
          search: undefined,
          productType: undefined,
          customer: undefined,
        });
      });
  });

  // =================================================================
  // 3. TEST: findOne
  // =================================================================
  describe('findOne', () => {
    it('[N] Normal: Should return a product by ID', async () => {
      mockProductService.findOneById.mockResolvedValue(mockProduct);

      const result = await controller.findOne('mockId');

      expect(service.findOneById).toHaveBeenCalledWith('mockId');
      expect(result).toEqual(mockProduct);
    });

    it('[A] Abnormal: Should propagate service error (e.g. Not Found)', async () => {
      mockProductService.findOneById.mockRejectedValue(new Error('Not Found'));
      await expect(controller.findOne('badId')).rejects.toThrow('Not Found');
    });
  });

  // =================================================================
  // 4. TEST: update
  // =================================================================
  describe('update', () => {
    const updateDto: UpdateProductDto = { name: 'Updated Name' };

    it('[N] Normal: Should update and return result', async () => {
      const updatedMock = { ...mockProduct, name: 'Updated Name' };
      mockProductService.update.mockResolvedValue(updatedMock);

      const result = await controller.update('mockId', updateDto);

      expect(service.update).toHaveBeenCalledWith('mockId', updateDto);
      expect(result).toEqual(updatedMock);
    });

    it('[A] Abnormal: Should propagate error if update fails', async () => {
        mockProductService.update.mockRejectedValue(new Error('Update failed'));
        await expect(controller.update('mockId', updateDto)).rejects.toThrow('Update failed');
    });
  });

  // =================================================================
  // 5. TEST: remove (Soft Delete)
  // =================================================================
  describe('remove', () => {
    it('[N] Normal: Should call remove service', async () => {
      const response = { success: true, message: 'Deleted' };
      mockProductService.remove.mockResolvedValue(response);

      const result = await controller.remove('mockId');

      expect(service.remove).toHaveBeenCalledWith('mockId');
      expect(result).toEqual(response);
    });

    it('[A] Abnormal: Should propagate error if remove fails', async () => {
        mockProductService.remove.mockRejectedValue(new Error('Delete failed'));
        await expect(controller.remove('mockId')).rejects.toThrow('Delete failed');
    });
  });
});