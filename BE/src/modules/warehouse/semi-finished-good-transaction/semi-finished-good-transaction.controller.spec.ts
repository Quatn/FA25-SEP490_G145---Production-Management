import { Test, TestingModule } from '@nestjs/testing';
import { SemiFinishedGoodTransactionController } from './semi-finished-good-transaction.controller';
import { SemiFinishedGoodTransactionService } from './semi-finished-good-transaction.service';

describe('SemiFinishedGoodTransactionController', () => {
  let controller: SemiFinishedGoodTransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SemiFinishedGoodTransactionController],
      providers: [SemiFinishedGoodTransactionService],
    }).compile();

    controller = module.get<SemiFinishedGoodTransactionController>(SemiFinishedGoodTransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
