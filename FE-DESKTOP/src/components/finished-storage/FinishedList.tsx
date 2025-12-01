"use client";

import React, { useEffect, useState } from "react";
import { Button, ButtonGroup, Flex, IconButton, Input, InputGroup, Pagination, Spacer, Spinner, Stack } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import FinishedTable from "./FinishedTable";
import FinishedDetailDialog from "./FinishedDetailDialog";
import FinishedTransactionForm from "./FinishedTransactionForm";
import { toaster } from "@/components/ui/toaster";
import { useGetAllManufacturingOrdersQuery } from "@/service/api/manufacturingOrderApiSlice";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { useGetFinishedGoodsQuery } from "@/service/api/finishedGoodApiSlice";
import { FinishedGood } from "@/types/FinishedGood";
import FinishedTransactionBulkForm from "./FinishedTransactionBulkForm";

const FinishedList: React.FC = () => {
    const [page, setPage] = useState(1);
    const limit = 10;
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const { data: fgData, error: fgError, isLoading: fgLoading } = useGetFinishedGoodsQuery({ page, limit, search: debouncedSearch });
    const { data: moData, error: moError, isLoading: moLoading } = useGetAllManufacturingOrdersQuery();
    const fgGoods: FinishedGood[] = (fgData as any)?.data?.data ?? [];
    const mos: ManufacturingOrder[] = (moData as any)?.data ?? [];
    const totalPages = (fgData as any)?.data?.totalPages ?? 1;

    const [detailOpen, setDetailOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [selected, setSelected] = useState<FinishedGood | undefined>(undefined);
    const [formType, setFormType] = useState<"IMPORT" | "EXPORT" | undefined>(undefined);

    const [bulkFormOpen, setBulkFormOpen] = useState(false);
    const [bulkFormType, setBulkFormType] = useState<'IMPORT' | 'EXPORT' | undefined>(undefined);

    const handleOpenDetail = (item?: FinishedGood) => {
        setSelected(item);
        setDetailOpen(true);
    };

    const handleOpenForm = (type: "IMPORT" | "EXPORT", item?: FinishedGood) => {
        setSelected(item);
        setFormType(type);
        setFormOpen(true);
    };

    const handleCloseForm = () => {
        setFormOpen(false);
        setSelected(undefined);
        setFormType(undefined);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelected(undefined);
    };

    if (fgLoading || moLoading) return <Spinner />;
    if (fgError || moError) {
        toaster.create({ title: "Lỗi", description: "Không thể tải dữ liệu", type: "error", closable: true });
        return <div>Không thể tải dữ liệu.</div>;
    }

    return (
        <>
            <FinishedTransactionForm
                isOpen={formOpen}
                onClose={handleCloseForm}
                initialData={selected}
                transactionType={formType}
            />

            <FinishedTransactionBulkForm
                isOpen={bulkFormOpen}
                onClose={() => {
                    setBulkFormOpen(false);
                    setBulkFormType(undefined);
                }}
                transactionType={bulkFormType ?? 'IMPORT'}
                manufacturingOrders={mos}

            />
            <FinishedDetailDialog isOpen={detailOpen} onClose={handleCloseDetail} item={selected} />

            <Flex direction="row-reverse" mb={4}>
                <InputGroup w={"full"} maxW={"sm"}>
                    <Input
                        size="lg"
                        placeholder="Tìm kiếm"
                        value={search}
                        onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
                </InputGroup>
                <Spacer />
                <Stack direction="row" spaceX={10}>
                    <Button
                        colorPalette="green"
                        onClick={() => {
                            setBulkFormOpen(true);
                            setBulkFormType('IMPORT');
                        }}
                    >
                        <FaPlus /> Tạo phiếu nhập
                    </Button>

                </Stack>
            </Flex>

            <FinishedTable
                page={page}
                limit={limit}
                items={fgGoods}
                onView={handleOpenDetail}
                onTransaction={handleOpenForm}
                search={search}
            />

            <Pagination.Root
                count={search ? fgGoods.length : totalPages * limit}
                pageSize={limit}
                page={page}
                siblingCount={2}
                onPageChange={(e) => setPage(e.page)}
            >
                <ButtonGroup variant="ghost" size="sm" mt={4} justifyContent="center">
                    <Pagination.PrevTrigger asChild>
                        <IconButton aria-label="Previous page"><HiChevronLeft /></IconButton>
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
                        <IconButton aria-label="Next page"><HiChevronRight /></IconButton>
                    </Pagination.NextTrigger>
                </ButtonGroup>
            </Pagination.Root>

        </>
    );
}

export default FinishedList;
