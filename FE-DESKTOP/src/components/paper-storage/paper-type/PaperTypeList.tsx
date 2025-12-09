"use client";

import { Button, ButtonGroup, CloseButton, Flex, IconButton, Input, InputGroup, Pagination, Spacer, Spinner } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { Text } from "@chakra-ui/react"
import { useAddPaperTypeMutation, useGetPaperTypeQuery, useDeletePaperTypeMutation, useUpdatePaperTypeMutation } from "@/service/api/paperTypeApiSlice";
import { useGetAllPaperColorsQuery } from "@/service/api/paperColorApiSlice";
import { PaperColor, PaperColorResponse } from "@/types/PaperColor";
import { PaperType } from "@/types/PaperType";
import { toaster } from "@/components/ui/toaster";
import { Icon } from "@chakra-ui/react";
import { FaPlus, FaSearch } from "react-icons/fa";
import PaperTypeAlertDialog from "./PaperTypeAlertDialog";
import PaperTypeTable from "./PaperTypeTable";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import PaperTypeFormDialog from "./PaperTypeFormDialog";
import PaperTypeDetailDialog from "./PaperTypeDetailDialog";

const PaperTypeList: React.FC = () => {

    const [addPaperType] = useAddPaperTypeMutation();
    const [updatePaperType] = useUpdatePaperTypeMutation();
    const [deletePaperType] = useDeletePaperTypeMutation();

    const [page, setPage] = useState(1);
    const limit = 10;
    const [search, setSearch] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: typesData, error: typesError, isLoading: isTypesLoading } = useGetPaperTypeQuery({ page: page, limit: limit, search: debouncedSearch });
    const { data: colorsData, error: colorsError, isLoading: isColorsLoading } = useGetAllPaperColorsQuery();

    const paperColors: PaperColorResponse[] = colorsData?.data ?? [];
    const types = typesData?.data?.data ?? [];

    const totalPages = typesData?.data?.totalPages ?? 1;

    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<PaperType | undefined>(undefined);


    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleOpenFormDialog = (type?: PaperType) => {
        setSelectedType(type);
        setFormDialogOpen(true);
    };

    const handleOpenDetailDialog = (type?: PaperType) => {
        setSelectedType(type);
        setDetailDialogOpen(true);
    };


    const handleOpenAlertDialog = (type: PaperType) => {
        setSelectedType(type);
        setAlertDialogOpen(true);
    }

    const handleCloseFormDialog = () => {
        setFormDialogOpen(false);
        setSelectedType(undefined);
    };

    const handleCloseDetailDialog = () => {
        setDetailDialogOpen(false);
        setSelectedType(undefined);
    };

    const handleCloseAlertDialog = () => {
        setAlertDialogOpen(false);
        setSelectedType(undefined);
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



    const handleAddType = async (data: PaperType) => {
        const color = data.paperColor as PaperColor;
        const payload: PaperType = {
            paperColor: color._id as string,
            width: data.width,
            grammage: data.grammage,
        }
        return await handleMutation(
            () => addPaperType(payload).unwrap(),
            `Đã lưu loại giấy ${color.code}/${data.width}/${data.grammage}`,
            'Lưu thất bại',
        )
    }

    const handleUpdateType = async (data: PaperType) => {
        const color = data.paperColor as PaperColor;
        const payload: PaperType = {
            paperColor: color._id as string,
            width: data.width,
            grammage: data.grammage,
        }
        return await handleMutation(
            () => updatePaperType(payload).unwrap(),
            `Đã cập nhật loại giấy ${color.code}/${data.width}/${data.grammage}`,
            'Cập nhật thất bại',
        )

    }

    const handleDeleteType = async (data: PaperType) => {
        const color = data.paperColor as PaperColor;
        return await handleMutation(
            () => deletePaperType(data).unwrap(),
            `Xóa loại giấy ${color.code}/${data.width}/${data.grammage}`,
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

    if (isTypesLoading || isColorsLoading) return <Text>Đang tải dữ liệu...</Text>;
    if (typesError || colorsError) return <Text>Không thể tải dữ liệu. Vui lòng thử lại.</Text>;

    return (

        <>
            <PaperTypeFormDialog
                isOpen={formDialogOpen}
                onClose={handleCloseFormDialog}
                initialData={selectedType}
                colorsData={paperColors}
                onAdd={(data) => handleAddType(data)}
                onUpdate={(data) => handleUpdateType(data)} />

            <PaperTypeDetailDialog
                isOpen={detailDialogOpen}
                onClose={handleCloseDetailDialog}
                initialData={selectedType}
            />

            <PaperTypeAlertDialog
                isOpen={alertDialogOpen}
                onClose={handleCloseAlertDialog}
                initialData={selectedType}
                onDelete={(data) => handleDeleteType(data)} />

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
                <Button colorPalette={"green"} onClick={() => handleOpenFormDialog()}><Icon><FaPlus /></Icon>Thêm loại giấy</Button>
            </Flex>
            {isTypesLoading ? (<Spinner />) : (
                <>
                    <PaperTypeTable
                        page={page}
                        limit={limit}
                        types={types}
                        onEdit={handleOpenFormDialog}
                        onDetail={handleOpenDetailDialog}
                        onDelete={handleOpenAlertDialog}
                    />

                    <Pagination.Root
                        count={search ? types.length : totalPages * limit}
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

export default PaperTypeList;