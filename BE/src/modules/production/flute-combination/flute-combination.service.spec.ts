import { Test, TestingModule } from '@nestjs/testing';
import { FluteCombinationService } from './flute-combination.service';

describe('FluteCombinationService', () => {
  let service: FluteCombinationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FluteCombinationService],
    }).compile();

    service = module.get<FluteCombinationService>(FluteCombinationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
