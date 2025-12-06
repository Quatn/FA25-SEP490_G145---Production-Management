import { Test, TestingModule } from '@nestjs/testing';
import { OrderFinishingProcessService } from './order-finishing-process.service';

describe('OrderFinishingProcessService', () => {
  let service: OrderFinishingProcessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderFinishingProcessService],
    }).compile();

    service = module.get<OrderFinishingProcessService>(OrderFinishingProcessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
