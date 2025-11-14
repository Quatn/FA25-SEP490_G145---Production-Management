import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  ManufacturingOrder,
  ManufacturingOrderSchema,
} from "../schemas/manufacturing-order.schema";
import { Model } from "mongoose";
import { CreateManufacturingOrderRequestDto } from "../manufacturing-order/dto/create-order-request.dto";
import { FluteCombination } from "../schemas/flute-combination.schema";
import { WareManufacturingProcessType } from "../schemas/ware-manufacturing-process-type.schema";
import { PrintColor } from "../schemas/print-color.schema";
import { WareFinishingProcessType } from "../schemas/ware-finishing-process-type.schema";
import { Customer } from "../schemas/customer.schema";
import {
  PurchaseOrder,
  PurchaseOrderSchema,
} from "../schemas/purchase-order.schema";
import { Product } from "../schemas/product.schema";
import { Ware } from "../schemas/ware.schema";
import {
  SubPurchaseOrder,
  SubPurchaseOrderSchema,
} from "../schemas/sub-purchase-order.schema";
import {
  PurchaseOrderItem,
  PurchaseOrderItemSchema,
} from "../schemas/purchase-order-item.schema";

@Injectable()
export class ProductionDevService {
  constructor(
    @InjectModel(
      ManufacturingOrder.name,
    ) private readonly manufacturingOrderModel: Model<ManufacturingOrder>,
    @InjectModel(FluteCombination.name) private readonly fluteCombinationModel:
      Model<FluteCombination>,
    @InjectModel(
      WareManufacturingProcessType.name,
    ) private readonly wareManufacturingProcessTypeModel: Model<
      WareManufacturingProcessType
    >,
    @InjectModel(PrintColor.name) private readonly printColorModel: Model<
      PrintColor
    >,
    @InjectModel(
      WareFinishingProcessType.name,
    ) private readonly wareFinishingProcessTypeModel: Model<
      WareFinishingProcessType
    >,
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
    @InjectModel(PurchaseOrder.name) private readonly purchaseOrderModel: Model<
      PurchaseOrder
    >,
    @InjectModel(Ware.name) private readonly wareModel: Model<Ware>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(SubPurchaseOrder.name) private readonly subPurchaseOrderModel:
      Model<SubPurchaseOrder>,
    @InjectModel(
      PurchaseOrderItem.name,
    ) private readonly purchaseOrderItemModel: Model<PurchaseOrderItem>,
  ) {}

  async findAllMO() {
    return await this.manufacturingOrderModel.find();
  }

  async createOneMO(dto: CreateManufacturingOrderRequestDto) {
    const doc = new this.manufacturingOrderModel(dto);
    return await doc.save();
  }

  async importMO(combs: ManufacturingOrder[]) {
    for (const comb of combs) {
      const doc = new this.manufacturingOrderModel(comb);
      await doc.save();
    }

    return true;
  }

  async findAndPopulateMO() {
    const poiPath = ManufacturingOrderSchema.path("purchaseOrderItem");
    const subpoPath = PurchaseOrderItemSchema.path("subPurchaseOrder");
    const warePath = PurchaseOrderItemSchema.path("ware");
    const poPath = SubPurchaseOrderSchema.path("purchaseOrder");
    const customerPath = PurchaseOrderSchema.path("customer");
    return await this.manufacturingOrderModel.find().populate({
      path: poiPath.path,
      populate: [
        { path: warePath.path },
        {
          path: subpoPath.path,
          populate: {
            path: poPath.path,
            populate: { path: customerPath.path },
          },
        },
      ],
    });
  }

  async findAllFluteCombs() {
    return await this.fluteCombinationModel.find();
  }

  async importFluteCombs(combs: FluteCombination[]) {
    for (const comb of combs) {
      const doc = new this.fluteCombinationModel(comb);
      await doc.save();
    }

    return true;
  }

  async findAllWareManufacturingProcessType() {
    return await this.wareManufacturingProcessTypeModel.find();
  }

  async importWareManufacturingProcessType(
    combs: WareManufacturingProcessType[],
  ) {
    for (const comb of combs) {
      const doc = new this.wareManufacturingProcessTypeModel(comb);
      await doc.save();
    }

    return true;
  }

  async findAllPrintColor() {
    return await this.printColorModel.find();
  }

  async importPrintColor(combs: PrintColor[]) {
    for (const comb of combs) {
      const doc = new this.printColorModel(comb);
      await doc.save();
    }

    return true;
  }

  async findAllWareFinishingProcessType() {
    return await this.wareFinishingProcessTypeModel.find();
  }

  async importWareFinishingProcessType(combs: WareFinishingProcessType[]) {
    for (const comb of combs) {
      const doc = new this.wareFinishingProcessTypeModel(comb);
      await doc.save();
    }

    return true;
  }

  async findAllCustomer() {
    return await this.customerModel.find();
  }

  async importCustomer(combs: Customer[]) {
    for (const comb of combs) {
      const doc = new this.customerModel(comb);
      await doc.save();
    }

    return true;
  }

  async findAllPurchaseOrder() {
    return await this.purchaseOrderModel.find();
  }

  async importPurchaseOrder(combs: PurchaseOrder[]) {
    for (const comb of combs) {
      const doc = new this.purchaseOrderModel(comb);
      await doc.save();
    }

    return true;
  }

  async findAllWare() {
    return await this.wareModel.find();
  }

  async importWare(combs: Ware[]) {
    for (const comb of combs) {
      const doc = new this.wareModel(comb);
      await doc.save();
    }

    return true;
  }

  async findAllProduct() {
    return await this.productModel.find();
  }

  async importProduct(combs: Product[]) {
    for (const comb of combs) {
      const doc = new this.productModel(comb);
      await doc.save();
    }

    return true;
  }

  async findAllSubPurchaseOrder() {
    return await this.subPurchaseOrderModel.find();
  }

  async importSubPurchaseOrder(combs: SubPurchaseOrder[]) {
    for (const comb of combs) {
      const doc = new this.subPurchaseOrderModel(comb);
      await doc.save();
    }

    return true;
  }

  async findAllPurchaseOrderItem() {
    return await this.purchaseOrderItemModel.find();
  }

  async importPurchaseOrderItem(combs: PurchaseOrderItem[]) {
    for (const comb of combs) {
      const doc = new this.purchaseOrderItemModel(comb);
      await doc.save();
    }

    return true;
  }
}
