import { Test, TestingModule } from '@nestjs/testing';
import { SubPurchaseOrderController } from './sub-purchase-order.controller';

describe('SubPurchaseOrderController', () => {
  let controller: SubPurchaseOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubPurchaseOrderController],
    }).compile();

    controller = module.get<SubPurchaseOrderController>(SubPurchaseOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
