import { Test, TestingModule } from '@nestjs/testing';
import { FinishedGoodController } from './finished-good.controller';
import { FinishedGoodService } from './finished-good.service';

describe('FinishedGoodController', () => {
  let controller: FinishedGoodController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinishedGoodController],
      providers: [FinishedGoodService],
    }).compile();

    controller = module.get<FinishedGoodController>(FinishedGoodController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
