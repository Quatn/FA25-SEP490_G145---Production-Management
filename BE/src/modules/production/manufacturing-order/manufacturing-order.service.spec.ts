import { Test, TestingModule } from "@nestjs/testing";
import { ManufacturingOrderService } from "./manufacturing-order.service";

describe("ManufacturingOrderService", () => {
  let service: ManufacturingOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ManufacturingOrderService],
    }).compile();

    service = module.get<ManufacturingOrderService>(ManufacturingOrderService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
