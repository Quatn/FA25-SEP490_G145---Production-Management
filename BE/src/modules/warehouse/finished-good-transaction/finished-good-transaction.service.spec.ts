import { Test, TestingModule } from '@nestjs/testing';
import { FinishedGoodTransactionService } from './finished-good-transaction.service';

describe('FinishedGoodTransactionService', () => {
  let service: FinishedGoodTransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinishedGoodTransactionService],
    }).compile();

    service = module.get<FinishedGoodTransactionService>(FinishedGoodTransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
