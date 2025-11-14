import { Test, TestingModule } from '@nestjs/testing';
import { PaperTypeController } from './paper-type.controller';

describe('PaperTypeController', () => {
  let controller: PaperTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaperTypeController],
    }).compile();

    controller = module.get<PaperTypeController>(PaperTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
