import { Test, TestingModule } from '@nestjs/testing';
import { PrintColorController } from './print-color.controller';
import { PrintColorService } from './print-color.service';

describe('PrintColorController', () => {
  let controller: PrintColorController;
  let service: PrintColorService;

  // 1. Tạo Mock Service
  const mockPrintColorService = {
    findAll: jest.fn(),
  };


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrintColorController],
      providers: [
        {
          provide: PrintColorService,
          useValue: mockPrintColorService,
        },
      ],
    }).compile();

    controller = module.get<PrintColorController>(PrintColorController);
    service = module.get<PrintColorService>(PrintColorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Test: findAll ---
  describe('findAll', () => {
    it('should return a list of print colors', async () => {
      // A. Prepare Data (Mock đúng theo Schema PrintColor)
      const mockDocs = [
        {
          _id: '64b1f25...',
          code: 'COLOR-001',
          description: 'Màu đỏ chuẩn',
          note: 'Dùng cho đơn hàng xuất khẩu',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: '64b1f26...',
          code: 'COLOR-002',
          description: 'Màu xanh lá',
          note: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Giả lập Service trả về danh sách trên
      mockPrintColorService.findAll.mockResolvedValue(mockDocs);

      // B. Call Controller
      const result = await controller.findAll();

      // C. Assert
      expect(service.findAll).toHaveBeenCalled(); // Đảm bảo service được gọi
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockDocs,
      });
    });

    it('should return empty list if no data found', async () => {
      mockPrintColorService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result.data).toEqual([]);
      expect(result.success).toBe(true);
    });
  });
});