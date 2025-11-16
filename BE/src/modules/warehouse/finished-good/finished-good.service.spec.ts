import { Test, TestingModule } from '@nestjs/testing';
import { FinishedGoodService } from './finished-good.service';

describe('FinishedGoodService', () => {
  let service: FinishedGoodService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinishedGoodService],
    }).compile();

    service = module.get<FinishedGoodService>(FinishedGoodService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
