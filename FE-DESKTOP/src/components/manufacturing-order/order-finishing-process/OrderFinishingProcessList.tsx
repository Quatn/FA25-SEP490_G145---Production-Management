"use client";

import { useGetOrderFinishingProcesssQuery } from "@/service/api/orderFinishingProcessApiSlice";
import { Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { toaster } from "@/components/ui/toaster";
import { OrderFinishingProcess } from "@/types/OrderFinishingProcess";

const OrderFinishingProcessList: React.FC = () => {

    const [scheduledPage, setScheduledPage] = useState(1);
    const [inProductionPage, setInProductionPage] = useState(1);
    const [finishedProductionPage, setFinishedProductionPage] = useState(1);
    const limit = 10;
    const [scheduledSearch, setScheduledSearch] = useState("");
    const [inProductionSearch, setInProductionSearch] = useState("");
    const [finishedProductionSearch, setFinishedProductionSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState(scheduledSearch);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(scheduledSearch), 400);
        return () => clearTimeout(t);
    }, [scheduledSearch]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(inProductionSearch), 400);
        return () => clearTimeout(t);
    }, [inProductionSearch]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(finishedProductionSearch), 400);
        return () => clearTimeout(t);
    }, [finishedProductionSearch]);

    const {
        data: scheduledData,
        error: scheduledError,
        isLoading: scheduledLoading
    } = useGetOrderFinishingProcesssQuery({
        page: scheduledPage,
        limit,
        search: debouncedSearch
    });
    const {
        data: inProductionData,
        error: inProductionError,
        isLoading: inProductionLoading
    } = useGetOrderFinishingProcesssQuery({
        page: inProductionPage,
        limit,
        search: debouncedSearch
    });
    const {
        data: finishedProductionData,
        error: finishedProductionError,
        isLoading: finishedProductionLoading
    } = useGetOrderFinishingProcesssQuery({
        page: finishedProductionPage,
        limit,
        search: debouncedSearch
    });

    const scheduledOFP: OrderFinishingProcess[] = (scheduledData as any)?.data?.data ?? [];
    const inProductionOFP: OrderFinishingProcess[] = (inProductionData as any)?.data ?? [];
    const finishedProductionOFP: OrderFinishingProcess[] = (finishedProductionData as any)?.data ?? [];

    if (scheduledLoading || inProductionLoading || finishedProductionLoading) return <Spinner />;
    if (scheduledError || inProductionError || finishedProductionError) {
        toaster.create({ title: "Lỗi", description: "Không thể tải dữ liệu", type: "error", closable: true });
        return <div>Không thể tải dữ liệu.</div>;
    }

    return (
        <>
        </>
    );
}