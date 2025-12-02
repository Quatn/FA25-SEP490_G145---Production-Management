"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button, ButtonGroup, Flex, IconButton, Input, InputGroup, Pagination, Spacer, Spinner, Icon, Stack } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { useGetSemiFinishedGoodsQuery } from "@/service/api/semiFinishedGoodApiSlice";
import { SemiFinishedGood } from "@/types/SemiFinishedGood";
import SemiFinishedTable from "./SemiFinishedTable";
import SemiFinishedDetailDialog from "./SemiFinishedDetailDialog";
import SemiFinishedTransactionForm from "./SemiFinishedTransactionForm";
import { toaster } from "@/components/ui/toaster";
import { useGetAllManufacturingOrdersQuery } from "@/service/api/manufacturingOrderApiSlice";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";

const SemiFinishedList: React.FC = () => {
    const [page, setPage] = useState(1);
    const limit = 10;
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const { data: sfData, error: sfError, isLoading: sfLoading } = useGetSemiFinishedGoodsQuery({ page, limit, search: debouncedSearch });
    const { data: moData, error: moError, isLoading: moLoading } = useGetAllManufacturingOrdersQuery();
    const sfGoods: SemiFinishedGood[] = sfData?.data?.data ?? [];
    const mos: ManufacturingOrder[] = moData?.data ?? [];
    const totalPages = (sfData as any)?.data?.totalPages ?? 1;

    const [detailOpen, setDetailOpen] = useState(false);
    const [txOpen, setTxOpen] = useState(false);
    const [selected, setSelected] = useState<SemiFinishedGood | undefined>(undefined);
    const [txType, setTxType] = useState<"IMPORT" | "EXPORT" | undefined>(undefined);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleOpenDetail = (item?: SemiFinishedGood) => {
        setSelected(item);
        setDetailOpen(true);
    };

    const handleOpenTx = (type: "IMPORT" | "EXPORT", item?: SemiFinishedGood) => {
        setSelected(item);
        setTxType(type);
        setTxOpen(true);
    };

    const handleCloseTx = () => {
        setTxOpen(false);
        setSelected(undefined);
        setTxType(undefined);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelected(undefined);
    };

    if (sfLoading || moLoading) return <Spinner />;
    if (sfError || moError) {
        toaster.create({ title: "Lỗi", description: "Không thể tải dữ liệu", type: "error", closable: true });
        return <div>Không thể tải dữ liệu.</div>;
    }

    return (
        <>
            <SemiFinishedTransactionForm
                isOpen={txOpen}
                onClose={handleCloseTx}
                initialData={selected}
                transactionType={txType}
                manufacturingOrders={mos}
            />
            <SemiFinishedDetailDialog isOpen={detailOpen} onClose={handleCloseDetail} item={selected} />

            <Flex direction="row-reverse" mb={4}>
                <InputGroup w={"full"} maxW={"sm"}>
                    <Input
                        ref={inputRef}
                        size="lg"
                        placeholder="Tìm kiếm"
                        value={search}
                        onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
                </InputGroup>
                <Spacer />
                <Stack direction="row" spaceX={10}>
                    <Button
                        colorPalette="green"
                        onClick={() => handleOpenTx("IMPORT", undefined)}
                        fontWeight={'bold'}
                    >
                        <FaPlus /> NHẬP PHÔI
                    </Button>

                </Stack>
            </Flex>

            <SemiFinishedTable
                page={page}
                limit={limit}
                items={sfGoods}
                onView={handleOpenDetail}
                onTransaction={handleOpenTx}
                search={search}
            />

            <Pagination.Root
                count={search ? sfGoods.length : totalPages * limit}
                pageSize={limit}
                page={page}
                siblingCount={2}
                onPageChange={(e) => setPage(e.page)}
            >
                <ButtonGroup variant="ghost" size="sm" mt={4} justifyContent="center">
                    <Pagination.PrevTrigger asChild>
                        <IconButton aria-label="Previous page">
                            <HiChevronLeft />
                        </IconButton>
                    </Pagination.PrevTrigger>

                    <Pagination.Items render={(pageItem) => (
                        <IconButton
                            key={pageItem.value}
                            variant={{ base: 'ghost', _selected: 'outline' }}
                            onClick={() => setPage(pageItem.value)}>
                            {pageItem.value}
                        </IconButton>
                    )} />

                    <Pagination.NextTrigger asChild>
                        <IconButton aria-label="Next page">
                            <HiChevronRight />
                        </IconButton>
                    </Pagination.NextTrigger>
                </ButtonGroup>
            </Pagination.Root>

        </>
    );
}

export default SemiFinishedList;
