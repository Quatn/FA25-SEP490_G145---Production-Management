import { Test, TestingModule } from '@nestjs/testing';
import { PaperColorService } from './paper-color.service';

describe('PaperColorService', () => {
  let service: PaperColorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaperColorService],
    }).compile();

    service = module.get<PaperColorService>(PaperColorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
