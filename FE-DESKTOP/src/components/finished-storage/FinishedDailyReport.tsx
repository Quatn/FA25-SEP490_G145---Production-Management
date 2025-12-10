"use client";

import React, { useState } from "react";
import { Box, Flex, Input, Spinner, Field, Tabs, Button } from "@chakra-ui/react";
import { useGetFGDailyReportQuery } from "@/service/api/finishedGoodTransactionApiSlice";
import FinishedDailyReportTable from "./FinishedDailyReportTable";
import { formatDateForInput, minDate } from "@/utils/dateUtils";
import { exportFinishedDailyReport } from "./FinishedExportExcelButton";
import { FaFileExcel } from "react-icons/fa";


const FinishedDailyReport: React.FC = () => {
    const today = new Date();
    const localDate = formatDateForInput(today);

    const [page, setPage] = useState(1);
    const limit = 10;

    const [search, setSearch] = useState('');

    const [tabSelectedValue, setTabSelectedValue] = useState<string>("IMPORT")

    const [startDate, setStartDate] = useState<string>(localDate);
    const [endDate, setEndDate] = useState<string>(localDate);

    const { data: importData, isLoading: importIsLoading, error: importError } = useGetFGDailyReportQuery({
        startDate,
        endDate,
        transactionType: "IMPORT",
        page,
        limit,
        search,
    });

    const { data: exportData, isLoading: exportIsLoading, error: exportError } = useGetFGDailyReportQuery({
        startDate,
        endDate,
        transactionType: "EXPORT",
        page,
        limit,
        search,
    });

    const { data: dailyReportData, isLoading: dailyReportIsLoading, error: dailyReportError } = useGetFGDailyReportQuery({
        startDate,
        endDate,
        transactionType: tabSelectedValue,
    });

    const importReport = importData?.data ?? null;
    const exportReport = exportData?.data ?? null;
    const dailyReport = dailyReportData?.data ?? null;

    if (importIsLoading || exportIsLoading || dailyReportIsLoading) return <Spinner />;
    if (importError || exportError || dailyReportError) return <Box>Không thể tải dữ liệu</Box>;

    return (
        <Box p={4}>
            <Flex mb={4} gap={4} direction={'row'}>
                <Field.Root>
                    <Field.Label>Tìm kiếm</Field.Label>
                    <Input
                        size="lg"
                        placeholder="Nhập mã lệnh, mã hàng,..."
                        value={search}
                        onChange={(e) => {
                            setPage(1);
                            setSearch(e.target.value);
                        }} />
                </Field.Root>
                <Field.Root>
                    <Field.Label>Từ Ngày</Field.Label>
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                            setPage(1);
                            setSearch('');
                            setStartDate(e.target.value);
                        }}
                        max={minDate(localDate, endDate)}
                        width="200px"
                    />
                </Field.Root>
                <Field.Root>
                    <Field.Label>Đến Ngày</Field.Label>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                            setPage(1);
                            setSearch('');
                            setEndDate(e.target.value);
                        }}
                        min={startDate}
                        max={localDate}
                        width="200px"
                    />
                </Field.Root>
                {dailyReport &&
                    <Field.Root alignItems="end">
                        <Field.Label>Báo Cáo Excel</Field.Label>
                        <Button
                            colorPalette={'green'}
                            onClick={() =>
                                exportFinishedDailyReport(tabSelectedValue, startDate, endDate, dailyReport.data)
                            }
                        >
                            <FaFileExcel /> Xuất báo cáo
                        </Button>
                    </Field.Root>}

            </Flex>

            <Tabs.Root
                defaultValue={tabSelectedValue}
                variant="plain"
                lazyMount
                unmountOnExit
                onValueChange={(e) => {
                    setPage(1);
                    setSearch('');
                    setTabSelectedValue(e.value);
                }}
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
                            search={search}
                            limit={importReport.limit}
                            page={importReport.page}
                            startDate={startDate}
                            endDate={endDate}
                            totalPages={importReport.totalPages}
                            handlePageChange={setPage}
                            dailyItems={importReport.data}
                            transactionType="IMPORT"
                        />
                    )}
                </Tabs.Content>
                <Tabs.Content value="EXPORT">
                    {exportReport && (
                        <FinishedDailyReportTable
                            search={search}
                            limit={exportReport.limit}
                            page={exportReport.page}
                            startDate={startDate}
                            endDate={endDate}
                            totalPages={exportReport.totalPages}
                            handlePageChange={setPage}
                            dailyItems={exportReport.data}
                            transactionType="EXPORT"
                        />
                    )}
                </Tabs.Content>

            </Tabs.Root>

        </Box>
    );
};

export default FinishedDailyReport;
