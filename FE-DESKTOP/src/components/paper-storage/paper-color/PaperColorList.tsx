"use client";

import { Button, ButtonGroup, CloseButton, Flex, IconButton, Input, InputGroup, Pagination, Spacer, Spinner } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { Text } from "@chakra-ui/react"
import { useAddPaperColorMutation, useUpdatePaperColorMutation, useGetPaperColorQuery, useDeleteSoftPaperColorMutation } from "@/service/api/paperColorApiSlice";
import { PaperColor } from "@/types/PaperColor";
import { toaster } from "@/components/ui/toaster";
import { Icon } from "@chakra-ui/react";
import { FaPlus, FaSearch } from "react-icons/fa";
import PaperColorFormDialog from "./PaperColorFormDialog";
import PaperColorAlertDialog from "./PaperColorAlertDialog";
import PaperColorTable from "./PaperColorTable";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import PaperColorDetailDialog from "./PaperColorDetailDialog";
import { AnyAccessPrivileges } from "@/types/AccessPrivileges";
import { useAppSelector } from "@/service/hooks";
import { UserState } from "@/types/UserState";
import DataLoading from "@/components/common/DataLoading";
import check from "check-types";

const EDIT_PRIVS: AnyAccessPrivileges[] = [
    "system-admin",
    "system-readWrite",
    "paper-color-readWrite",
]

const PaperColorList: React.FC = () => {

    const hydrating: boolean = useAppSelector((state) =>
        state.auth.hydrating
    );

    const userState: UserState | null = useAppSelector((state) =>
        state.auth.userState
    );

    const writeAllowed =
        check.nonEmptyArray(userState?.accessPrivileges) &&
        EDIT_PRIVS.find((priv) => userState!.accessPrivileges.includes(priv));

    const [addPaperColor] = useAddPaperColorMutation();
    const [updatePaperColor] = useUpdatePaperColorMutation();
    const [deletePaperColor] = useDeleteSoftPaperColorMutation();

    const [page, setPage] = useState(1);
    const limit = 10;
    const [search, setSearch] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: colorsData, error: colorsError, isLoading: isColorsLoading } = useGetPaperColorQuery({
        page: page,
        limit: limit,
        search: debouncedSearch
    });

    const colors = colorsData?.data?.data ?? [];

    const totalPages = colorsData?.data?.totalPages ?? 1;

    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState<PaperColor | undefined>(undefined);

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

    const handleOpenFormDialog = (color?: PaperColor) => {

        if (!handleValidateAccess()) return;

        setSelectedColor(color);
        setFormDialogOpen(true);
    };

    const handleOpenDetailDialog = (color?: PaperColor) => {
        setSelectedColor(color);
        setDetailDialogOpen(true);
    };

    const handleOpenAlertDialog = (color: PaperColor) => {

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

    const handleAddColor = async (data: PaperColor) => {

        return await handleMutation(
            () => addPaperColor(data).unwrap(),
            `Đã lưu màu giấy ${data.code} - ${data.title}`,
            'Lưu thất bại',
        )
    }

    const handleUpdateColor = async (data: PaperColor) => {

        return await handleMutation(
            () => updatePaperColor(data).unwrap(),
            `Đã cập nhật màu giấy ${data.code} - ${data.title}`,
            'Cập nhật thất bại',
        )

    }

    const handleDeleteColor = async (data: PaperColor) => {

        return await handleMutation(
            () => deletePaperColor(data).unwrap(),
            `Xóa màu giấy ${data.code} - ${data.title}`,
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
            <PaperColorFormDialog
                isOpen={formDialogOpen}
                onClose={handleCloseFormDialog}
                initialData={selectedColor}
                onAdd={(data) => handleAddColor(data)}
                onUpdate={(data) => handleUpdateColor(data)} />

            <PaperColorDetailDialog
                isOpen={detailDialogOpen}
                onClose={handleCloseDetailDialog}
                initialData={selectedColor}
            />

            <PaperColorAlertDialog
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
                        placeholder="Tìm kiếm theo mã, tiêu đề"
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
                    Thêm màu giấy
                </Button>
            </Flex>
            {isColorsLoading ? (<Spinner />) : (
                <>
                    <PaperColorTable
                        page={page}
                        limit={limit}
                        colors={colors}
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

export default PaperColorList;