import { Test, TestingModule } from '@nestjs/testing';
import { WareFinishingProcessTypeService } from './ware-finishing-process-type.service';

describe('WareFinishingProcessTypeService', () => {
  let service: WareFinishingProcessTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WareFinishingProcessTypeService],
    }).compile();

    service = module.get<WareFinishingProcessTypeService>(WareFinishingProcessTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
