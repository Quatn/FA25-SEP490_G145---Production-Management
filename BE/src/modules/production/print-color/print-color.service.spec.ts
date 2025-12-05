import { Test, TestingModule } from '@nestjs/testing';
import { PrintColorService } from './print-color.service';
import { getModelToken } from '@nestjs/mongoose';
import { PrintColor } from '../schemas/print-color.schema';

describe('PrintColorService', () => {
  let service: PrintColorService;
  let model: any;

  // 1. Tạo Mock cho Model
  const mockPrintColorModel = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrintColorService,
        // 2. Inject Mock Model vào Token của Mongoose
        {
          provide: getModelToken(PrintColor.name),
          useValue: mockPrintColorModel,
        },
      ],
    }).compile();

    service = module.get<PrintColorService>(PrintColorService);
    model = module.get(getModelToken(PrintColor.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Test: findAll ---
  describe('findAll', () => {
    it('should return all print colors sorted by createdAt', async () => {
      // A. Arrange (Chuẩn bị dữ liệu)
      const mockDocs = [
        { code: 'C1', description: 'Color 1' },
        { code: 'C2', description: 'Color 2' },
      ];

      // B. Mock Mongoose Chain: find() -> sort() -> exec()
      // Tạo mock cho hàm exec (hàm cuối cùng trả về data)
      const mockExec = jest.fn().mockResolvedValue(mockDocs);
      
      // Tạo mock cho hàm sort (trả về object chứa exec)
      const mockSort = jest.fn().mockReturnValue({
        exec: mockExec
      });

      // Setup hàm find để trả về object chứa sort
      jest.spyOn(model, 'find').mockReturnValue({
        sort: mockSort
      });

      // C. Act (Gọi hàm)
      const result = await service.findAll();

      // D. Assert (Kiểm tra)
      // 1. Kiểm tra kết quả trả về
      expect(result).toEqual(mockDocs);

      // 2. Kiểm tra logic gọi hàm của Mongoose
      expect(model.find).toHaveBeenCalledWith({}); // find({})
      expect(mockSort).toHaveBeenCalledWith({ createdAt: 1 }); // sort({ createdAt: 1 })
      expect(mockExec).toHaveBeenCalled(); // exec()
    });
  });
});