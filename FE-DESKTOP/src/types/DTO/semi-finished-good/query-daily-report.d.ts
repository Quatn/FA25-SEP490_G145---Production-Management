import { SemiFinishedGoodTransaction } from "@/types/SemiFinishedTransaction";

export interface DailyReportDto {
    date: string;
    totalImport: number;
    totalExport: number;
    net: number;
    data: SemiFinishedGoodTransaction[];
}