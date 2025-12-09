"use client";

import { Button, ButtonGroup, CloseButton, Flex, IconButton, Input, InputGroup, Pagination, Spacer, Spinner } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { Text, Icon } from "@chakra-ui/react";
import { useAddWareManufacturingProcessTypeMutation, useUpdateWareManufacturingProcessTypeMutation, useDeleteWareManufacturingProcessTypeMutation, useGetWareManufacturingProcessTypeQuery } from "@/service/api/wareManufacturingProcessTypeApiSlice";
import { WareManufacturingProcessType } from "@/types/WareManufacturingProcessType";
import { toaster } from "@/components/ui/toaster";
import { FaPlus, FaSearch } from "react-icons/fa";
import WareManufacturingProcessTypeFormDialog from "./WareManufacturingProcessTypeFormDialog";
import WareManufacturingProcessTypeAlertDialog from "./WareManufacturingProcessTypeAlertDialog";
import WareManufacturingProcessTypeTable from "./WareManufacturingProcessTypeTable";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import WareManufacturingProcessTypeDetailDialog from "./WareManufacturingProcessTypeDetailDialog";

const WareManufacturingProcessTypeList: React.FC = () => {

    const [addItem] = useAddWareManufacturingProcessTypeMutation();
    const [updateItem] = useUpdateWareManufacturingProcessTypeMutation();
    const [deleteItem] = useDeleteWareManufacturingProcessTypeMutation();

    const [page, setPage] = useState(1);
    const limit = 10;
    const [search, setSearch] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: dataResp, error, isLoading } = useGetWareManufacturingProcessTypeQuery({ page: page, limit: limit, search: debouncedSearch });

    const items = dataResp?.data?.data ?? [];
    const totalPages = dataResp?.data?.totalPages ?? 1;

    const [formOpen, setFormOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [selected, setSelected] = useState<WareManufacturingProcessType | undefined>(undefined);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleOpenForm = (item?: WareManufacturingProcessType) => {
        setSelected(item);
        setFormOpen(true);
    };

    const handleOpenDetailDialog = (item?: WareManufacturingProcessType) => {
        setSelected(item);
        setDetailDialogOpen(true);
    };

    const handleOpenAlert = (item: WareManufacturingProcessType) => {
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

    const handleAdd = async (data: WareManufacturingProcessType) => {
        return await handleMutation(
            () => addItem(data).unwrap(),
            `Đã lưu loại gia công mã hàng ${data.code} - ${data.name}`,
            'Lưu thất bại',
        );
    }

    const handleUpdate = async (data: WareManufacturingProcessType) => {
        return await handleMutation(
            () => updateItem(data).unwrap(),
            `Đã cập nhật loại gia công mã hàng ${data.code} - ${data.name}`,
            'Cập nhật thất bại',
        );
    }

    const handleDelete = async (data: WareManufacturingProcessType) => {
        return await handleMutation(
            () => deleteItem(data).unwrap(),
            `Xóa loại gia công mã hàng ${data.code} - ${data.name}`,
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

    if (isLoading) return <Text>Đang tải dữ liệu...</Text>;
    if (error) return <Text>Không thể tải dữ liệu. Vui lòng thử lại.</Text>;

    return (
        <>
            <WareManufacturingProcessTypeFormDialog
                isOpen={formOpen}
                onClose={handleCloseForm}
                initialData={selected}
                onAdd={(d) => handleAdd(d)}
                onUpdate={(d) => handleUpdate(d)} />

            <WareManufacturingProcessTypeDetailDialog
                isOpen={detailDialogOpen}
                onClose={handleCloseDetailDialog}
                initialData={selected}
            />

            <WareManufacturingProcessTypeAlertDialog
                isOpen={alertOpen}
                onClose={handleCloseAlert}
                initialData={selected}
                onDelete={(d) => handleDelete(d)} />

            <Flex direction={"row-reverse"}>
                <InputGroup endElement={endElement} w={"full"} maxW={"sm"}>
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
                    onClick={() => handleOpenForm()}>
                    <Icon>
                        <FaPlus />
                    </Icon>
                    Thêm loại gia công
                </Button>
            </Flex>

            {isLoading ? (<Spinner />) : (
                <>
                    <WareManufacturingProcessTypeTable
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

export default WareManufacturingProcessTypeList;