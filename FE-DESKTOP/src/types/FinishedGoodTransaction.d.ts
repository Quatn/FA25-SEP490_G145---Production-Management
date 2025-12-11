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
    transactionType: "IMPORT" | "EXPORT" | "ADJUSTMENT";
    quantity: number;
    transactionDate: string;
    note?: string;
    employee: string;
}

export interface BreakdownPerDate {
    date: string;
    quantity: number;
}

export interface FinishedGoodDailyItem {
    _id: string;
    finishedGood: FinishedGood;
    totalQuantity: number;
    breakdownPerDate: BreakdownPerDate[];
}

export interface FinishedGoodDailyReportResponse {
    fromDate: string;
    toDate: string;
    page: number;
    limit: number;
    totalFinishedGoods: number;
    totalPages: number;
    data: FinishedGoodDailyItem[];
}

export interface GetFinishedGoodDetailDto {
    startDate?: string;
    endDate?: string;
    transactionType?: string;
    finishedGood?: string
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
}

export interface GetFinishedGoodDailyReportDto {
    startDate?: string;
    endDate?: string;
    transactionType?: string;
    search?: string;
    page?: number;
    limit?: number;
}