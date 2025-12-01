import { Employee } from "./Employee";

export type SemiFinishedGoodTransaction = {
  _id?: string;
  semiFinishedGood?: SemiFinishedGood;
  employee?: string | Employee;
  transactionType: string;
  initialQuantity: number;
  finalQuantity: number;
  note?: string;
  exportedTo?: string;
  transactionDate: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface SemiFinishedGoodTransactionHistory {
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

export interface CreateSemiFinishedGoodTransactionDTO {
  manufacturingOrder: string;
  manufacturingOrderCode?: string;
  transactionType: "IMPORT" | "EXPORT";
  quantity: number;
  transactionDate: string;
  exportedTo?: string;
  note?: string;
  employee: string;
}