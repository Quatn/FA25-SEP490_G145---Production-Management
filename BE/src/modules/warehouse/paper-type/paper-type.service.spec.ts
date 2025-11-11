import { Test, TestingModule } from '@nestjs/testing';
import { PaperTypeService } from './paper-type.service';

describe('PaperTypeService', () => {
  let service: PaperTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaperTypeService],
    }).compile();

    service = module.get<PaperTypeService>(PaperTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
