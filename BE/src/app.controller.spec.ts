import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it("should return welcome message for guest", () => {
      const mockRequest = { user: undefined } as any;
      expect(appController.getWelcomeMessage(mockRequest)).toBe(
        "Welcome to Xuan Cau ERP, your authentication status is: Guest/Unauthenticated",
      );
    });

    it("should return welcome message for authenticated user", () => {
      const mockRequest = { user: { username: "admin" } } as any;
      expect(appController.getWelcomeMessage(mockRequest)).toBe(
        "Welcome to Xuan Cau ERP, your authentication status is: Authenticated",
      );
    });
  });
});
