import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrderItemController } from './purchase-order-item.controller';

describe('PurchaseOrderItemController', () => {
  let controller: PurchaseOrderItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseOrderItemController],
    }).compile();

    controller = module.get<PurchaseOrderItemController>(PurchaseOrderItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
