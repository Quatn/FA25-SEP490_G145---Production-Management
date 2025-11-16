import { Employee } from "./Employee";

export type SemiFinishedGoodTransaction = {
  _id?: string;
  semiFinishedGoodId: string;
  semiFinishedGood?: SemiFinishedGood;
  employeeId: string;
  employee?: Employee;
  transactionType: string;
  initialQuantity: number;
  finalQuantity: number;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
};