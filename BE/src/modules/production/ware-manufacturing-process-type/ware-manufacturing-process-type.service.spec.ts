import { Test, TestingModule } from '@nestjs/testing';
import { WareManufacturingProcessTypeService } from './ware-manufacturing-process-type.service';

describe('WareManufacturingProcessService', () => {
  let service: WareManufacturingProcessTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WareManufacturingProcessTypeService],
    }).compile();

    service = module.get<WareManufacturingProcessTypeService>(WareManufacturingProcessTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
