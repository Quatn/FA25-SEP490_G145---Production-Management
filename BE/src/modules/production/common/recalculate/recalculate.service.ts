import { Injectable } from "@nestjs/common";
import {
  ManufacturingOrder,
  ManufacturingOrderDocument,
  ManufacturingOrderSchema,
} from "../../schemas/manufacturing-order.schema";
import { Model, ObjectId } from "mongoose";
import { Types } from "mongoose";
import { BusinessLogicError } from "@/common/errors/business-logic.error";
import { isRefPopulated } from "@/common/utils/populate-check";
import { UnpopulatedFieldError } from "@/common/errors/unpopulated-field.error";
import { recalculateManufacturingOrder } from "../../manufacturing-order/business-logics/recalculate-manufacturing-orders";
import { InjectModel } from "@nestjs/mongoose";
import {
  PurchaseOrderItem,
  PurchaseOrderItemDocument,
  PurchaseOrderItemSchema,
} from "../../schemas/purchase-order-item.schema";
import { Ware, WareDocument, WareSchema } from "../../schemas/ware.schema";
import { recalculateWare } from "../../ware/business-logics/recalculate-ware";
import { recalculatePurchaseOrderItem } from "../../purchase-order-item/business-logics/recalculate-poi";
import { SubPurchaseOrderSchema } from "../../schemas/sub-purchase-order.schema";
import { PurchaseOrderSchema } from "../../schemas/purchase-order.schema";
import { OrderFinishingProcess } from "../../schemas/order-finishing-process.schema";

@Injectable()
export class ProductionRecalculateService {
  constructor(
    @InjectModel(ManufacturingOrder.name)
    private readonly manufacturingOrderModel: Model<ManufacturingOrder>,
    @InjectModel(PurchaseOrderItem.name)
    private readonly purchaseOrderItemModel: Model<PurchaseOrderItem>,
    @InjectModel(Ware.name)
    private readonly wareModel: Model<Ware>,
    @InjectModel(OrderFinishingProcess.name)
    private readonly orderFinishingProcessModel: Model<OrderFinishingProcess>,
  ) { }
  async checkAndRecalculateWareById(wareId: Types.ObjectId) {
    const wareDoc = await this.wareModel.findById(wareId);

    if (!wareDoc) {
      throw new BusinessLogicError(
        "Attempting to recalculated an PurchaseOrderItem that does not exists",
      );
    }

    const wareManufacturingProcessTypePath = WareSchema.path(
      "wareManufacturingProcessType",
    );
    const fluteCombinationPath = WareSchema.path("fluteCombination");

    const populate = [wareManufacturingProcessTypePath, fluteCombinationPath];

    const populatedDoc = await wareDoc.populate(populate);

    const res = await this.checkAndRecalculateWareDoc(populatedDoc);

    return res;
  }

  async checkAndRecalculateWareDoc(wareDoc: WareDocument) {
    if (wareDoc.recalculateFlag) {
      const recalculatedOrder = recalculateWare(wareDoc);
      Object.assign(wareDoc, recalculatedOrder);
      await wareDoc.save();
      return wareDoc;
    }
    return wareDoc;
  }

  async checkAndRecalculatePurchaseOrderItemById(poiId: Types.ObjectId) {
    const poiDoc = await this.purchaseOrderItemModel.findById(poiId);

    if (!poiDoc) {
      throw new BusinessLogicError(
        "Attempting to recalculated an PurchaseOrderItem that does not exists",
      );
    }

    const subpoPath = PurchaseOrderItemSchema.path("subPurchaseOrder");
    const warePath = PurchaseOrderItemSchema.path("ware");
    const poPath = SubPurchaseOrderSchema.path("purchaseOrder");
    const customerPath = PurchaseOrderSchema.path("customer");
    const wareManufacturingProcessTypePath = WareSchema.path(
      "wareManufacturingProcessType",
    );
    const fluteCombinationPath = WareSchema.path("fluteCombination");

    const populate = [
      {
        path: subpoPath.path,
        populate: [
          {
            path: poPath.path,
            populate: { path: customerPath.path },
          },
        ],
      },
      {
        path: warePath.path,
        populate: [wareManufacturingProcessTypePath, fluteCombinationPath],
      },
    ];

    const populatedDoc = await poiDoc.populate(populate);

    return await this.checkAndRecalculatePurchaseOrderItemDoc(populatedDoc);
  }

  async checkAndRecalculatePurchaseOrderItemDoc(
    poi: PurchaseOrderItemDocument,
  ) {
    if (poi.recalculateFlag) {
      if (!isRefPopulated(poi.ware)) {
        throw new UnpopulatedFieldError(
          "poi.ware must be populated before it is passed to poi recalculate function",
        );
      }

      if (poi.ware.recalculateFlag)
        poi.ware = await this.checkAndRecalculateWareById(
          (poi.ware as unknown as { _id: Types.ObjectId })._id,
        );

      const recalculatedOrder = recalculatePurchaseOrderItem(poi);
      Object.assign(poi, recalculatedOrder);
      await poi.save();
      return poi;
    }
    return poi;
  }

  async checkAndRecalculateManufacturingOrderById(moId: Types.ObjectId) {
    const moDoc = await this.manufacturingOrderModel.findById(moId);

    if (!moDoc) {
      throw new BusinessLogicError(
        "Attempting to recalculated an MO that does not exists",
      );
    }

    const poiPath = ManufacturingOrderSchema.path("purchaseOrderItem");
    const subpoPath = PurchaseOrderItemSchema.path("subPurchaseOrder");
    const warePath = PurchaseOrderItemSchema.path("ware");
    const poPath = SubPurchaseOrderSchema.path("purchaseOrder");
    const customerPath = PurchaseOrderSchema.path("customer");
    const wareManufacturingProcessTypePath = WareSchema.path(
      "wareManufacturingProcessType",
    );
    const fluteCombinationPath = WareSchema.path("fluteCombination");

    const populate = {
      path: poiPath.path,
      populate: [
        {
          path: subpoPath.path,
          populate: [
            {
              path: poPath.path,
              populate: { path: customerPath.path },
            },
          ],
        },
        {
          path: warePath.path,
          populate: [wareManufacturingProcessTypePath, fluteCombinationPath],
        },
      ],
    };

    const populatedDoc = await moDoc.populate(populate);

    return await this.checkAndRecalculateManufacturingOrderDoc(populatedDoc);
  }

  async checkAndRecalculateManufacturingOrderDoc(
    mo: ManufacturingOrderDocument,
  ) {
    if (!isRefPopulated(mo.purchaseOrderItem)) {
      throw new UnpopulatedFieldError(
        "mo.purchaseOrderItem must be populated before it is passed to mo recalculate function",
      );
    }

    if (!isRefPopulated(mo.purchaseOrderItem.ware)) {
      throw new UnpopulatedFieldError(
        "mo.purchaseOrderItem.ware must be populated before it is passed to mo recalculate function",
      );
    }

    if (
      mo.recalculateFlag ||
      mo.purchaseOrderItem.ware.recalculateFlag ||
      mo.purchaseOrderItem.recalculateFlag
    ) {
      const recalcWare = mo.purchaseOrderItem.ware.recalculateFlag;
      const recalcPOI = mo.purchaseOrderItem.recalculateFlag;

      if (recalcWare) {
        const wareDoc = this.wareModel.hydrate(mo.purchaseOrderItem.ware);
        const res = await this.checkAndRecalculateWareDoc(wareDoc);
        mo.purchaseOrderItem.ware = res;
      }

      if (recalcWare || recalcPOI) {
        const poiDoc = this.purchaseOrderItemModel.hydrate(
          mo.purchaseOrderItem,
        );

        const res = await this.checkAndRecalculatePurchaseOrderItemDoc(poiDoc);
        mo.purchaseOrderItem = res;
      }

      await this.orderFinishingProcessModel.updateMany(
        { manufacturingOrder: mo._id },
        {
          $set: { requiredAmount: mo.amount },
        },
      );

      const recalculatedOrder = recalculateManufacturingOrder(mo);

      Object.assign(mo, recalculatedOrder);
      await mo.save();
      return mo;
    }
    return mo;
  }
}
