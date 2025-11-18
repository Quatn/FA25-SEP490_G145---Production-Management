"use client";

import React, { useState } from "react";
import { Box, Flex, Input, Button, Spinner, Field } from "@chakra-ui/react";
import { FaFileExcel } from "react-icons/fa";
import { useGetFGDailyReportQuery } from "@/service/api/finishedGoodTransactionApiSlice";
import FinishedDailyReportTable from "./FinishedDailyReportTable";
import exportDailyReportToExcel from "./FinishedExportExcelButton";

const FinishedDailyReport: React.FC = () => {
    const today = new Date();
    const localDate = today.toISOString().slice(0, 10);

    const [startDate, setStartDate] = useState<string>(localDate);
    const [endDate, setEndDate] = useState<string>(localDate);

    const { data: importData, isLoading: importIsLoading, error: importError } = useGetFGDailyReportQuery({
        startDate,
        endDate,
        transactionType: "IMPORT",
    });

    const { data: exportData, isLoading: exportIsLoading, error: exportError } = useGetFGDailyReportQuery({
        startDate,
        endDate,
        transactionType: "EXPORT",
    });

    const importReport = importData?.data ?? null;
    const exportReport = exportData?.data ?? null;

    if (importIsLoading || exportIsLoading) return <Spinner />;
    if (importError || exportError) return <Box>Không thể tải dữ liệu</Box>;

    return (
        <Box p={4}>
            {/* Filters + Export */}
            <Flex mb={4} gap={4} align="end">
                <Field.Root>
                    <Field.Label>Từ Ngày</Field.Label>
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        max={localDate}
                        width="200px"
                    />
                </Field.Root>
                <Field.Root>
                    <Field.Label>Đến Ngày</Field.Label>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        max={localDate}
                        width="200px"
                    />
                </Field.Root>
                <Field.Root alignItems="end">
                    <Field.Label>Báo Cáo Excel</Field.Label>
                    <Button
                        colorScheme="green"
                        onClick={() =>
                            exportDailyReportToExcel(importReport?.dailySummary ?? [], startDate)
                        }
                    >
                        <FaFileExcel /> Xuất báo cáo
                    </Button>
                </Field.Root>
            </Flex>

            {importReport && (
                <FinishedDailyReportTable
                    title="Báo cáo chi tiết nhập theo ngày"
                    dailySummary={importReport.dailySummary}
                />
            )}


            {exportReport && (
                <FinishedDailyReportTable
                    title="Báo cáo chi tiết xuất theo ngày"
                    dailySummary={exportReport.dailySummary}
                />
            )}
        </Box>
    );
};

export default FinishedDailyReport;
