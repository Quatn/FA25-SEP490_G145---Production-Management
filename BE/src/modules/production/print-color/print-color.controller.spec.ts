import { Test, TestingModule } from '@nestjs/testing';
import { PrintColorController } from './print-color.controller';

describe('PrintColorController', () => {
  let controller: PrintColorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrintColorController],
    }).compile();

    controller = module.get<PrintColorController>(PrintColorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
