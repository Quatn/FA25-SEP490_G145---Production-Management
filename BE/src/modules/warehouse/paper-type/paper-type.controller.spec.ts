import { Test, TestingModule } from '@nestjs/testing';
import { PaperTypeController } from './paper-type.controller';
import { PaperTypeService } from './paper-type.service';
import { CreatePaperTypeRequestDto } from './dto/create-paper-type-request.dto';
import { UpdatePaperTypeRequestDto } from './dto/update-paper-type-request.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

//src/modules/warehouse/paper-type/paper-type.controller.spec.ts

describe('PaperTypeController', () => {
  let controller: PaperTypeController;
  let service: PaperTypeService;

  // Mock Data - Aligned with PaperType schema
  const mockPaperColor = {
    _id: 'color-id-1',
    code: 'WHT',
    title: 'White',
  };

  const mockPaperType: any = {
    _id: 'pt-id-1',
    paperColorId: 'color-id-1',
    width: 1200,
    grammage: 200,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    populate: jest.fn().mockResolvedValue({
      _id: 'pt-id-1',
      paperColorId: mockPaperColor,
      width: 1200,
      grammage: 200,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  };

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
      controllers: [PaperTypeController],
      providers: [
        {
          provide: PaperTypeService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PaperTypeController>(PaperTypeController);
    service = module.get<PaperTypeService>(PaperTypeService);

    jest.clearAllMocks();
  });

  describe('Definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
      expect(service).toBeDefined();
    });
  });

  // ==================================================================================
  // GET /list - List paginated paper types
  // ==================================================================================
  describe('findPaginated', () => {
    it('[NORMAL] should return paginated list of paper types', async () => {
      const mockResponse = {
        data: [mockPaperType],
        total: 1,
        page: 1,
        limit: 10,
        totalPage: 1,
      };
      mockService.findPaginated.mockResolvedValue(mockResponse);

      const result = await controller.findPaginated(1, 10);

      expect(service.findPaginated).toHaveBeenCalledWith(1, 10, undefined);
      expect(service.findPaginated).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockResponse,
      });
    });

    it('[NORMAL] should handle search query', async () => {
      const mockResponse = {
        data: [mockPaperType],
        total: 1,
        page: 1,
        limit: 10,
        totalPage: 1,
      };
      mockService.findPaginated.mockResolvedValue(mockResponse);

      const result = await controller.findPaginated(1, 10, '1200');

      expect(service.findPaginated).toHaveBeenCalledWith(1, 10, '1200');
      expect(result.success).toBe(true);
    });

    it('[BOUNDARY] should return empty data when no records found', async () => {
      const emptyResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPage: 0,
      };
      mockService.findPaginated.mockResolvedValue(emptyResponse);

      const result = await controller.findPaginated(1, 10);

      expect(result.data).toEqual(emptyResponse);
      expect((result.data as any).data).toHaveLength(0);
    });

    it('[BOUNDARY] should handle large page numbers', async () => {
      const emptyResponse = {
        data: [],
        total: 0,
        page: 1000,
        limit: 10,
        totalPage: 0,
      };
      mockService.findPaginated.mockResolvedValue(emptyResponse);

      const result = await controller.findPaginated(1000, 10);

      expect(service.findPaginated).toHaveBeenCalledWith(1000, 10, undefined);
      expect(result.success).toBe(true);
    });

    it('[BOUNDARY] should use default pagination when not provided', async () => {
      const mockResponse = {
        data: [mockPaperType],
        total: 1,
        page: 1,
        limit: 10,
        totalPage: 1,
      };
      mockService.findPaginated.mockResolvedValue(mockResponse);

      const result = await controller.findPaginated();

      expect(service.findPaginated).toHaveBeenCalledWith(1, 10, undefined);
      expect(result.success).toBe(true);
    });

    it('[ABNORMAL] should propagate service errors', async () => {
      mockService.findPaginated.mockRejectedValue(new Error('Database error'));

      await expect(controller.findPaginated(1, 10)).rejects.toThrow('Database error');
      expect(service.findPaginated).toHaveBeenCalledWith(1, 10, undefined);
    });

    it('[ABNORMAL] should handle validation errors', async () => {
      mockService.findPaginated.mockRejectedValue(
        new BadRequestException('Invalid query')
      );

      await expect(controller.findPaginated(1, 10)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ==================================================================================
  // GET /list-all - List all paper types
  // ==================================================================================
  describe('findAll', () => {
    it('[NORMAL] should return all paper types', async () => {
      const mockPaperTypes = [
        mockPaperType,
        { ...mockPaperType, _id: 'pt-id-2', width: 1000, grammage: 150 },
      ];
      mockService.findAll.mockResolvedValue(mockPaperTypes);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith();
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockPaperTypes,
      });
      expect((result.data as any).length).toBe(2);
    });

    it('[BOUNDARY] should return empty array when no records', async () => {
      mockService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result.data).toEqual([]);
      expect((result.data as any).length).toBe(0);
    });

    it('[ABNORMAL] should propagate service errors', async () => {
      mockService.findAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll()).rejects.toThrow('Database error');
    });
  });

  // ==================================================================================
  // GET /detail/:id - Paper type detail
  // ==================================================================================
  describe('findOne', () => {
    it('[NORMAL] should return paper type detail', async () => {
      mockService.findOne.mockResolvedValue(mockPaperType);

      const result = await controller.findOne('pt-id-1');

      expect(service.findOne).toHaveBeenCalledWith('pt-id-1');
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Fetch successful',
        data: mockPaperType,
      });
    });

    it('[NORMAL] should return complete paper type data with all fields', async () => {
      mockService.findOne.mockResolvedValue(mockPaperType);

      const result = await controller.findOne('pt-id-1');

      expect(result.data).toHaveProperty('paperColorId');
      expect(result.data).toHaveProperty('width');
      expect(result.data).toHaveProperty('grammage');
    });

    it('[ABNORMAL] should throw NotFoundException when not found', async () => {
      mockService.findOne.mockRejectedValue(
        new NotFoundException('Paper Type not found')
      );

      await expect(controller.findOne('non-existent')).rejects.toThrow(
        NotFoundException
      );
      expect(service.findOne).toHaveBeenCalledWith('non-existent');
    });

    it('[ABNORMAL] should handle invalid ObjectId format', async () => {
      mockService.findOne.mockRejectedValue(
        new BadRequestException('Invalid ID format')
      );

      await expect(controller.findOne('invalid-id-format')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ==================================================================================
  // POST /create - Create new paper type
  // ==================================================================================
  describe('create', () => {
    const createDto: CreatePaperTypeRequestDto = {
      paperColorId: 'color-id-1',
      width: 1200,
      grammage: 200,
    };

    it('[NORMAL] should create paper type successfully', async () => {
      const populatedDoc = {
        ...mockPaperType,
        paperColorId: mockPaperColor,
      };
      
      const mockDoc = {
        ...mockPaperType,
        populate: jest.fn().mockResolvedValue(populatedDoc),
      };
      
      mockService.createOne.mockResolvedValue(mockDoc);

      const result = await controller.create(createDto);

      expect(service.createOne).toHaveBeenCalledWith(createDto);
      expect(service.createOne).toHaveBeenCalledTimes(1);
      expect(mockDoc.populate).toHaveBeenCalledWith('paperColorId', 'code title');
      expect(result).toEqual({
        success: true,
        message: 'Created paper type WHT/1200/200 successfully',
        data: populatedDoc,
      });
    });

    it('[NORMAL] should handle populate failure gracefully', async () => {
      const mockDoc = {
        ...mockPaperType,
        populate: jest.fn().mockResolvedValue(null),
      };
      
      mockService.createOne.mockResolvedValue(mockDoc);

      const result = await controller.create(createDto);

      expect(result.message).toBe('Created paper type Unknown/1200/200 successfully');
    });

    it('[BOUNDARY] should create with minimum width value', async () => {
      const minDto = { ...createDto, width: 1 };
      const mockDoc = {
        ...mockPaperType,
        width: 1,
        populate: jest.fn().mockResolvedValue({
          ...mockPaperType,
          width: 1,
          paperColorId: mockPaperColor,
        }),
      };
      mockService.createOne.mockResolvedValue(mockDoc);

      const result = await controller.create(minDto);

      expect(service.createOne).toHaveBeenCalledWith(minDto);
      expect(result.success).toBe(true);
    });

    it('[BOUNDARY] should create with minimum grammage value', async () => {
      const minDto = { ...createDto, grammage: 1 };
      const mockDoc = {
        ...mockPaperType,
        grammage: 1,
        populate: jest.fn().mockResolvedValue({
          ...mockPaperType,
          grammage: 1,
          paperColorId: mockPaperColor,
        }),
      };
      mockService.createOne.mockResolvedValue(mockDoc);

      const result = await controller.create(minDto);

      expect(service.createOne).toHaveBeenCalledWith(minDto);
      expect(result.success).toBe(true);
    });

    it('[ABNORMAL] should throw error when paperColorId not exists', async () => {
      mockService.createOne.mockRejectedValue(
        new NotFoundException('Paper Color not found')
      );

      await expect(controller.create(createDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('[ABNORMAL] should throw error for duplicate paper type', async () => {
      mockService.createOne.mockRejectedValue(
        new BadRequestException('Paper type already exists')
      );

      await expect(controller.create(createDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle invalid paperColorId format', async () => {
      const invalidDto = { ...createDto, paperColorId: 'invalid-id' };
      mockService.createOne.mockRejectedValue(
        new BadRequestException('Invalid paperColorId format')
      );

      await expect(controller.create(invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle validation errors for width', async () => {
      const invalidDto = { ...createDto, width: 0 };
      mockService.createOne.mockRejectedValue(
        new BadRequestException('width must be greater than 0')
      );

      await expect(controller.create(invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle validation errors for grammage', async () => {
      const invalidDto = { ...createDto, grammage: -1 };
      mockService.createOne.mockRejectedValue(
        new BadRequestException('grammage must be greater than 0')
      );

      await expect(controller.create(invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ==================================================================================
  // PATCH /update/:id - Update paper type
  // ==================================================================================
  describe('update', () => {
    const updateDto: UpdatePaperTypeRequestDto = {
      width: 1000,
      grammage: 250,
    };

    it('[NORMAL] should update paper type successfully', async () => {
      const updatedPaperType = {
        ...mockPaperType,
        width: 1000,
        grammage: 250,
      };
      
      const populatedDoc = {
        ...updatedPaperType,
        paperColorId: mockPaperColor,
      };
      
      const mockDoc = {
        ...updatedPaperType,
        populate: jest.fn().mockResolvedValue(populatedDoc),
      };
      
      mockService.updateOne.mockResolvedValue(mockDoc);

      const result = await controller.update('pt-id-1', updateDto);

      expect(service.updateOne).toHaveBeenCalledWith('pt-id-1', updateDto);
      expect(service.updateOne).toHaveBeenCalledTimes(1);
      expect(mockDoc.populate).toHaveBeenCalledWith('paperColorId', 'code title');
      expect(result).toEqual({
        success: true,
        message: 'Updated paper type WHT/1000/250 successfully',
        data: populatedDoc,
      });
    });

    it('[NORMAL] should update single field - width', async () => {
      const singleFieldDto = { width: 900 };
      const updatedPaperType = { ...mockPaperType, width: 900 };
      const mockDoc = {
        ...updatedPaperType,
        populate: jest.fn().mockResolvedValue({
          ...updatedPaperType,
          paperColorId: mockPaperColor,
        }),
      };
      mockService.updateOne.mockResolvedValue(mockDoc);

      const result = await controller.update('pt-id-1', singleFieldDto);

      expect(service.updateOne).toHaveBeenCalledWith('pt-id-1', singleFieldDto);
      expect((result.data as any).width).toBe(900);
    });

    it('[NORMAL] should update single field - grammage', async () => {
      const singleFieldDto = { grammage: 180 };
      const updatedPaperType = { ...mockPaperType, grammage: 180 };
      const mockDoc = {
        ...updatedPaperType,
        populate: jest.fn().mockResolvedValue({
          ...updatedPaperType,
          paperColorId: mockPaperColor,
        }),
      };
      mockService.updateOne.mockResolvedValue(mockDoc);

      const result = await controller.update('pt-id-1', singleFieldDto);

      expect(service.updateOne).toHaveBeenCalledWith('pt-id-1', singleFieldDto);
      expect((result.data as any).grammage).toBe(180);
    });

    it('[NORMAL] should update paperColorId', async () => {
      const updateColorDto = { paperColorId: 'color-id-2' };
      const updatedPaperType = { ...mockPaperType, paperColorId: 'color-id-2' };
      const mockDoc = {
        ...updatedPaperType,
        populate: jest.fn().mockResolvedValue({
          ...updatedPaperType,
          paperColorId: { ...mockPaperColor, _id: 'color-id-2', code: 'BLU' },
        }),
      };
      mockService.updateOne.mockResolvedValue(mockDoc);

      const result = await controller.update('pt-id-1', updateColorDto);

      expect(service.updateOne).toHaveBeenCalledWith('pt-id-1', updateColorDto);
      expect(result.success).toBe(true);
    });

    it('[NORMAL] should handle populate failure gracefully', async () => {
      const mockDoc = {
        ...mockPaperType,
        populate: jest.fn().mockResolvedValue(null),
      };
      
      mockService.updateOne.mockResolvedValue(mockDoc);

      const result = await controller.update('pt-id-1', updateDto);

      expect(result.message).toBe('Updated paper type Unknown/1200/200 successfully');
    });

    it('[ABNORMAL] should throw NotFoundException if paper type not found', async () => {
      mockService.updateOne.mockRejectedValue(
        new NotFoundException('Paper Type not found')
      );

      await expect(controller.update('pt-id-1', updateDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('[ABNORMAL] should handle invalid paperColorId', async () => {
      const invalidDto = { paperColorId: 'non-existent-color' };
      mockService.updateOne.mockRejectedValue(
        new NotFoundException('Paper Color not found')
      );

      await expect(controller.update('pt-id-1', invalidDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('[ABNORMAL] should handle duplicate combination', async () => {
      mockService.updateOne.mockRejectedValue(
        new BadRequestException('Paper type with this combination already exists')
      );

      await expect(controller.update('pt-id-1', updateDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle empty update dto', async () => {
      const emptyDto = {};
      mockService.updateOne.mockRejectedValue(
        new BadRequestException('No fields to update')
      );

      await expect(controller.update('pt-id-1', emptyDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle invalid width value', async () => {
      const invalidDto = { width: 0 };
      mockService.updateOne.mockRejectedValue(
        new BadRequestException('width must be greater than 0')
      );

      await expect(controller.update('pt-id-1', invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle invalid grammage value', async () => {
      const invalidDto = { grammage: -5 };
      mockService.updateOne.mockRejectedValue(
        new BadRequestException('grammage must be greater than 0')
      );

      await expect(controller.update('pt-id-1', invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ==================================================================================
  // DELETE /delete-soft/:id - Soft delete paper type
  // ==================================================================================
  describe('softDelete', () => {
    it('[NORMAL] should soft delete successfully', async () => {
      mockService.softDelete.mockResolvedValue(undefined);

      const result = await controller.softDelete('pt-id-1');

      expect(service.softDelete).toHaveBeenCalledWith('pt-id-1');
      expect(service.softDelete).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Soft deleted successfully',
        data: null,
      });
    });

    it('[ABNORMAL] should throw NotFoundException when paper type not found', async () => {
      mockService.softDelete.mockRejectedValue(
        new NotFoundException('Paper Type not found')
      );

      await expect(controller.softDelete('non-existent')).rejects.toThrow(
        NotFoundException
      );
    });

    it('[ABNORMAL] should propagate error if deletion fails', async () => {
      mockService.softDelete.mockRejectedValue(new Error('Deletion failed'));

      await expect(controller.softDelete('pt-id-1')).rejects.toThrow(
        'Deletion failed'
      );
    });

    it('[ABNORMAL] should handle already deleted paper type', async () => {
      mockService.softDelete.mockRejectedValue(
        new BadRequestException('Paper Type is already deleted')
      );

      await expect(controller.softDelete('pt-id-1')).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle paper type with dependencies', async () => {
      mockService.softDelete.mockRejectedValue(
        new BadRequestException('Cannot delete paper type with existing references')
      );

      await expect(controller.softDelete('pt-id-1')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ==================================================================================
  // PATCH /restore/:id - Restore paper type
  // ==================================================================================
  describe('restore', () => {
    it('[NORMAL] should restore successfully', async () => {
      mockService.restore.mockResolvedValue(undefined);

      const result = await controller.restore('pt-id-1');

      expect(service.restore).toHaveBeenCalledWith('pt-id-1');
      expect(service.restore).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Restored successfully',
        data: null,
      });
    });

    it('[ABNORMAL] should throw NotFoundException if paper type not found', async () => {
      mockService.restore.mockRejectedValue(
        new NotFoundException('Document not found')
      );

      await expect(controller.restore('pt-id-1')).rejects.toThrow(
        NotFoundException
      );
    });

    it('[ABNORMAL] should handle paper type not in deleted state', async () => {
      mockService.restore.mockRejectedValue(
        new BadRequestException('Paper Type is not deleted')
      );

      await expect(controller.restore('pt-id-1')).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should propagate service errors', async () => {
      mockService.restore.mockRejectedValue(new Error('Restore failed'));

      await expect(controller.restore('pt-id-1')).rejects.toThrow(
        'Restore failed'
      );
    });

    it('[ABNORMAL] should handle duplicate on restore', async () => {
      mockService.restore.mockRejectedValue(
        new BadRequestException('Cannot restore: duplicate paper type exists')
      );

      await expect(controller.restore('pt-id-1')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ==================================================================================
  // DELETE /delete-hard/:id - Hard delete paper type
  // ==================================================================================
  describe('hardDelete', () => {
    it('[NORMAL] should hard delete successfully', async () => {
      mockService.removeHard.mockResolvedValue(undefined);

      const result = await controller.hardDelete('pt-id-1');

      expect(service.removeHard).toHaveBeenCalledWith('pt-id-1');
      expect(service.removeHard).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'Permanently deleted successfully',
        data: null,
      });
    });

    it('[ABNORMAL] should throw NotFoundException when not found', async () => {
      mockService.removeHard.mockRejectedValue(
        new NotFoundException('Paper Type not found')
      );

      await expect(controller.hardDelete('non-existent')).rejects.toThrow(
        NotFoundException
      );
    });

    it('[ABNORMAL] should handle deletion errors', async () => {
      mockService.removeHard.mockRejectedValue(
        new Error('Cannot delete: has dependencies')
      );

      await expect(controller.hardDelete('pt-id-1')).rejects.toThrow(
        'Cannot delete: has dependencies'
      );
    });

    it('[ABNORMAL] should handle database constraints', async () => {
      mockService.removeHard.mockRejectedValue(
        new BadRequestException('Foreign key constraint')
      );

      await expect(controller.hardDelete('pt-id-1')).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle paper type with active relationships', async () => {
      mockService.removeHard.mockRejectedValue(
        new BadRequestException('Cannot delete paper type with existing orders')
      );

      await expect(controller.hardDelete('pt-id-1')).rejects.toThrow(
        BadRequestException
      );
    });

    it('[ABNORMAL] should handle paper type used in inventory', async () => {
      mockService.removeHard.mockRejectedValue(
        new BadRequestException('Cannot delete paper type with inventory records')
      );

      await expect(controller.hardDelete('pt-id-1')).rejects.toThrow(
        BadRequestException
      );
    });
  });
});