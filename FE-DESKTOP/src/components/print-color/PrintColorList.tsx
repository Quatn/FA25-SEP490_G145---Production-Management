"use client";

import { Button, ButtonGroup, CloseButton, Flex, IconButton, Input, InputGroup, Pagination, Spacer, Spinner } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { Text } from "@chakra-ui/react"
import { PrintColor } from "@/types/PrintColor";
import { toaster } from "@/components/ui/toaster";
import { Icon } from "@chakra-ui/react";
import { FaPlus, FaSearch } from "react-icons/fa";
import PrintColorFormDialog from "./PrintColorFormDialog";
import PrintColorAlertDialog from "./PrintColorAlertDialog";
import PrintColorTable from "./PrintColorTable";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import PrintColorDetailDialog from "./PrintColorDetailDialog";
import { useAddPrintColorMutation, useDeleteSoftPrintColorMutation, useGetPrintColorQuery, useUpdatePrintColorMutation } from "@/service/api/printColorApiSlice";
import { AnyAccessPrivileges } from "@/types/AccessPrivileges";
import { useAppSelector } from "@/service/hooks";
import { UserState } from "@/types/UserState";
import DataLoading from "../common/DataLoading";
import check from "check-types";

const EDIT_PRIVS: AnyAccessPrivileges[] = [
    "system-admin",
    "system-readWrite",
    "print-color-readWrite",
]

const PrintColorList: React.FC = () => {

    const hydrating: boolean = useAppSelector((state) =>
        state.auth.hydrating
    );

    const userState: UserState | null = useAppSelector((state) =>
        state.auth.userState
    );

    const writeAllowed =
        check.nonEmptyArray(userState?.accessPrivileges) &&
        EDIT_PRIVS.find((priv) => userState!.accessPrivileges.includes(priv));

    const [addPrintColor] = useAddPrintColorMutation();
    const [updatePrintColor] = useUpdatePrintColorMutation();
    const [deletePrintColor] = useDeleteSoftPrintColorMutation();

    const [page, setPage] = useState(1);
    const limit = 10;
    const [search, setSearch] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: colorsData, error: colorsError, isLoading: isColorsLoading } = useGetPrintColorQuery({
        page: page,
        limit: limit,
        search: debouncedSearch
    });

    const colors = colorsData?.data?.data ?? [];

    const totalPages = colorsData?.data?.totalPages ?? 1;

    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState<PrintColor | undefined>(undefined);

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

    const handleOpenFormDialog = (color?: PrintColor) => {

        if (!handleValidateAccess()) return;

        setSelectedColor(color);
        setFormDialogOpen(true);
    };

    const handleOpenDetailDialog = (color?: PrintColor) => {
        setSelectedColor(color);
        setDetailDialogOpen(true);
    };

    const handleOpenAlertDialog = (color: PrintColor) => {

        if (!handleValidateAccess()) return;

        setSelectedColor(color);
        setAlertDialogOpen(true);
    }

    const handleCloseFormDialog = () => {
        setFormDialogOpen(false);
        setSelectedColor(undefined);
    };

    const handleCloseDetailDialog = () => {
        setDetailDialogOpen(false);
        setSelectedColor(undefined);
    };

    const handleCloseAlertDialog = () => {
        setAlertDialogOpen(false);
        setSelectedColor(undefined);
    };

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

            const msg =
                error?.data?.message || error?.message || "Đã xảy ra lỗi, thử lại sau";
            toaster.create({
                title: errorMessage,
                description: msg,
                type: "error",
                closable: true,
            });
            return false;
        }
    };

    const handleAddColor = async (data: PrintColor) => {

        return await handleMutation(
            () => addPrintColor(data).unwrap(),
            `Đã lưu màu in ${data.code}`,
            'Lưu thất bại',
        )
    }

    const handleUpdateColor = async (data: PrintColor) => {

        return await handleMutation(
            () => updatePrintColor(data).unwrap(),
            `Đã cập nhật màu in ${data.code}`,
            'Cập nhật thất bại',
        )

    }

    const handleDeleteColor = async (data: PrintColor) => {

        return await handleMutation(
            () => deletePrintColor(data).unwrap(),
            `Xóa màu in ${data.code}`,
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

    if (hydrating) {
        return <DataLoading />
    }

    if (isColorsLoading) return <Text>Đang tải dữ liệu...</Text>;
    if (colorsError) return <Text>Không thể tải dữ liệu. Vui lòng thử lại.</Text>;

    return (

        <>
            <PrintColorFormDialog
                isOpen={formDialogOpen}
                onClose={handleCloseFormDialog}
                initialData={selectedColor}
                onAdd={(data) => handleAddColor(data)}
                onUpdate={(data) => handleUpdateColor(data)} />

            <PrintColorDetailDialog
                isOpen={detailDialogOpen}
                onClose={handleCloseDetailDialog}
                initialData={selectedColor}
            />

            <PrintColorAlertDialog
                isOpen={alertDialogOpen}
                onClose={handleCloseAlertDialog}
                initialData={selectedColor}
                onDelete={(data) => handleDeleteColor(data)} />

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
                <Button
                    colorPalette={"green"}
                    onClick={() => handleOpenFormDialog()}>
                    <Icon>
                        <FaPlus />
                    </Icon>
                    Thêm màu in
                </Button>
            </Flex>
            {isColorsLoading ? (<Spinner />) : (
                <>
                    <PrintColorTable
                        page={page}
                        limit={limit}
                        items={colors}
                        onEdit={handleOpenFormDialog}
                        onDetail={handleOpenDetailDialog}
                        onDelete={handleOpenAlertDialog}
                    />

                    <Pagination.Root
                        count={search ? colors.length : totalPages * limit}
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

export default PrintColorList;