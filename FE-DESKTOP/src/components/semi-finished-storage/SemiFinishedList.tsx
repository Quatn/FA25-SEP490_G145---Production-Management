"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button, ButtonGroup, Flex, IconButton, Input, InputGroup, Pagination, Spacer, Spinner, Icon, Stack } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { useGetAllSemiFinishedGoodsQuery, useGetSemiFinishedGoodsQuery } from "@/service/api/semiFinishedGoodApiSlice";
import { SemiFinishedGood } from "@/types/SemiFinishedGood";
import SemiFinishedTable from "./SemiFinishedTable";
import SemiFinishedDetailDialog from "./SemiFinishedDetailDialog";
import SemiFinishedTransactionForm from "./SemiFinishedTransactionForm";
import { toaster } from "@/components/ui/toaster";
import { useGetAllManufacturingOrdersQuery } from "@/service/api/manufacturingOrderApiSlice";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { AnyAccessPrivileges } from "@/types/AccessPrivileges";
import { useAppSelector } from "@/service/hooks";
import { UserState } from "@/types/UserState";
import DataLoading from "../common/DataLoading";
import check from "check-types";

const EDIT_PRIVS: AnyAccessPrivileges[] = [
    "system-admin",
    "system-readWrite",
    "semi-finished-good-readWrite",
    "semi-finished-good-transaction-readWrite",
]

const SemiFinishedList: React.FC = () => {

    const hydrating: boolean = useAppSelector((state) =>
        state.auth.hydrating
    );

    const userState: UserState | null = useAppSelector((state) =>
        state.auth.userState
    );

    const writeAllowed =
        check.nonEmptyArray(userState?.accessPrivileges) &&
        EDIT_PRIVS.find((priv) => userState!.accessPrivileges.includes(priv));

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
    const { data: allSFData, error: allSFError, isLoading: allSFLoading } = useGetAllSemiFinishedGoodsQuery();
    const sfGoods: SemiFinishedGood[] = sfData?.data?.data ?? [];
    const mos: ManufacturingOrder[] = moData?.data ?? [];
    const allSFGoods: SemiFinishedGood[] = allSFData?.data ?? [];
    const totalPages = (sfData as any)?.data?.totalPages ?? 1;

    const [detailOpen, setDetailOpen] = useState(false);
    const [txOpen, setTxOpen] = useState(false);
    const [selected, setSelected] = useState<SemiFinishedGood | undefined>(undefined);
    const [txType, setTxType] = useState<"IMPORT" | "EXPORT" | undefined>(undefined);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleValidateAccess = (): boolean => {
        if (!writeAllowed) {
            toaster.create({
                title: "Quyền truy cập bị từ chối",
                description: "Bạn không có quyền thao tác chức năng này",
                type: "error",
                closable: true,
            });
            return false;
        }
        return true;
    }

    const handleOpenDetail = (item?: SemiFinishedGood) => {
        setSelected(item);
        setDetailOpen(true);
    };

    const handleOpenTx = (type: "IMPORT" | "EXPORT", item?: SemiFinishedGood) => {

        if (!handleValidateAccess()) return;

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

    if (hydrating) {
        return <DataLoading />
    }

    if (sfLoading || moLoading || allSFLoading) return <Spinner />;
    if (sfError || moError || allSFError) {
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
                semiFinishedGoods={allSFGoods}
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
