import { FinishedGoodTransaction } from "@/types/FinishedGoodTransaction";

export interface FinishedGoodSummary {
    finishedGood: FinishedGood;
    total: number;
}

export interface DailySummary {
    date: string;
    dailyTotal: number;
    summaryPerFinishedGood: FinishedGoodSummary[];
}

export interface DailyReportDto {
    success: boolean;
    message: string;
    startDate: string;
    endDate: string;
    dailySummary: DailySummary[];
}