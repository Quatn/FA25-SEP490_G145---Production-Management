import { Test, TestingModule } from '@nestjs/testing';
import { SubPurchaseOrderService } from './sub-purchase-order.service';

describe('SubPurchaseOrderService', () => {
  let service: SubPurchaseOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubPurchaseOrderService],
    }).compile();

    service = module.get<SubPurchaseOrderService>(SubPurchaseOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
