import { Test, TestingModule } from "@nestjs/testing";
import { ProductionRecalculateService } from "./recalculate.service";

describe("ProductionRecalculateService", () => {
  let service: ProductionRecalculateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductionRecalculateService],
    }).compile();

    service = module.get<ProductionRecalculateService>(
      ProductionRecalculateService,
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
