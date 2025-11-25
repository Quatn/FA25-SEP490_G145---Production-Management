import { Test, TestingModule } from "@nestjs/testing";
import { CustomerController } from "./customer.controller";
import { CustomerService } from "./customer.service";
import { BaseResponse } from "@/common/dto/response.dto";
import { Customer } from "../schemas/customer.schema";

describe("CustomerController", () => {
  let controller: CustomerController;
  let service: CustomerService;

  const mockCustomerService = {
    findAll: jest.fn(),
    findPaginated: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CustomerService,
          useValue: mockCustomerService,
        },
      ],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
    service = module.get<CustomerService>(CustomerService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  // -------------------------------------------
  // TEST 1: findAll()
  // -------------------------------------------
  it("should return all customers", async () => {
    const mockData: Customer[] = [
      { _id: "1", code: "C001", name: "Customer A" } as any,
      { _id: "2", code: "C002", name: "Customer B" } as any,
    ];

    mockCustomerService.findAll.mockResolvedValue(mockData);

    const result = await controller.findAll();

    expect(result).toEqual<BaseResponse<Customer[]>>({
      success: true,
      message: "Fetch successful",
      data: mockData,
    });

    expect(service.findAll).toHaveBeenCalled();
  });

  // -------------------------------------------
  // TEST 2: findPaginated()
  // -------------------------------------------
  it("should return paginated customers", async () => {
    const mockPaginated = {
      total: 2,
      page: 1,
      limit: 10,
      data: [
        { _id: "1", code: "C001", name: "Customer A" },
        { _id: "2", code: "C002", name: "Customer B" },
      ],
    };

    mockCustomerService.findPaginated.mockResolvedValue(mockPaginated);

    const result = await controller.findPaginated(1, 10, "C");

    expect(result).toEqual<BaseResponse<any>>({
      success: true,
      message: "Fetch successful",
      data: mockPaginated,
    });

    expect(service.findPaginated).toHaveBeenCalledWith(1, 10, "C");
  });

  // -------------------------------------------
  // TEST 3: detail()
  // -------------------------------------------
  it("should return customer detail", async () => {
    const mockCustomer = {
      _id: "1",
      code: "C001",
      name: "Customer A",
      address: null,
      email: null,
      contactNumber: null,
      note: "",
    };

    mockCustomerService.findOne.mockResolvedValue(mockCustomer);

    const result = await controller.detail("1");

    expect(result).toEqual<BaseResponse<any>>({
      success: true,
      message: "Fetch successful",
      data: mockCustomer,
    });

    expect(service.findOne).toHaveBeenCalledWith("1");
  });
});
