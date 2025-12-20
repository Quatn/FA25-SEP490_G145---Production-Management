"use client";

import React, { useEffect, useState } from "react";
import { IconButton, Pagination, ButtonGroup, Spinner, Flex, Button, InputGroup, Input, Spacer } from "@chakra-ui/react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import FinishedInventoryAuditTable from "./FinishedInventoryAuditTable";
import { FaPlus } from "react-icons/fa";
import { toaster } from "@/components/ui/toaster";
import FinishedInventoryAuditForm from "./FinishedInventoryAuditForm";
import { useGetAllManufacturingOrdersQuery } from "@/service/api/manufacturingOrderApiSlice";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { useGetFinishedGoodAdjustmentTransactionQuery } from "@/service/api/finishedGoodTransactionApiSlice";
import { FinishedGoodTransaction } from "@/types/FinishedGoodTransaction";
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

const FinishedInventoryAuditList: React.FC = () => {

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

    const { data, error, isLoading } = useGetFinishedGoodAdjustmentTransactionQuery({
        page,
        limit,
        search: debouncedSearch,
    });
    const { data: moData, error: moError, isLoading: moLoading } = useGetAllManufacturingOrdersQuery();
    const items: FinishedGoodTransaction[] = (data as any)?.data?.data ?? [];
    const mos: ManufacturingOrder[] = moData?.data ?? [];
    const totalPages = (data as any)?.data?.totalPages ?? 1;

    const [txOpen, setTxOpen] = useState(false);

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

    const handleOpenTx = () => {

        if (!handleValidateAccess()) return;

        setTxOpen(true);
    };

    const handleCloseTx = () => {
        setTxOpen(false);
    };

    if (hydrating) {
        return <DataLoading />
    }

    if (isLoading || moLoading) return <Spinner />;
    if (error || moError) {
        toaster.create({ title: "Lỗi", description: "Không thể tải dữ liệu", type: "error", closable: true });
        return <div>Không thể tải dữ liệu.</div>;
    }

    return (
        <>

            <FinishedInventoryAuditForm
                isOpen={txOpen}
                onClose={handleCloseTx}
                manufacturingOrders={mos}
            />

            <Flex direction="row-reverse" mb={4}>

                <InputGroup w={"full"} maxW={"sm"} border={'solid 1px'}>
                    <Input
                        size="lg"
                        placeholder="Tìm kiếm theo mã lệnh, khách hàng,..."
                        value={search}
                        onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
                </InputGroup>
                <Spacer />

                <Button
                    colorPalette="green"
                    onClick={() => handleOpenTx()}
                    fontWeight={'bold'}
                >
                    <FaPlus /> TẠO PHIẾU KIỂM KÊ
                </Button>

            </Flex>

            <FinishedInventoryAuditTable page={page} limit={limit} items={items} />

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

export default FinishedInventoryAuditList;
