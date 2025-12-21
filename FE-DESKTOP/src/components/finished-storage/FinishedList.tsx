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
import { AnyAccessPrivileges } from "@/types/AccessPrivileges";
import { useAppSelector } from "@/service/hooks";
import { UserState } from "@/types/UserState";
import check from "check-types";
import DataLoading from "../common/DataLoading";

const EDIT_PRIVS: AnyAccessPrivileges[] = [
    "system-admin",
    "system-readWrite",
    "finished-good-readWrite",
]

const FinishedList: React.FC = () => {

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

    const { data: fgData, error: fgError, isLoading: fgLoading } = useGetFinishedGoodsQuery({ page, limit, search: debouncedSearch });
    const { data: moData, error: moError, isLoading: moLoading } = useGetAllManufacturingOrdersQuery();
    const fgGoods: FinishedGood[] = fgData?.data?.data ?? [];
    const mos: ManufacturingOrder[] = moData?.data ?? [];
    const totalPages = fgData?.data?.totalPages ?? 1;

    const [detailOpen, setDetailOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [selected, setSelected] = useState<FinishedGood | undefined>(undefined);
    const [formType, setFormType] = useState<"IMPORT" | "EXPORT" | undefined>(undefined);

    const [bulkFormOpen, setBulkFormOpen] = useState(false);
    const [bulkFormType, setBulkFormType] = useState<'IMPORT' | 'EXPORT' | undefined>(undefined);

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

    const handleOpenDetail = (item?: FinishedGood) => {
        setSelected(item);
        setDetailOpen(true);
    };

    const handleOpenForm = (type: "IMPORT" | "EXPORT", item?: FinishedGood) => {

        if (!handleValidateAccess()) return;

        setSelected(item);
        setFormType(type);
        setFormOpen(true);
    };

    const handleOpenBulkForm = () => {

        if (!handleValidateAccess()) return;

        setBulkFormOpen(true);
        setBulkFormType('IMPORT');
    }

    const handleCloseForm = () => {
        setFormOpen(false);
        setSelected(undefined);
        setFormType(undefined);
    };

    const handleCloseBulkForm = () => {
        setBulkFormOpen(false);
        setBulkFormType(undefined);
    }

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelected(undefined);
    };

    if (hydrating) {
        return <DataLoading />
    }

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
                onClose={handleCloseBulkForm}
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
                        onClick={handleOpenBulkForm}
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
