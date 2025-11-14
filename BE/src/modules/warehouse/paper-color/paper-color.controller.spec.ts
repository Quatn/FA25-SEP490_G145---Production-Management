import { Test, TestingModule } from '@nestjs/testing';
import { PaperColorController } from './paper-color.controller';

describe('PaperColorController', () => {
  let controller: PaperColorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaperColorController],
    }).compile();

    controller = module.get<PaperColorController>(PaperColorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
