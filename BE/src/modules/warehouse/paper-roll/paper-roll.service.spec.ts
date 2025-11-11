import { Test, TestingModule } from '@nestjs/testing';
import { PaperRollService } from './paper-roll.service';

describe('PaperRollService', () => {
  let service: PaperRollService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaperRollService],
    }).compile();

    service = module.get<PaperRollService>(PaperRollService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
