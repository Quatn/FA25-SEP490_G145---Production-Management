import { Test, TestingModule } from '@nestjs/testing';
import { FluteCombinationController } from './flute-combination.controller';
import { FluteCombinationService } from './flute-combination.service';
import { BaseResponse } from '@/common/dto/response.dto';

describe('FluteCombinationController', () => {
  let controller: FluteCombinationController;
  let service: FluteCombinationService;

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
      controllers: [FluteCombinationController],
      providers: [
        {
          provide: FluteCombinationService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<FluteCombinationController>(FluteCombinationController);
    service = module.get<FluteCombinationService>(FluteCombinationService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ----------------------------------------------------------------
  // GET /list
  // ----------------------------------------------------------------
  it('should return paginated flute combinations', async () => {
    const mockPage = {
      data: [],
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };

    mockService.findPaginated.mockResolvedValue(mockPage);

    const result = await controller.findPaginated(1, 10, 'A');

    expect(result).toEqual<BaseResponse<any>>({
      success: true,
      message: 'Fetch successful',
      data: mockPage,
    });

    expect(service.findPaginated).toHaveBeenCalledWith(1, 10, 'A');
  });

  // ----------------------------------------------------------------
  // GET /list-all
  // ----------------------------------------------------------------
  it('should return all flute combinations', async () => {
    const mockData = [{ id: 1, code: '3B' }];

    mockService.findAll.mockResolvedValue(mockData);

    const result = await controller.findAll();

    expect(result).toEqual({
      success: true,
      message: 'Fetch successful',
      data: mockData,
    });

    expect(service.findAll).toHaveBeenCalled();
  });

  // ----------------------------------------------------------------
  // GET /detail/:id
  // ----------------------------------------------------------------
  it('should return one flute combination', async () => {
    const mockDoc = { id: '1', code: '3B' };

    mockService.findOne.mockResolvedValue(mockDoc);

    const result = await controller.findOne('1');

    expect(result).toEqual({
      success: true,
      message: 'Fetch successful',
      data: mockDoc,
    });

    expect(service.findOne).toHaveBeenCalledWith('1');
  });

  // ----------------------------------------------------------------
  // POST /create
  // ----------------------------------------------------------------
  it('should create a flute combination', async () => {
    const dto = { code: '3B', description: 'Sample', note: '' };
    const mockDoc = { id: '1', code: '3B' };

    mockService.createOne.mockResolvedValue(mockDoc);

    const result = await controller.create(dto);

    expect(result).toEqual({
      success: true,
      message: `Created flute combination ${mockDoc.code} successfully`,
      data: mockDoc,
    });

    expect(service.createOne).toHaveBeenCalledWith(dto);
  });

  // ----------------------------------------------------------------
  // PATCH /update/:id
  // ----------------------------------------------------------------
  it('should update a flute combination', async () => {
    const dto = { description: 'Updated' };
    const mockDoc = { id: '1', code: '3C' };

    mockService.updateOne.mockResolvedValue(mockDoc);

    const result = await controller.update('1', dto);

    expect(result).toEqual({
      success: true,
      message: `Updated flute combination ${mockDoc.code} successfully`,
      data: mockDoc,
    });

    expect(service.updateOne).toHaveBeenCalledWith('1', dto);
  });

  // ----------------------------------------------------------------
  // DELETE /delete-soft/:id
  // ----------------------------------------------------------------
  it('should soft delete a flute combination', async () => {
    mockService.softDelete.mockResolvedValue(undefined);

    const result = await controller.softDelete('1');

    expect(result).toEqual({
      success: true,
      message: 'Soft deleted successfully',
      data: null,
    });

    expect(service.softDelete).toHaveBeenCalledWith('1');
  });

  // ----------------------------------------------------------------
  // PATCH /restore/:id
  // ----------------------------------------------------------------
  it('should restore a flute combination', async () => {
    mockService.restore.mockResolvedValue(undefined);

    const result = await controller.restore('1');

    expect(result).toEqual({
      success: true,
      message: 'Restored successfully',
      data: null,
    });

    expect(service.restore).toHaveBeenCalledWith('1');
  });

  // ----------------------------------------------------------------
  // DELETE /delete-hard/:id
  // ----------------------------------------------------------------
  it('should hard delete a flute combination', async () => {
    mockService.removeHard.mockResolvedValue(undefined);

    const result = await controller.hardDelete('1');

    expect(result).toEqual({
      success: true,
      message: 'Permanently deleted successfully',
      data: null,
    });

    expect(service.removeHard).toHaveBeenCalledWith('1');
  });
});
