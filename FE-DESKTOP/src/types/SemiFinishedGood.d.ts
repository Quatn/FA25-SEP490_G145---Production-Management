import { ManufacturingOrder } from "./ManufacturingOrder";

export type SemiFinishedGood = {
    _id?: string;
    manufacturingOrder?: ManufacturingOrder;
    currentQuantity: number;
    importedQuantity: number;
    exportedQuantity: number;
    exportedTo?: string;
    note?: string;
    createdAt?: string;
    updatedAt?: string;
};