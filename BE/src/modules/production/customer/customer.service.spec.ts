import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';

describe('CustomerService', () => {
  let service: CustomerService;
  let customerModel: any;

  // Mock Model
  const mockCustomerModel = {
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: getModelToken('Customer'),
          useValue: mockCustomerModel,
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    customerModel = module.get(getModelToken('Customer'));

    // Reset mock trước mỗi test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // -------------------------------------------------------
  // TEST 1: findAll()
  // -------------------------------------------------------
  it('should return all customers (isDeleted = false)', async () => {
    const mockData = [
      { _id: '1', name: 'A' },
      { _id: '2', name: 'B' },
    ];

    customerModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockData),
    });

    const result = await service.findAll();

    expect(result).toEqual(mockData);
    expect(customerModel.find).toHaveBeenCalledWith({ isDeleted: false });
  });

  // -------------------------------------------------------
  // TEST 2: findPaginated()
  // -------------------------------------------------------
  it('should return paginated customers', async () => {
    const mockData = [
      { _id: '1', name: 'A' },
      { _id: '2', name: 'B' },
    ];

    const mockFindExec = jest.fn().mockResolvedValue(mockData);

    customerModel.find.mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: mockFindExec,
    });

    customerModel.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(2),
    });

    const result = await service.findPaginated(1, 10, '');

    expect(result.data).toEqual(mockData);
    expect(result.totalItems).toBe(2);
    expect(result.totalPages).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);

    expect(customerModel.find).toHaveBeenCalled();
    expect(customerModel.countDocuments).toHaveBeenCalled();
  });

  // -------------------------------------------------------
  // TEST 3: findOne() - SUCCESS
  // -------------------------------------------------------
  it('should return a customer if found', async () => {
    const mockCustomer = { _id: '1', name: 'Customer A' };

    customerModel.findById.mockResolvedValue(mockCustomer);

    const result = await service.findOne('1');

    expect(result).toEqual(mockCustomer);
    expect(customerModel.findById).toHaveBeenCalledWith('1');
  });

  // -------------------------------------------------------
  // TEST 4: findOne() - NOT FOUND
  // -------------------------------------------------------
  it('should throw NotFoundException if not found', async () => {
    customerModel.findById.mockResolvedValue(null);

    await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
  });
});
