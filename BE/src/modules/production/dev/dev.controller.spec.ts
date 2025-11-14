import { Test, TestingModule } from "@nestjs/testing";
import { ProductionDevController } from "./dev.controller";

describe("ProductionDevController", () => {
  let controller: ProductionDevController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionDevController],
    }).compile();

    controller = module.get<ProductionDevController>(ProductionDevController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
