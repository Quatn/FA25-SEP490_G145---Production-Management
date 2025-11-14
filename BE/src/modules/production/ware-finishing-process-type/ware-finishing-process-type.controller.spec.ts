import { Test, TestingModule } from '@nestjs/testing';
import { WareFinishingProcessTypeController } from './ware-finishing-process-type.controller';
import { WareFinishingProcessTypeService } from './ware-finishing-process-type.service';

describe('WareFinishingProcessTypeController', () => {
  let controller: WareFinishingProcessTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WareFinishingProcessTypeController],
      providers: [WareFinishingProcessTypeService],
    }).compile();

    controller = module.get<WareFinishingProcessTypeController>(WareFinishingProcessTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
