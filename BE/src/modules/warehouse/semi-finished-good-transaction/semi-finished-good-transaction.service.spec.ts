import { Test, TestingModule } from '@nestjs/testing';
import { SemiFinishedGoodTransactionService } from './semi-finished-good-transaction.service';

describe('SemiFinishedGoodTransactionService', () => {
  let service: SemiFinishedGoodTransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SemiFinishedGoodTransactionService],
    }).compile();

    service = module.get<SemiFinishedGoodTransactionService>(SemiFinishedGoodTransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
