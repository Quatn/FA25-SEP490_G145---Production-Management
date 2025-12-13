import { Test, TestingModule } from '@nestjs/testing';
import { PaperRollTransactionController } from './paper-roll-transaction.controller';

describe('PaperRollTransactionController', () => {
  let controller: PaperRollTransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaperRollTransactionController],
    }).compile();

    controller = module.get<PaperRollTransactionController>(PaperRollTransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
