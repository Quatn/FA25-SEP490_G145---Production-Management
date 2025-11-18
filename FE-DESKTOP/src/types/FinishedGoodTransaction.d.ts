import { Employee } from "./Employee";
import { FinishedGood } from "./FinishedGood";

export type FinishedGoodTransaction = {
    _id?: string;
    finishedGood?: FinishedGood;
    employee?: Employee;
    transactionType: string;
    initialQuantity: number;
    finalQuantity: number;
    note?: string;
    createdAt?: string;
    updatedAt?: string;
};