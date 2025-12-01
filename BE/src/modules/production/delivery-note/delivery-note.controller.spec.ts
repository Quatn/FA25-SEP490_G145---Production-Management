import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryNoteController } from './delivery-note.controller';

describe('DeliveryNoteController', () => {
  let controller: DeliveryNoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryNoteController],
    }).compile();

    controller = module.get<DeliveryNoteController>(DeliveryNoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
