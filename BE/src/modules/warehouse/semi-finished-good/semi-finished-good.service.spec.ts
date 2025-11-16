import { Test, TestingModule } from '@nestjs/testing';
import { SemiFinishedGoodService } from './semi-finished-good.service';

describe('SemiFinishedGoodService', () => {
  let service: SemiFinishedGoodService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SemiFinishedGoodService],
    }).compile();

    service = module.get<SemiFinishedGoodService>(SemiFinishedGoodService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
