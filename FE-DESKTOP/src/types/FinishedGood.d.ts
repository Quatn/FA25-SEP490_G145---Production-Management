import { ManufacturingOrder } from "./ManufacturingOrder";

export type FinishedGood = {
    _id?: string;
    manufacturingOrder?: ManufacturingOrder;
    importedQuantity: number;
    exportedQuantity: number;
    currentQuantity: number;
    note?: string;
    currentStatus?: string;
    createdAt?: string;
    updatedAt?: string;
};