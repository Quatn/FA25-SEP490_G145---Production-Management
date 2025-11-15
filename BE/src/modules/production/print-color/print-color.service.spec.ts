import { Test, TestingModule } from '@nestjs/testing';
import { PrintColorService } from './print-color.service';

describe('PrintColorService', () => {
  let service: PrintColorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrintColorService],
    }).compile();

    service = module.get<PrintColorService>(PrintColorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
