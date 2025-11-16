import { ManufacturingOrder } from "./ManufacturingOrder";

export type SemiFinishedGood = {
    _id?: string;
    manufacturingOrderId: string;
    manufacturingOrder?: ManufacturingOrder;
    currentQuantity: number;
    note?: string;
};