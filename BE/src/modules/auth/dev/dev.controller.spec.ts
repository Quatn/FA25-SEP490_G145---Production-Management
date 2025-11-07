import { Test, TestingModule } from "@nestjs/testing";
import { AuthDevController } from "./dev.controller";

describe("AuthDevController", () => {
  let controller: AuthDevController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthDevController],
    }).compile();

    controller = module.get<AuthDevController>(AuthDevController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
