"use client";

import { Button, ButtonGroup, CloseButton, Flex, IconButton, Input, InputGroup, Pagination, Spacer, Spinner } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { Text, Icon } from "@chakra-ui/react";
import { ProductType } from "@/types/ProductType";
import { toaster } from "@/components/ui/toaster";
import { FaPlus, FaSearch } from "react-icons/fa";
import ProductTypeAlertDialog from "./ProductTypeAlertDialog";
import ProductTypeTable from "./ProductTypeTable";
import ProductTypeFormDialog from "./ProductTypeFormDialog";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { useAddProductTypeMutation, useDeleteProductTypeMutation, useGetProductTypeQuery, useUpdateProductTypeMutation } from "@/service/api/productTypeApiSlice";


const ProductTypeList: React.FC = () => {

    const [addItem] = useAddProductTypeMutation();
    const [updateItem] = useUpdateProductTypeMutation();
    const [deleteItem] = useDeleteProductTypeMutation();

    const [page, setPage] = useState(1);
    const limit = 10;
    const [search, setSearch] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: dataResp, error, isLoading } = useGetProductTypeQuery({ page: page, limit: limit, search: debouncedSearch });

    const items = dataResp?.data?.data ?? [];
    const totalPages = dataResp?.data?.totalPages ?? 1;

    const [formOpen, setFormOpen] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [selected, setSelected] = useState<ProductType | undefined>(undefined);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleOpenForm = (item?: ProductType) => {
        setSelected(item);
        setFormOpen(true);
    };

    const handleOpenAlert = (item: ProductType) => {
        setSelected(item);
        setAlertOpen(true);
    }

    const handleCloseForm = () => setFormOpen(false);
    const handleCloseAlert = () => setAlertOpen(false);

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
            const msg = error?.data?.message || error?.message || "Đã xảy ra lỗi, thử lại sau";
            toaster.create({
                title: errorMessage,
                description: msg,
                type: "error",
                closable: true,
            });
        }
    };

    const handleAdd = async (data: ProductType) => {
        handleMutation(
            () => addItem(data).unwrap(),
            `Đã lưu loại sản phẩm ${data.code} - ${data.name}`,
            'Lưu thất bại',
        );
    }

    const handleUpdate = async (data: ProductType) => {
        handleMutation(
            () => updateItem(data).unwrap(),
            `Đã cập nhật loại sản phẩm ${data.code} - ${data.name}`,
            'Cập nhật thất bại',
        );
    }

    const handleDelete = async (data: ProductType) => {
        handleMutation(
            () => deleteItem(data).unwrap(),
            `Xóa loại sản phẩm ${data.code} - ${data.name}`,
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
            <ProductTypeFormDialog
                isOpen={formOpen}
                onClose={handleCloseForm}
                initialData={selected}
                onAdd={(d) => handleAdd(d)}
                onUpdate={(d) => handleUpdate(d)} />

            <ProductTypeAlertDialog
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
                <Button colorPalette={"green"} onClick={() => handleOpenForm()}><Icon><FaPlus /></Icon>Thêm loại sản phẩm</Button>
            </Flex>

            {isLoading ? (<Spinner />) : (
                <>
                    <ProductTypeTable
                        page={page}
                        limit={limit}
                        items={items}
                        onEdit={handleOpenForm}
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

export default ProductTypeList;