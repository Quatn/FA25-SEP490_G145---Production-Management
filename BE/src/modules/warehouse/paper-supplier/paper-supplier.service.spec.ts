import { Test, TestingModule } from '@nestjs/testing';
import { PaperSupplierService } from './paper-supplier.service';

describe('PaperSupplierService', () => {
  let service: PaperSupplierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaperSupplierService],
    }).compile();

    service = module.get<PaperSupplierService>(PaperSupplierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
