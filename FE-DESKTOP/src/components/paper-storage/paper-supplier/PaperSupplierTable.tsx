"use client";

import { Button, CloseButton, Flex, Group, IconButton, Input, InputGroup, Spacer, Table } from "@chakra-ui/react";
import React, { useMemo, useRef, useState } from "react";
import { Text } from "@chakra-ui/react"
import { useAddPaperSupplierMutation, useDeletePaperSupplierMutation, useGetPaperSupplierQuery, useUpdatePaperSupplierMutation } from "@/service/api/paperSupplierApiSlice";
import { PaperSupplier } from "@/types/PaperSupplier";
import { toaster } from "@/components/ui/toaster";
import { Icon } from "@chakra-ui/react";
import { FaEdit, FaPlus, FaSearch } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import PaperSupplierDetailDialog from "./PaperSupplierDetailDialog";
import PaperSupplierFormDialog from "./PaperSupplierFormDialog";
import PaperSupplierAlertDialog from "./PaperSupplierAlertDialog";

const PaperSupplierTable: React.FC = () => {

    const [addPaperSupplier] = useAddPaperSupplierMutation();
    const [updatePaperSupplier] = useUpdatePaperSupplierMutation();
    const [deletePaperSupplier] = useDeletePaperSupplierMutation();

    const { data: suppliersData, error: suppliersError, isLoading: isSuppliersLoading } = useGetPaperSupplierQuery({ page: 1, limit: 20 });

    const suppliers = suppliersData?.data ?? [];
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<PaperSupplier | undefined>(undefined);

    const [searchTerm, setSearchTerm] = useState<string>('');
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

    const filteredSuppliers = useMemo(() => {
        if (!searchTerm.trim()) return suppliers;
        const lower = searchTerm.toLowerCase();
        return suppliers.filter(
            (s: { code: string; name: string; }) =>
                s.code.toLowerCase().includes(lower) ||
                s.name.toLowerCase().includes(lower)
        );
    }, [suppliers, searchTerm]);

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
        } catch (err) {
            toaster.create({
                title: "Thất bại",
                description: errorMessage,
                type: "error",
                closable: true,
            });
            console.error(err);
        }
    };

    const handleAddSupplier = async (data: PaperSupplier) => {

        handleMutation(
            () => addPaperSupplier(data).unwrap(),
            `Đã lưu nhà giấy ${data.code} - ${data.name}`,
            'Lưu thất bại, thử lại sau',
        )
    }

    const handleUpdateSupplier = async (data: PaperSupplier) => {

        handleMutation(
            () => updatePaperSupplier(data).unwrap(),
            `Đã cập nhật nhà giấy ${data.code} - ${data.name}`,
            'Cập nhật thất bại, thử lại sau',
        )

    }

    const handleDeleteSupplier = async (data: PaperSupplier) => {

        handleMutation(
            () => deletePaperSupplier(data._id?.$oid ?? "").unwrap(),
            `Xóa nhà giấy ${data.code} - ${data.name}`,
            'Xóa thất bại, thử lại sau',
        )

    }

    const endElement = searchTerm ? (
        <CloseButton
            size={"lg"}
            onClick={() => {
                setSearchTerm('');
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
    if (!suppliers?.length) return <Text>Không có nhà giấy nào.</Text>;


    return (

        <>
            <PaperSupplierFormDialog
                isOpen={formDialogOpen}
                onClose={handleCloseFormDialog}
                initialData={selectedSupplier}
                existingSuppliers={suppliers}
                onAdd={(data) => handleAddSupplier(data)}
                onUpdate={(data) => handleUpdateSupplier(data)} />

            <PaperSupplierAlertDialog
                isOpen={alertDialogOpen}
                onClose={handleCloseAlertDialog}
                initialData={selectedSupplier}
                onDelete={(data) => handleDeleteSupplier(data)} />
            <Flex direction={"row-reverse"}>
                <InputGroup endElement={endElement} w={"full"} maxW={"sm"}>
                    <Input ref={inputRef} flex="1" size={"lg"} placeholder="Tìm kiếm" value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                        }} />
                </InputGroup>
                <Spacer />
                <Button colorPalette={"green"} onClick={() => handleOpenFormDialog()}><Icon><FaPlus /></Icon>Thêm nhà giấy</Button>
            </Flex>

            <Table.ScrollArea
                borderWidth="1px"
                rounded="md"
                height="500px"
                mt={5}>
                <Table.Root
                    size="lg"
                    showColumnBorder
                    stickyHeader
                    interactive
                    colorPalette={"orange"}
                    tableLayout={"auto"}
                    w={"100%"}>

                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader w='1%' textAlign={'center'}>STT</Table.ColumnHeader>
                            <Table.ColumnHeader>Mã Nhà Giấy</Table.ColumnHeader>
                            <Table.ColumnHeader>Tên Nhà Giấy</Table.ColumnHeader>
                            <Table.ColumnHeader w="1%" textAlign="center">Thao tác</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {filteredSuppliers.map((supplier: PaperSupplier, index: number) => (
                            <Table.Row key={supplier._id?.$oid ?? index}>
                                <Table.Cell textAlign={'center'}>{index + 1}</Table.Cell>
                                <Table.Cell>{supplier.code}</Table.Cell>
                                <Table.Cell>{supplier.name}</Table.Cell>
                                <Table.Cell>
                                    <Group gap={5}>
                                        <PaperSupplierDetailDialog code={supplier.code} name={supplier.name} />
                                        <Button
                                            variant={"surface"}
                                            colorPalette={"yellow"}
                                            onClick={() => handleOpenFormDialog(supplier)}>
                                            <Icon>
                                                <FaEdit />
                                            </Icon>
                                            Sửa
                                        </Button>
                                        <Button
                                            variant={"surface"}
                                            colorPalette={"red"}
                                            onClick={() => handleOpenAlertDialog(supplier)}>
                                            <Icon>
                                                <FaTrashCan />
                                            </Icon>
                                            Xóa
                                        </Button>
                                    </Group>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>
        </>

    );
}

export default PaperSupplierTable;