export interface FinishedGoodBreakdownDate {
    date: string;
    quantity: number;
}

export interface FinishedGoodDailyReportItem {
    finishedGood: any; // populated finished good object (MO, POI, ware, flute, subPO, PO, customer...)
    totalQuantity: number;
    breakdownPerDate: FinishedGoodBreakdownDate[];
}

export interface FinishedGoodDailyReportResponse {
    fromDate?: string;
    toDate?: string;
    page: number | null;
    limit: number | null;
    totalFinishedGoods: number;
    totalPages: number;
    data: FinishedGoodDailyReportItem[];
}

