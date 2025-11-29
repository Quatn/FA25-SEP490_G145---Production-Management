"use client";

import React, { useState } from "react";
import { Box, Flex, Input, Spinner, Field, Tabs } from "@chakra-ui/react";
import { useGetFGDailyReportQuery } from "@/service/api/finishedGoodTransactionApiSlice";
import FinishedDailyReportTable from "./FinishedDailyReportTable";


const FinishedDailyReport: React.FC = () => {
    const today = new Date();
    const localDate = today.toISOString().slice(0, 10);

    const [value, setValue] = useState<string>("IMPORT")

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
            <Flex mb={4} gap={4} direction={'row'}>
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
            </Flex>

            <Tabs.Root
                defaultValue={value}
                variant="plain"
                lazyMount
                unmountOnExit
                onValueChange={(e) => setValue(e.value)}
            >
                <Tabs.List bg="bg.muted" rounded="l3" p="1" background={'orange'}>
                    <Tabs.Trigger value="IMPORT" fontSize={'md'} fontWeight={"bold"}>
                        Nhập
                    </Tabs.Trigger>
                    <Tabs.Trigger value="EXPORT" fontSize={'md'} fontWeight={"bold"}>
                        Xuất
                    </Tabs.Trigger>
                    <Tabs.Indicator rounded="l2" />
                </Tabs.List>
                <Tabs.Content value="IMPORT">
                    {importReport && (
                        <FinishedDailyReportTable
                            dailySummary={importReport.dailySummary}
                            transactionType="IMPORT"
                        />
                    )}
                </Tabs.Content>
                <Tabs.Content value="EXPORT">
                    {exportReport && (
                        <FinishedDailyReportTable
                            dailySummary={exportReport.dailySummary}
                            transactionType="EXPORT"
                        />
                    )}
                </Tabs.Content>

            </Tabs.Root>

        </Box>
    );
};

export default FinishedDailyReport;
