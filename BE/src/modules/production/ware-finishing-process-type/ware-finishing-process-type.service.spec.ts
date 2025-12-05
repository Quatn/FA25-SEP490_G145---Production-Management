import { Test, TestingModule } from '@nestjs/testing';
import { WareFinishingProcessTypeService } from './ware-finishing-process-type.service';
import { getModelToken } from '@nestjs/mongoose';
import { WareFinishingProcessType } from '../schemas/ware-finishing-process-type.schema';
import { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateWareFinishingProcessTypeDto } from './dto/create-ware-finishing-process-type.dto';

//src/modules/production/ware-finishing-process-type/ware-finishing-process-type.service.spec.ts

describe('WareFinishingProcessTypeService', () => {
  let service: WareFinishingProcessTypeService;
  let model: Model<WareFinishingProcessType>;

  // 1. Mock functions cho instance methods
  const mockSave = jest.fn();
  const mockSoftDeleteInstance = jest.fn();
  const mockRestoreInstance = jest.fn();

  // 2. Class Mock Model để xử lý "new this.wfptModel(dto)"
  class MockWareFinishingProcessTypeModel {
    constructor(dto: any) {
      Object.assign(this, dto);
    }

    // Instance methods
    save = mockSave;
    softDelete = mockSoftDeleteInstance;
    restore = mockRestoreInstance;

    // Static methods
    static find = jest.fn();
    static findById = jest.fn();
    static countDocuments = jest.fn();
    static findByIdAndUpdate = jest.fn();
    static findByIdAndDelete = jest.fn();
    static aggregate = jest.fn();
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WareFinishingProcessTypeService,
        {
          provide: getModelToken(WareFinishingProcessType.name),
          useValue: MockWareFinishingProcessTypeModel,
        },
      ],
    }).compile();

    service = module.get<WareFinishingProcessTypeService>(
      WareFinishingProcessTypeService,
    );
    model = module.get<Model<WareFinishingProcessType>>(
      getModelToken(WareFinishingProcessType.name),
    );

    jest.clearAllMocks();
    mockSave.mockReset();
    mockSoftDeleteInstance.mockReset();
    mockRestoreInstance.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =============================================
  // NORMAL CASES
  // =============================================

  describe('checkDuplicates', () => {
    it('should pass if no duplicates found', async () => {
      (MockWareFinishingProcessTypeModel.aggregate as jest.Mock).mockResolvedValue([]);
      
      const dto: CreateWareFinishingProcessTypeDto = { 
          code: 'TEST', 
          name: 'Test Name',
          description: '',
          note: ''
      };
      await expect(service.checkDuplicates(dto)).resolves.not.toThrow();
    });
  });

  describe('findPaginated', () => {
    it('should return paginated list', async () => {
      const mockData = [{ _id: '1', code: 'A', name: 'Type A' }];
      
      (MockWareFinishingProcessTypeModel.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      });
      (MockWareFinishingProcessTypeModel.countDocuments as jest.Mock).mockResolvedValue(5);

      const result = await service.findPaginated(1, 10);

      expect(result.data).toEqual(mockData);
      expect(result.totalItems).toBe(5);
    });

    it('should apply search filter correctly', async () => {
        const mockData = [{ _id: '1', code: 'SearchMatch' }];
        const findMock = jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockData),
        });
        MockWareFinishingProcessTypeModel.find = findMock;
        (MockWareFinishingProcessTypeModel.countDocuments as jest.Mock).mockResolvedValue(1);

        await service.findPaginated(1, 10, 'SearchMatch');

        expect(findMock).toHaveBeenCalledWith(expect.objectContaining({
            $or: expect.any(Array)
        }));
    });
  });

  describe('findAll', () => {
    it('should return all types', async () => {
      const list = [{ _id: '1', code: 'A' }];
      (MockWareFinishingProcessTypeModel.find as jest.Mock).mockResolvedValue(list);
      expect(await service.findAll()).toEqual(list);
    });
  });

  describe('findOne', () => {
    it('should return type by id', async () => {
      const doc = { _id: '123', code: 'WF01' };
      (MockWareFinishingProcessTypeModel.findById as jest.Mock).mockResolvedValue(doc);
      expect(await service.findOne('123')).toEqual(doc);
    });
  });

  describe('createOne', () => {
    it('should create a type successfully', async () => {
      // DTO khớp với định nghĩa bạn cung cấp
      const dto: CreateWareFinishingProcessTypeDto = {
        code: 'WF_NEW',
        name: 'Hoàn thiện mới',
        description: 'Mô tả test',
        note: 'Ghi chú test',
      };

      const createdDoc = { ...dto, _id: 'new_id' };

      // Mock save() trả về document đã tạo
      mockSave.mockResolvedValue(createdDoc);

      const result = await service.createOne(dto);

      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(createdDoc);
    });
  });

  describe('updateOne', () => {
    it('should update type successfully', async () => {
      const updated = { _id: '123', name: 'Updated Name' };
      (MockWareFinishingProcessTypeModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(updated);

      const result = await service.updateOne('123', { name: 'Updated Name' } as any);
      expect(result).toEqual(updated);
    });
  });

  describe('softDelete', () => {
    it('should soft delete the type', async () => {
      // Mock findById trả về instance giả lập
      const docInstance = new MockWareFinishingProcessTypeModel({});
      (MockWareFinishingProcessTypeModel.findById as jest.Mock).mockResolvedValue(docInstance);
      
      mockSoftDeleteInstance.mockResolvedValue({ success: true });

      const result = await service.softDelete('123');

      expect(mockSoftDeleteInstance).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });

  describe('restore', () => {
    it('should restore the type', async () => {
      const docInstance = new MockWareFinishingProcessTypeModel({});
      (MockWareFinishingProcessTypeModel.findById as jest.Mock).mockResolvedValue(docInstance);
      
      mockRestoreInstance.mockResolvedValue({ success: true });

      const result = await service.restore('123');

      expect(mockRestoreInstance).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });

  describe('removeHard', () => {
    it('should hard delete the type', async () => {
      (MockWareFinishingProcessTypeModel.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: '123' });

      const result = await service.removeHard('123');

      expect(MockWareFinishingProcessTypeModel.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(result).toEqual({ success: true });
    });
  });

  // =============================================
  // ABNORMAL CASES
  // =============================================

  describe('checkDuplicates (Error)', () => {
    it('should throw BadRequestException if duplicate found', async () => {
        const dto: CreateWareFinishingProcessTypeDto = { 
            code: 'DUP', 
            name: 'Name',
            description: '',
            note: ''
        };
        
        // Mock aggregate trả về dữ liệu trùng khớp logic trong service
        (MockWareFinishingProcessTypeModel.aggregate as jest.Mock).mockResolvedValue([
            { code: 'DUP', name: 'Other' }
        ]);

        await expect(service.checkDuplicates(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne (Error)', () => {
    it('should throw NotFoundException if not found', async () => {
      (MockWareFinishingProcessTypeModel.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createOne (Error)', () => {
    it('should throw BadRequestException on duplicate code (11000)', async () => {
      const dto: CreateWareFinishingProcessTypeDto = {
        code: 'DUP_CODE',
        name: 'Test',
        description: '',
        note: ''
      };

      mockSave.mockRejectedValue({
        code: 11000,
        keyValue: { code: 'DUP_CODE' },
      });

      await expect(service.createOne(dto)).rejects.toThrow(BadRequestException);
      await expect(service.createOne(dto)).rejects.toThrow(
        'Mã loại hoàn thiện "DUP_CODE" đã tồn tại.'
      );
    });

    it('should throw BadRequestException on duplicate name (11000)', async () => {
        const dto: CreateWareFinishingProcessTypeDto = {
          code: 'CODE',
          name: 'DUP_NAME',
          description: '',
          note: ''
        };
  
        mockSave.mockRejectedValue({
          code: 11000,
          keyValue: { name: 'DUP_NAME' },
        });
  
        await expect(service.createOne(dto)).rejects.toThrow(BadRequestException);
        await expect(service.createOne(dto)).rejects.toThrow(
          'Giá trị "DUP_NAME" ở trường "name" đã tồn tại.'
        );
      });
  });

  describe('updateOne (Error)', () => {
    it('should throw NotFoundException if document not found', async () => {
      (MockWareFinishingProcessTypeModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
      await expect(service.updateOne('999', { name: 'Test' } as any)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException on duplicate key error', async () => {
      (MockWareFinishingProcessTypeModel.findByIdAndUpdate as jest.Mock).mockRejectedValue({
        code: 11000,
        keyValue: { name: 'UNIQUE_NAME' },
      });

      await expect(
        service.updateOne('123', { name: 'UNIQUE_NAME' } as any)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('softDelete (Error)', () => {
    it('should throw NotFoundException if document not found', async () => {
      (MockWareFinishingProcessTypeModel.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.softDelete('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeHard (Error)', () => {
    it('should throw NotFoundException if document not found', async () => {
      (MockWareFinishingProcessTypeModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);
      await expect(service.removeHard('999')).rejects.toThrow(NotFoundException);
    });
  });
});

