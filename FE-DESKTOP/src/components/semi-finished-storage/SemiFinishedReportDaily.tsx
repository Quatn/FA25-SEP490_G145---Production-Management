"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Box, Spinner, useFilter, useListCollection } from "@chakra-ui/react";
import { useGetSFGDailyEmployeesQuery, useGetSFGDailyReportQuery } from "@/service/api/semiFinishedGoodTransactionApiSlice";
import { EmployeeDailyStats } from "@/types/SemiFinishedTransaction";
import { SemiFinishedReportDetail } from "./SemiFinishedReportDetail";

export const SemiFinishedReportDaily: React.FC = () => {
    const [transactionType, setTransactionType] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [manufacturingOrderId, setManufacturingOrderId] = useState("");
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const ITEMS_PER_PAGE = 10;
    const [page, setPage] = useState(1);

    const { data: sfDRData, isLoading: sfDRIsLoading, error: sfDRError } =
        useGetSFGDailyReportQuery({ page, limit: ITEMS_PER_PAGE, date, transactionType, employeeId, manufacturingOrderId });

    const { data: employeesData, isLoading: employeesIsLoading, error: employeesError } =
        useGetSFGDailyEmployeesQuery({ date });

    const report = sfDRData?.data;
    const transactions = report?.data ?? [];
    const totalPages = report?.totalPages ?? 0;
    const ems: EmployeeDailyStats[] = employeesData?.data ?? [];

    const { contains: employeeContains } = useFilter({ sensitivity: "base" });

    const employeeItems = useMemo(
        () =>
            (ems ?? []).map((emp) => ({
                label: emp.name,
                value: emp._id,
            })),
        [ems]
    );

    const { collection: employeeCollection, set: setEmployeeCollection, filter: employeeFilter } =
        useListCollection<{ label: string; value: string; }>({
            initialItems: [],
            itemToString: (item) => item.label,
            itemToValue: (item) => item.value,
            filter: employeeContains,
        });

    useEffect(() => {
        setEmployeeCollection(employeeItems);
    }, [employeeItems, setEmployeeCollection]);

    if (sfDRIsLoading || employeesIsLoading) return <Spinner />;
    if (sfDRError || employeesError) return <Box>Không thể tải dữ liệu</Box>;

    return (
        <SemiFinishedReportDetail
            date={date}
            setDate={setDate}
            transactions={transactions}
            page={page}
            setEmployeeId={setEmployeeId}
            setTransactionType={setTransactionType}
            setPage={setPage}
            totalPages={totalPages}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            employeeCollection={employeeCollection}
            employeeFilter={employeeFilter}
        />
    );
};
