"use client";

import { Button, ButtonGroup, CloseButton, Flex, IconButton, Input, InputGroup, Pagination, Spacer, Spinner } from "@chakra-ui/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Text } from "@chakra-ui/react"
import { useAddPaperSupplierMutation, useDeletePaperSupplierMutation, useGetPaperSupplierQuery, useUpdatePaperSupplierMutation } from "@/service/api/paperSupplierApiSlice";
import { PaperSupplier } from "@/types/PaperSupplier";
import { toaster } from "@/components/ui/toaster";
import { Icon } from "@chakra-ui/react";
import { FaPlus, FaSearch } from "react-icons/fa";
import PaperSupplierFormDialog from "./PaperSupplierFormDialog";
import PaperSupplierAlertDialog from "./PaperSupplierAlertDialog";
import PaperSupplierTable from "./PaperSupplierTable";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";


const PaperSupplierList: React.FC = () => {

    const [addPaperSupplier] = useAddPaperSupplierMutation();
    const [updatePaperSupplier] = useUpdatePaperSupplierMutation();
    const [deletePaperSupplier] = useDeletePaperSupplierMutation();

    const [page, setPage] = useState(1);
    const limit = 10;
    const [search, setSearch] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: suppliersData, error: suppliersError, isLoading: isSuppliersLoading } = useGetPaperSupplierQuery({ page: page, limit: limit, search: debouncedSearch });

    const suppliers = suppliersData?.data?.data ?? [];

    const totalPages = suppliersData?.data?.totalPages ?? 1;

    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<PaperSupplier | undefined>(undefined);


    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleOpenFormDialog = (supplier?: PaperSupplier) => {
        setSelectedSupplier(supplier);
        setFormDialogOpen(true);
    };

    const handleOpenAlertDialog = (supplier: PaperSupplier) => {
        setSelectedSupplier(supplier);
        setAlertDialogOpen(true);
    }

    const handleCloseFormDialog = () => {
        setFormDialogOpen(false);
    };

    const handleCloseAlertDialog = () => {
        setAlertDialogOpen(false);
    };

    const handleMutation = async (
        fn: Function,
        successMessage: string,
        errorMessage: string
    ) => {
        try {
            await fn();
            toaster.create({
                title: "Thành công",
                description: successMessage,
                type: "success",
                closable: true,
            });
        } catch (error: any) {

            const msg =
                error?.data?.message || error?.message || "Đã xảy ra lỗi, thử lại sau";
            toaster.create({
                title: errorMessage,
                description: msg,
                type: "error",
                closable: true,
            });
        }
    };

    const handleAddSupplier = async (data: PaperSupplier) => {

        handleMutation(
            () => addPaperSupplier(data).unwrap(),
            `Đã lưu nhà giấy ${data.code} - ${data.name}`,
            'Lưu thất bại',
        )
    }

    const handleUpdateSupplier = async (data: PaperSupplier) => {

        handleMutation(
            () => updatePaperSupplier(data).unwrap(),
            `Đã cập nhật nhà giấy ${data.code} - ${data.name}`,
            'Cập nhật thất bại',
        )

    }

    const handleDeleteSupplier = async (data: PaperSupplier) => {

        handleMutation(
            () => deletePaperSupplier(data).unwrap(),
            `Xóa nhà giấy ${data.code} - ${data.name}`,
            'Xóa thất bại',
        )

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

    if (isSuppliersLoading) return <Text>Đang tải dữ liệu...</Text>;
    if (suppliersError) return <Text>Không thể tải dữ liệu. Vui lòng thử lại.</Text>;

    return (

        <>
            <PaperSupplierFormDialog
                isOpen={formDialogOpen}
                onClose={handleCloseFormDialog}
                initialData={selectedSupplier}
                onAdd={(data) => handleAddSupplier(data)}
                onUpdate={(data) => handleUpdateSupplier(data)} />

            <PaperSupplierAlertDialog
                isOpen={alertDialogOpen}
                onClose={handleCloseAlertDialog}
                initialData={selectedSupplier}
                onDelete={(data) => handleDeleteSupplier(data)} />

            <Flex direction={"row-reverse"}>
                <InputGroup endElement={endElement} w={"full"} maxW={"sm"}>
                    <Input
                        ref={inputRef}
                        flex="1"
                        size={"lg"}
                        placeholder="Tìm kiếm"
                        value={search}
                        onChange={(e) => {
                            setPage(1);
                            setSearch(e.target.value)
                        }} />
                </InputGroup>
                <Spacer />
                <Button colorPalette={"green"} onClick={() => handleOpenFormDialog()}><Icon><FaPlus /></Icon>Thêm nhà giấy</Button>
            </Flex>
            {isSuppliersLoading ? (<Spinner />) : (
                <>
                    <PaperSupplierTable
                        page={page}
                        limit={limit}
                        suppliers={suppliers}
                        onEdit={handleOpenFormDialog}
                        onDelete={handleOpenAlertDialog}
                    />

                    <Pagination.Root
                        count={search ? suppliers.length : totalPages * limit}
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

export default PaperSupplierList;