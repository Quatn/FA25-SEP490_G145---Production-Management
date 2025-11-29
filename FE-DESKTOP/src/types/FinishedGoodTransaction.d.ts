import { Employee } from "./Employee";
import { FinishedGood } from "./FinishedGood";

export type FinishedGoodTransaction = {
    _id?: string;
    finishedGood?: FinishedGood;
    employee?: string | Employee;
    transactionType: string;
    initialQuantity: number;
    finalQuantity: number;
    note?: string;
    transactionDate: string;
    createdAt?: string;
    updatedAt?: string;
};

export interface FinishedGoodTransactionHistory {
    index: number;
    createdDate: string;
    transactionType: 'IMPORT' | 'EXPORT';
    totalImport: number;
    totalExport: number;
    totalCurrent: number;
    employee: string;
    transactionDate: string;
    note: string;
}

export interface CreateFinishedGoodTransactionDTO {
    manufacturingOrder: string;
    manufacturingOrderCode?: string;
    transactionType: "IMPORT" | "EXPORT";
    quantity: number;
    transactionDate: string;
    note?: string;
    employee: string;
}