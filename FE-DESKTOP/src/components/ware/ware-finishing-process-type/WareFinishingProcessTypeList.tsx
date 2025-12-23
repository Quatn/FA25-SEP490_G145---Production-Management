"use client";

import { Button, ButtonGroup, CloseButton, Flex, IconButton, Input, InputGroup, Pagination, Spacer, Spinner } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { Text, Icon } from "@chakra-ui/react";
import { useAddWareFinishingProcessTypeMutation, useUpdateWareFinishingProcessTypeMutation, useDeleteWareFinishingProcessTypeMutation, useGetWareFinishingProcessTypeQuery } from "@/service/api/wareFinishingProcessTypeApiSlice";
import { WareFinishingProcessType } from "@/types/WareFinishingProcessType";
import { toaster } from "@/components/ui/toaster";
import { FaPlus, FaSearch } from "react-icons/fa";
import WareFinishingProcessTypeFormDialog from "./WareFinishingProcessTypeFormDialog";
import WareFinishingProcessTypeAlertDialog from "./WareFinishingProcessTypeAlertDialog";
import WareFinishingProcessTypeTable from "./WareFinishingProcessTypeTable";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import WareFinishingProcessTypeDetailDialog from "./WareFinishingProcessTypeDetailDialog";
import { AnyAccessPrivileges } from "@/types/AccessPrivileges";
import { UserState } from "@/types/UserState";
import { useAppSelector } from "@/service/hooks";
import check from "check-types";
import DataLoading from "@/components/common/DataLoading";

const EDIT_PRIVS: AnyAccessPrivileges[] = [
    "system-admin",
    "system-readWrite",
    "ware-finishing-process-type-readWrite",
]

const WareFinishingProcessTypeList: React.FC = () => {

    const hydrating: boolean = useAppSelector((state) =>
        state.auth.hydrating
    );

    const userState: UserState | null = useAppSelector((state) =>
        state.auth.userState
    );

    const writeAllowed =
        check.nonEmptyArray(userState?.accessPrivileges) &&
        EDIT_PRIVS.find((priv) => userState!.accessPrivileges.includes(priv));

    const [addItem] = useAddWareFinishingProcessTypeMutation();
    const [updateItem] = useUpdateWareFinishingProcessTypeMutation();
    const [deleteItem] = useDeleteWareFinishingProcessTypeMutation();

    const [page, setPage] = useState(1);
    const limit = 10;
    const [search, setSearch] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: dataResp, error, isLoading } = useGetWareFinishingProcessTypeQuery({ page: page, limit: limit, search: debouncedSearch });

    const items = dataResp?.data?.data ?? [];
    const totalPages = dataResp?.data?.totalPages ?? 1;

    const [formOpen, setFormOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [selected, setSelected] = useState<WareFinishingProcessType | undefined>(undefined);

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

    const handleOpenForm = (item?: WareFinishingProcessType) => {

        if (!handleValidateAccess()) return;

        setSelected(item);
        setFormOpen(true);
    };

    const handleOpenDetailDialog = (item?: WareFinishingProcessType) => {
        setSelected(item);
        setDetailDialogOpen(true);
    };

    const handleOpenAlert = (item: WareFinishingProcessType) => {

        if (!handleValidateAccess()) return;

        setSelected(item);
        setAlertOpen(true);
    }

    const handleCloseForm = () => {
        setFormOpen(false);
        setSelected(undefined);
    }

    const handleCloseDetailDialog = () => {
        setDetailDialogOpen(false);
        setSelected(undefined);
    };

    const handleCloseAlert = () => {
        setAlertOpen(false);
        setSelected(undefined);
    }

    const handleMutation = async (
        fn: Function,
        successMessage: string,
        errorMessage: string
    ): Promise<boolean> => {
        try {
            await fn();
            toaster.create({
                title: "Thành công",
                description: successMessage,
                type: "success",
                closable: true,
            });
            return true;
        } catch (error: any) {
            const msg = error?.data?.message || error?.message || "Đã xảy ra lỗi, thử lại sau";
            toaster.create({
                title: errorMessage,
                description: msg,
                type: "error",
                closable: true,
            });
            return false;
        }
    };

    const handleAdd = async (data: WareFinishingProcessType) => {

        return await handleMutation(
            () => addItem(data).unwrap(),
            `Đã lưu loại hoàn thiện mã hàng ${data.code} - ${data.name}`,
            'Lưu thất bại',
        );
    }

    const handleUpdate = async (data: WareFinishingProcessType) => {

        return await handleMutation(
            () => updateItem(data).unwrap(),
            `Đã cập nhật loại hoàn thiện mã hàng ${data.code} - ${data.name}`,
            'Cập nhật thất bại',
        );
    }

    const handleDelete = async (data: WareFinishingProcessType) => {
        return await handleMutation(
            () => deleteItem(data).unwrap(),
            `Xóa loại hoàn thiện mã hàng ${data.code} - ${data.name}`,
            'Xóa thất bại',
        );
    }

    const endElement = search ? (
        <CloseButton
            size={"lg"}
            onClick={() => {
                setSearch('');
                inputRef.current?.focus();
            }}
            me={-3}
        />
    ) : (
        <IconButton
            size={"lg"}
            variant={"subtle"}
            me={-3}>
            <FaSearch />
        </IconButton>
    );

    if (hydrating) {
        return <DataLoading />
    }

    if (isLoading) return <Text>Đang tải dữ liệu...</Text>;
    if (error) return <Text>Không thể tải dữ liệu. Vui lòng thử lại.</Text>;

    return (
        <>
            <WareFinishingProcessTypeFormDialog
                isOpen={formOpen}
                onClose={handleCloseForm}
                initialData={selected}
                onAdd={(d) => handleAdd(d)}
                onUpdate={(d) => handleUpdate(d)} />

            <WareFinishingProcessTypeDetailDialog
                isOpen={detailDialogOpen}
                onClose={handleCloseDetailDialog}
                initialData={selected}
            />

            <WareFinishingProcessTypeAlertDialog
                isOpen={alertOpen}
                onClose={handleCloseAlert}
                initialData={selected}
                onDelete={(d) => handleDelete(d)} />

            <Flex direction={"row-reverse"}>
                <InputGroup endElement={endElement} w={"full"} maxW={{ base: "full", md: "sm" }}>
                    <Input
                        ref={inputRef}
                        flex="1"
                        size={"lg"}
                        placeholder="Tìm kiếm"
                        value={search}
                        onChange={(e) => { setPage(1); setSearch(e.target.value) }} />
                </InputGroup>
                <Spacer />
                <Button
                    colorPalette={"green"}
                    onClick={() => handleOpenForm()}
                ><Icon>
                        <FaPlus />
                    </Icon>
                    Thêm loại hoàn thiện mã hàng
                </Button>
            </Flex>

            {isLoading ? (<Spinner />) : (
                <>
                    <WareFinishingProcessTypeTable
                        page={page}
                        limit={limit}
                        items={items}
                        onEdit={handleOpenForm}
                        onDetail={handleOpenDetailDialog}
                        onDelete={handleOpenAlert}
                    />

                    <Pagination.Root
                        count={search ? items.length : totalPages * limit}
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

                            <Pagination.Items
                                render={(pageItem) => (
                                    <IconButton
                                        key={pageItem.value}
                                        variant={{ base: "ghost", _selected: "outline" }}
                                        onClick={() => setPage(pageItem.value)}
                                    >
                                        {pageItem.value}
                                    </IconButton>
                                )}
                            />

                            <Pagination.NextTrigger asChild>
                                <IconButton aria-label="Next page">
                                    <HiChevronRight />
                                </IconButton>
                            </Pagination.NextTrigger>
                        </ButtonGroup>
                    </Pagination.Root>
                </>
            )}
        </>
    );
}

export default WareFinishingProcessTypeList;
