import { Test, TestingModule } from '@nestjs/testing';
import { FinishedGoodTransactionController } from './finished-good-transaction.controller';
import { FinishedGoodTransactionService } from './finished-good-transaction.service';

describe('FinishedGoodTransactionController', () => {
  let controller: FinishedGoodTransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinishedGoodTransactionController],
      providers: [FinishedGoodTransactionService],
    }).compile();

    controller = module.get<FinishedGoodTransactionController>(FinishedGoodTransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
