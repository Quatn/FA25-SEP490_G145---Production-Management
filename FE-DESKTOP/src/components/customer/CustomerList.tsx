"use client";

import { Button, ButtonGroup, CloseButton, Flex, IconButton, Input, InputGroup, Pagination, Spacer, Spinner } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { Text } from "@chakra-ui/react"
import { Customer } from "@/types/Customer";
import { toaster } from "@/components/ui/toaster";
import { Icon } from "@chakra-ui/react";
import { FaPlus, FaSearch } from "react-icons/fa";
import CustomerFormDialog from "./CustomerFormDialog";
import CustomerAlertDialog from "./CustomerAlertDialog";
import CustomerTable from "./CustomerTable";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import CustomerDetailDialog from "./CustomerDetailDialog";
import { useAddCustomerMutation, useDeleteCustomerMutation, useGetCustomerQuery, useUpdateCustomerMutation } from "@/service/api/customerApiSlice";


const CustomerList: React.FC = () => {

    const [addCustomer] = useAddCustomerMutation();
    const [updateCustomer] = useUpdateCustomerMutation();
    const [deleteCustomer] = useDeleteCustomerMutation();

    const [page, setPage] = useState(1);
    const limit = 10;
    const [search, setSearch] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const {
        data: customersData,
        error: customersError,
        isLoading: iscustomersLoading
    } = useGetCustomerQuery({ page: page, limit: limit, search: debouncedSearch });

    const customers = customersData?.data?.data ?? [];

    const totalPages = customersData?.data?.totalPages ?? 1;

    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [selectedcustomer, setSelectedcustomer] = useState<Customer | undefined>(undefined);


    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleOpenFormDialog = (customer?: Customer) => {
        setSelectedcustomer(customer);
        setFormDialogOpen(true);
    };

    const handleOpenDetailDialog = (customer?: Customer) => {
        setSelectedcustomer(customer);
        setDetailDialogOpen(true);
    };

    const handleOpenAlertDialog = (customer: Customer) => {
        setSelectedcustomer(customer);
        setAlertDialogOpen(true);
    }

    const handleCloseFormDialog = () => {
        setFormDialogOpen(false);
        setSelectedcustomer(undefined);
    };

    const handleCloseDetailDialog = () => {
        setDetailDialogOpen(false);
        setSelectedcustomer(undefined);
    };

    const handleCloseAlertDialog = () => {
        setAlertDialogOpen(false);
        setSelectedcustomer(undefined);
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

    const handleAddcustomer = async (data: Customer) => {
        return await handleMutation(
            () => addCustomer(data).unwrap(),
            `Đã lưu khách hàng ${data.code} - ${data.name}`,
            'Lưu thất bại',
        );
    }

    const handleUpdatecustomer = async (data: Customer) => {

        return await handleMutation(
            () => updateCustomer(data).unwrap(),
            `Đã cập nhật khách hàng ${data.code} - ${data.name}`,
            'Cập nhật thất bại',
        )

    }

    const handleDeletecustomer = async (data: Customer) => {

        return await handleMutation(
            () => deleteCustomer(data).unwrap(),
            `Xóa khách hàng ${data.code} - ${data.name}`,
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

    if (iscustomersLoading) return <Text>Đang tải dữ liệu...</Text>;
    if (customersError) return <Text>Không thể tải dữ liệu. Vui lòng thử lại.</Text>;

    return (

        <>
            <CustomerFormDialog
                isOpen={formDialogOpen}
                onClose={handleCloseFormDialog}
                initialData={selectedcustomer}
                onAdd={(data) => handleAddcustomer(data)}
                onUpdate={(data) => handleUpdatecustomer(data)} />

            <CustomerDetailDialog
                isOpen={detailDialogOpen}
                onClose={handleCloseDetailDialog}
                initialData={selectedcustomer}
            />

            <CustomerAlertDialog
                isOpen={alertDialogOpen}
                onClose={handleCloseAlertDialog}
                initialData={selectedcustomer}
                onDelete={(data) => handleDeletecustomer(data)} />

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
                <Button colorPalette={"green"} onClick={() => handleOpenFormDialog()}><Icon><FaPlus /></Icon>Thêm khách hàng</Button>
            </Flex>
            {iscustomersLoading ? (<Spinner />) : (
                <>
                    <CustomerTable
                        page={page}
                        limit={limit}
                        customers={customers}
                        onEdit={handleOpenFormDialog}
                        onDetail={handleOpenDetailDialog}
                        onDelete={handleOpenAlertDialog}
                    />

                    <Pagination.Root
                        count={search ? customers.length : totalPages * limit}
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

export default CustomerList;