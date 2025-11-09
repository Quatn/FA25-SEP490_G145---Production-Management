import { Test, TestingModule } from "@nestjs/testing";
import { ProductionDevService } from "./dev.service";

describe("ProductionDevService", () => {
  let service: ProductionDevService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductionDevService],
    }).compile();

    service = module.get<ProductionDevService>(ProductionDevService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
