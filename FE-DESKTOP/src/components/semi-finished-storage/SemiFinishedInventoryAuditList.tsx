"use client";

import React, { useState } from "react";
import { IconButton, Pagination, ButtonGroup, Spinner, Text, Flex, Stack, Button } from "@chakra-ui/react";
import { SemiFinishedGoodTransaction } from "@/types/SemiFinishedTransaction";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { useGetSemiFinishedGoodAdjustmentTransactionQuery } from "@/service/api/semiFinishedGoodTransactionApiSlice";
import SemiFinishedInventoryAuditTable from "./SemiFinishedInventoryAuditTable";
import { FaPlus } from "react-icons/fa";
import { toaster } from "@/components/ui/toaster";
import SemiFinishedInventoryAuditForm from "./SemiFinishedInventoryAuditForm";
import { useGetAllManufacturingOrdersQuery } from "@/service/api/manufacturingOrderApiSlice";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";

const SemiFinishedInventoryAuditList: React.FC = () => {
    const [page, setPage] = useState(1);
    const limit = 10;
    const { data, error, isLoading } = useGetSemiFinishedGoodAdjustmentTransactionQuery({
        page,
        limit,
    });
    const { data: moData, error: moError, isLoading: moLoading } = useGetAllManufacturingOrdersQuery();
    const items: SemiFinishedGoodTransaction[] = (data as any)?.data?.data ?? [];
    const mos: ManufacturingOrder[] = moData?.data ?? [];
    const totalPages = (data as any)?.data?.totalPages ?? 1;

    const [txOpen, setTxOpen] = useState(false);

    const handleOpenTx = () => {
        setTxOpen(true);
    };

    const handleCloseTx = () => {
        setTxOpen(false);
    };

    if (isLoading || moLoading) return <Spinner />;
    if (error || moError) {
        toaster.create({ title: "Lỗi", description: "Không thể tải dữ liệu", type: "error", closable: true });
        return <div>Không thể tải dữ liệu.</div>;
    }

    return (
        <>

            <SemiFinishedInventoryAuditForm
                isOpen={txOpen}
                onClose={handleCloseTx}
                manufacturingOrders={mos}
            />

            <Flex direction="row" mb={4}>
                <Stack direction="row" spaceX={10}>
                    <Button
                        colorPalette="green"
                        onClick={() => handleOpenTx()}
                        fontWeight={'bold'}
                    >
                        <FaPlus /> TẠO PHIẾU KIỂM KÊ
                    </Button>

                </Stack>
            </Flex>

            <SemiFinishedInventoryAuditTable page={page} limit={limit} items={items} />

            <Pagination.Root
                count={totalPages * limit}
                pageSize={limit}
                page={page}
                onPageChange={(e) => setPage(e.page)}>
                <ButtonGroup variant="ghost" size="sm" mt={4} justifyContent="center">
                    <Pagination.PrevTrigger asChild>
                        <IconButton aria-label="Previous"><HiChevronLeft /></IconButton>
                    </Pagination.PrevTrigger>
                    <Pagination.Items render={(p) =>
                        <IconButton key={p.value} onClick={() => setPage(p.value)}>
                            {p.value}
                        </IconButton>} />
                    <Pagination.NextTrigger asChild>
                        <IconButton aria-label="Next"><HiChevronRight /></IconButton>
                    </Pagination.NextTrigger>
                </ButtonGroup>
            </Pagination.Root>
        </>
    );
}

export default SemiFinishedInventoryAuditList;
