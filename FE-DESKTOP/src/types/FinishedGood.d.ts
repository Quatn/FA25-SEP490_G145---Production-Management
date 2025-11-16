import { ManufacturingOrder } from "./ManufacturingOrder";

export type FinishedGood = {
    _id?: string;
    manufacturingOrderId: string;
    manufacturingOrder?: ManufacturingOrder;
    currentQuantity: number;
    note?: string;
};