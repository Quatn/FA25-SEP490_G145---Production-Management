import { Test, TestingModule } from '@nestjs/testing';
import { SemiFinishedGoodController } from './semi-finished-good.controller';
import { SemiFinishedGoodService } from './semi-finished-good.service';

describe('SemiFinishedGoodController', () => {
  let controller: SemiFinishedGoodController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SemiFinishedGoodController],
      providers: [SemiFinishedGoodService],
    }).compile();

    controller = module.get<SemiFinishedGoodController>(SemiFinishedGoodController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
