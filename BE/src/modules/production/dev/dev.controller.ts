import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import {
  ManufacturingOrder,
  ManufacturingOrderDocument,
} from "../schemas/manufacturing-order.schema";
import { BaseResponse } from "@/common/dto/response.dto";
import { ProductionDevService } from "./dev.service";
import { FluteCombination } from "../schemas/flute-combination.schema";
import { WareManufacturingProcessType } from "../schemas/ware-manufacturing-process-type.schema";
import { PrintColor } from "../schemas/print-color.schema";
import { WareFinishingProcessType } from "../schemas/ware-finishing-process-type.schema";
import { Customer } from "../schemas/customer.schema";
import { PurchaseOrder } from "../schemas/purchase-order.schema";
import { Product } from "../schemas/product.schema";
import { Ware } from "../schemas/ware.schema";
import { SubPurchaseOrder } from "../schemas/sub-purchase-order.schema";
import { PurchaseOrderItem } from "../schemas/purchase-order-item.schema";
import { DevOnlyGuard } from "@/common/guards/dev.guard";

@UseGuards(DevOnlyGuard)
@Controller("production-dev")
export class ProductionDevController {
  constructor(private service: ProductionDevService) { }

  @Get("list-all-mo")
  @ApiOperation({ summary: "List manufacturing orders" })
  async findAllMO(): Promise<BaseResponse<ManufacturingOrderDocument[]>> {
    const docs = await this.service.findAllMO();
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  @Post("import-mo")
  @ApiOperation({ summary: "Import flute combination array" })
  async importMO(@Body() body: ManufacturingOrder[]): Promise<BaseResponse> {
    const _docs = await this.service.importMO(body);
    return {
      success: true,
      message: "Import successful",
    };
  }

  @Get("list-mo-populated")
  @ApiOperation({ summary: "List manufacturing orders" })
  async findAndPopulateMO(): Promise<
    BaseResponse<ManufacturingOrderDocument[]>
  > {
    const docs = await this.service.findAndPopulateMO();
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  @Get("list-all-flute-combs")
  @ApiOperation({ summary: "List manufacturing orders" })
  async findAllFluteCombs(): Promise<BaseResponse<FluteCombination[]>> {
    const docs = await this.service.findAllFluteCombs();
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  @Post("import-flute-combs")
  @ApiOperation({ summary: "Import flute combination array" })
  async importFluteCombination(
    @Body() body: FluteCombination[],
  ): Promise<BaseResponse> {
    const _docs = await this.service.importFluteCombs(body);
    return {
      success: true,
      message: "Import successful",
    };
  }

  @Get("list-all-ware-manufacturing-process-type")
  @ApiOperation({ summary: "List manufacturing orders" })
  async findAllWareManufacturingProcessType(): Promise<
    BaseResponse<WareManufacturingProcessType[]>
  > {
    const docs = await this.service.findAllWareManufacturingProcessType();
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  @Post("import-ware-manufacturing-process-type")
  @ApiOperation({ summary: "Import flute combination array" })
  async importWareManufacturingProcessType(
    @Body() body: WareManufacturingProcessType[],
  ): Promise<BaseResponse> {
    const _docs = await this.service.importWareManufacturingProcessType(body);
    return {
      success: true,
      message: "Import successful",
    };
  }

  @Get("list-all-print-color")
  @ApiOperation({ summary: "List manufacturing orders" })
  async findAllPrintColor(): Promise<BaseResponse<PrintColor[]>> {
    const docs = await this.service.findAllPrintColor();
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  @Post("import-print-color")
  @ApiOperation({ summary: "Import flute combination array" })
  async importPrintColor(@Body() body: PrintColor[]): Promise<BaseResponse> {
    const _docs = await this.service.importPrintColor(body);
    return {
      success: true,
      message: "Import successful",
    };
  }

  @Get("list-all-ware-finishing-process-type")
  @ApiOperation({ summary: "List manufacturing orders" })
  async findAllWareFinishingProcessType(): Promise<
    BaseResponse<WareFinishingProcessType[]>
  > {
    const docs = await this.service.findAllWareFinishingProcessType();
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  @Post("import-ware-finishing-process-type")
  @ApiOperation({ summary: "Import flute combination array" })
  async importWareFinishingProcessType(
    @Body() body: WareFinishingProcessType[],
  ): Promise<BaseResponse> {
    const _docs = await this.service.importWareFinishingProcessType(body);
    return {
      success: true,
      message: "Import successful",
    };
  }

  @Get("list-all-customer")
  @ApiOperation({ summary: "List manufacturing orders" })
  async findAllCustomer(): Promise<BaseResponse<Customer[]>> {
    const docs = await this.service.findAllCustomer();
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  @Post("import-customer")
  @ApiOperation({ summary: "Import flute combination array" })
  async importCustomer(@Body() body: Customer[]): Promise<BaseResponse> {
    const _docs = await this.service.importCustomer(body);
    return {
      success: true,
      message: "Import successful",
    };
  }

  @Get("list-all-purchase-order")
  @ApiOperation({ summary: "List manufacturing orders" })
  async findAllPurchaseOrder(): Promise<BaseResponse<PurchaseOrder[]>> {
    const docs = await this.service.findAllPurchaseOrder();
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  @Post("import-purchase-order")
  @ApiOperation({ summary: "Import flute combination array" })
  async importPurchaseOrder(
    @Body() body: PurchaseOrder[],
  ): Promise<BaseResponse> {
    const _docs = await this.service.importPurchaseOrder(body);
    return {
      success: true,
      message: "Import successful",
    };
  }

  @Get("list-all-ware")
  @ApiOperation({ summary: "List manufacturing orders" })
  async findAllWare(): Promise<BaseResponse<Ware[]>> {
    const docs = await this.service.findAllWare();
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  @Post("import-ware")
  @ApiOperation({ summary: "Import flute combination array" })
  async importWare(@Body() body: Ware[]): Promise<BaseResponse> {
    const _docs = await this.service.importWare(body);
    return {
      success: true,
      message: "Import successful",
    };
  }

  @Get("list-all-product")
  @ApiOperation({ summary: "List manufacturing orders" })
  async findAllProduct(): Promise<BaseResponse<Product[]>> {
    const docs = await this.service.findAllProduct();
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  @Post("import-product")
  @ApiOperation({ summary: "Import flute combination array" })
  async importProduct(@Body() body: Product[]): Promise<BaseResponse> {
    const _docs = await this.service.importProduct(body);
    return {
      success: true,
      message: "Import successful",
    };
  }

  @Get("list-all-sub-purchase-order")
  @ApiOperation({ summary: "List manufacturing orders" })
  async findAllSubPurchaseOrder(): Promise<BaseResponse<SubPurchaseOrder[]>> {
    const docs = await this.service.findAllSubPurchaseOrder();
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  @Post("import-sub-purchase-order")
  @ApiOperation({ summary: "Import flute combination array" })
  async importSubPurchaseOrder(
    @Body() body: SubPurchaseOrder[],
  ): Promise<BaseResponse> {
    const _docs = await this.service.importSubPurchaseOrder(body);
    return {
      success: true,
      message: "Import successful",
    };
  }

  @Get("list-all-purchase-order-item")
  @ApiOperation({ summary: "List manufacturing orders" })
  async findAllPurchaseOrderItem(): Promise<BaseResponse<PurchaseOrderItem[]>> {
    const docs = await this.service.findAllPurchaseOrderItem();
    return {
      success: true,
      message: "Fetch successful",
      data: docs,
    };
  }

  @Post("import-purchase-order-item")
  @ApiOperation({ summary: "Import flute combination array" })
  async importPurchaseOrderItem(
    @Body() body: PurchaseOrderItem[],
  ): Promise<BaseResponse> {
    const _docs = await this.service.importPurchaseOrderItem(body);
    return {
      success: true,
      message: "Import successful",
    };
  }
}
