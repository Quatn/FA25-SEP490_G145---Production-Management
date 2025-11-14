import { Test, TestingModule } from '@nestjs/testing';
import { WareManufacturingProcessTypeController } from './ware-manufacturing-process-type.controller';
import { WareManufacturingProcessTypeService } from './ware-manufacturing-process-type.service';

describe('WareManufacturingProcessController', () => {
  let controller: WareManufacturingProcessTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WareManufacturingProcessTypeController],
      providers: [WareManufacturingProcessTypeService],
    }).compile();

    controller = module.get<WareManufacturingProcessTypeController>(WareManufacturingProcessTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
