import { Test, TestingModule } from '@nestjs/testing';
import { FluteCombinationController } from './flute-combination.controller';
import { FluteCombinationService } from './flute-combination.service';

describe('FluteCombinationController', () => {
  let controller: FluteCombinationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FluteCombinationController],
      providers: [FluteCombinationService],
    }).compile();

    controller = module.get<FluteCombinationController>(FluteCombinationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
