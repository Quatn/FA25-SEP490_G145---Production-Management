import { Test, TestingModule } from '@nestjs/testing';
import { OrderFinishingProcessController } from './order-finishing-process.controller';
import { OrderFinishingProcessService } from './order-finishing-process.service';

describe('OrderFinishingProcessController', () => {
  let controller: OrderFinishingProcessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderFinishingProcessController],
      providers: [OrderFinishingProcessService],
    }).compile();

    controller = module.get<OrderFinishingProcessController>(OrderFinishingProcessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
