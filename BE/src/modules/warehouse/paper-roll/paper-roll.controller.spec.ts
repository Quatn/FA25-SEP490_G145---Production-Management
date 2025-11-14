import { Test, TestingModule } from '@nestjs/testing';
import { PaperRollController } from './paper-roll.controller';
import { PaperRollService } from './paper-roll.service';

describe('PaperRollController', () => {
  let controller: PaperRollController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaperRollController],
      providers: [PaperRollService],
    }).compile();

    controller = module.get<PaperRollController>(PaperRollController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
