import { FinishedGoodTransaction } from "@/types/FinishedGoodTransaction";

export interface DailyReportDto {
    date: string;
    totalImport: number;
    totalExport: number;
    net: number;
    data: FinishedGoodTransaction[];
}