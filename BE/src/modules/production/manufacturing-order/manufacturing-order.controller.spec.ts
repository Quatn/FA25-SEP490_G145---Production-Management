import { Test, TestingModule } from "@nestjs/testing";
import { ManufacturingOrderController } from "./manufacturing-order.controller";

describe("ManufacturingOrderController", () => {
  let controller: ManufacturingOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManufacturingOrderController],
    }).compile();

    controller = module.get<ManufacturingOrderController>(
      ManufacturingOrderController,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
