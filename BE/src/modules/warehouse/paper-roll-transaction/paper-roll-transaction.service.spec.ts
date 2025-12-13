import { Test, TestingModule } from '@nestjs/testing';
import { PaperRollTransactionService } from './paper-roll-transaction.service';

describe('PaperRollTransactionService', () => {
  let service: PaperRollTransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaperRollTransactionService],
    }).compile();

    service = module.get<PaperRollTransactionService>(PaperRollTransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
