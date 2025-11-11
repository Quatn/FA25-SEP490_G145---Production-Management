import { Test, TestingModule } from '@nestjs/testing';
import { PaperSupplierController } from './paper-supplier.controller';

describe('PaperSupplierController', () => {
  let controller: PaperSupplierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaperSupplierController],
    }).compile();

    controller = module.get<PaperSupplierController>(PaperSupplierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
