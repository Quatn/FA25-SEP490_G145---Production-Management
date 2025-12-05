import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from '../schemas/product.schema';
import { NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// --- Mock Data ---
const mockProduct = {
  _id: 'prodId',
  code: 'P01',
  name: 'Product 01',
  productName: 'Product 01 Full Name',
  customer: 'custId',
  productType: 'typeId',
  wares: [],
  isDeleted: false,
};

describe('ProductService', () => {
  let service: ProductService;
  let model: any;

  // --- Mongoose Query Mock Helper ---
  // Giúp giả lập chuỗi hàm: find().populate().sort().exec()
  const mockQueryChain = {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockProductModel = {
    create: jest.fn(),
    find: jest.fn(() => mockQueryChain),
    findById: jest.fn(() => mockQueryChain),
    findOne: jest.fn(() => mockQueryChain),
    findByIdAndUpdate: jest.fn(() => mockQueryChain),
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    model = module.get(getModelToken(Product.name));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =================================================================
  // 1. TEST: create
  // =================================================================
  describe('create', () => {
    const createDto: CreateProductDto = {
      code: 'P01',
      name: 'Name',
      productName: 'Full Name',
      customer: 'custId',
      productType: 'typeId',
      wares: [],
    };

    it('[N] Normal: Should create and return populated document', async () => {
      // 1. Mock create trả về object có _id
      model.create.mockResolvedValue({ _id: 'newId' });
      
      // 2. Mock findById (sau khi create) -> populate -> exec trả về doc hoàn chỉnh
      mockQueryChain.exec.mockResolvedValue(mockProduct);

      const result = await service.create(createDto);

      expect(model.create).toHaveBeenCalledWith(createDto);
      expect(model.findById).toHaveBeenCalledWith('newId');
      expect(mockQueryChain.populate).toHaveBeenCalledTimes(3); // wares, customer, productType
      expect(result).toEqual(mockProduct);
    });

    it('[A] Abnormal: Should throw NotFoundException if finding created doc fails', async () => {
      model.create.mockResolvedValue({ _id: 'newId' });
      // Giả lập trường hợp hiếm: tạo xong nhưng query lại không thấy (exec trả về null)
      mockQueryChain.exec.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('[A] Abnormal: Database create fails', async () => {
      model.create.mockRejectedValue(new Error('DB Error'));
      await expect(service.create(createDto)).rejects.toThrow('DB Error');
    });
  });

  // =================================================================
  // 2. TEST: findAll
  // =================================================================
  describe('findAll', () => {
    it('[N] Normal: Should return paginated data with default options', async () => {
      mockQueryChain.exec.mockResolvedValue([mockProduct]);
      model.countDocuments.mockResolvedValue(10);

      const result = await service.findAll({});

      // Kiểm tra logic mặc định
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.data).toEqual([mockProduct]);
      expect(result.total).toBe(10);
      
      // Kiểm tra filter mặc định
      expect(model.find).toHaveBeenCalledWith({ isDeleted: false });
    });

    it('[N] Normal: Should apply search and filters correctly', async () => {
      mockQueryChain.exec.mockResolvedValue([mockProduct]);
      model.countDocuments.mockResolvedValue(1);

      const options = {
        page: 2,
        limit: 20,
        search: 'test',
        productType: 'typeId',
        customer: 'custId',
      };

      await service.findAll(options);

      // Lấy tham số filter được truyền vào model.find
      const filterArg = model.find.mock.calls[0][0];
      
      expect(filterArg.isDeleted).toBe(false);
      expect(filterArg.productType).toBe('typeId');
      expect(filterArg.customer).toBe('custId');
      // Kiểm tra cấu trúc $or cho search
      expect(filterArg.$or).toBeDefined();
      expect(filterArg.$or[0].code).toBeInstanceOf(RegExp);
    });

    it('[B] Boundary: Should handle page < 1 and limit bounds', async () => {
      mockQueryChain.exec.mockResolvedValue([]);
      model.countDocuments.mockResolvedValue(0);

      // Page = 0 (invalid) -> should be 1
      // Limit = 150 (max 100) -> should be 100
      await service.findAll({ page: 0, limit: 150 });

      // Check skip calculation: (1 - 1) * 100 = 0
      expect(mockQueryChain.skip).toHaveBeenCalledWith(0);
      // Check limit clamping
      expect(mockQueryChain.limit).toHaveBeenCalledWith(100);
    });
  });

  // =================================================================
  // 3. TEST: findOneById
  // =================================================================
  describe('findOneById', () => {
    it('[N] Normal: Should return populated document', async () => {
      mockQueryChain.exec.mockResolvedValue(mockProduct);

      const result = await service.findOneById('prodId');

      expect(model.findById).toHaveBeenCalledWith('prodId');
      expect(mockQueryChain.populate).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    it('[A] Abnormal: Should throw NotFoundException if doc not found', async () => {
      mockQueryChain.exec.mockResolvedValue(null);

      await expect(service.findOneById('missingId')).rejects.toThrow(NotFoundException);
    });
  });

  // =================================================================
  // 4. TEST: findOneByCode
  // =================================================================
  describe('findOneByCode', () => {
    it('[N] Normal: Should return document by code', async () => {
      mockQueryChain.exec.mockResolvedValue(mockProduct);

      const result = await service.findOneByCode('P01');

      expect(model.findOne).toHaveBeenCalledWith({ code: 'P01' });
      expect(mockQueryChain.populate).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    it('[B] Boundary: Should return null (not throw) if code not found', async () => {
      mockQueryChain.exec.mockResolvedValue(null);

      const result = await service.findOneByCode('NONEXISTENT');

      expect(result).toBeNull();
    });
  });

  // =================================================================
  // 5. TEST: update
  // =================================================================
  describe('update', () => {
    const updateDto: UpdateProductDto = { name: 'New Name' };

    it('[N] Normal: Should update and return new document', async () => {
      const updatedDoc = { ...mockProduct, name: 'New Name' };
      mockQueryChain.exec.mockResolvedValue(updatedDoc);

      const result = await service.update('prodId', updateDto);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'prodId', 
        updateDto, 
        { new: true }
      );
      expect(mockQueryChain.populate).toHaveBeenCalled();
      expect(result).toEqual(updatedDoc);
    });

    it('[A] Abnormal: Should throw NotFoundException if ID not found', async () => {
      mockQueryChain.exec.mockResolvedValue(null);

      await expect(service.update('missingId', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  // =================================================================
  // 6. TEST: remove
  // =================================================================
  describe('remove', () => {
    it('[N] Normal: Should perform soft delete', async () => {
      mockQueryChain.exec.mockResolvedValue(mockProduct);

      await service.remove('prodId');

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'prodId',
        { isDeleted: true }, // Kiểm tra payload soft delete
        { new: true }
      );
    });

    it('[A] Abnormal: Should throw NotFoundException if ID not found', async () => {
      mockQueryChain.exec.mockResolvedValue(null);

      await expect(service.remove('missingId')).rejects.toThrow(NotFoundException);
    });
  });
});