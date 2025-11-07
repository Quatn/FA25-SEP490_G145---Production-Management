"use client";

import { Button, ButtonGroup, CloseButton, Dialog, Flex, Group, IconButton, Input, InputGroup, Portal, Spacer, Table } from "@chakra-ui/react";
import check from "check-types";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Text } from "@chakra-ui/react"
import { useAddPaperSupplierMutation, useDeletePaperSupplierMutation, useGetPaperSupplierQuery, useUpdatePaperSupplierMutation } from "@/service/api/paperSupplierApiSlice";
import { PaperSupplier } from "@/types/PaperSupplier";
import { toaster } from "@/components/ui/toaster";
import { Icon } from "@chakra-ui/react";
import { FaEdit, FaEye, FaPlus, FaSearch } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import PaperSupplierDetailDialog from "./PaperSupplierDetailDialog";
import PaperSupplierFormDialog from "./PaperSupplierFormDialog";
import PaperSupplierAlertDialog from "./PaperSupplierAlertDialog";

const PaperSupplierTable: React.FC = () => {

  const [addPaperSupplier] = useAddPaperSupplierMutation();
  const [updatePaperSupplier] = useUpdatePaperSupplierMutation();
  const [deletePaperSupplier] = useDeletePaperSupplierMutation();

  const {
    data: suppliersData,
    isLoading: isSuppliersLoading,
    error: suppliersError,
  } = useGetPaperSupplierQuery({});

  const [suppliers, setSuppliers] = useState<PaperSupplier[]>([]);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<PaperSupplier | undefined>(undefined);

  useEffect(() => {
    if (suppliersData?.data) {
      setSuppliers(suppliersData.data);
    }
  }, [suppliersData]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenFormDialog = (supplier?: PaperSupplier) => {
    setSelectedSupplier(supplier);
    setFormDialogOpen(true);
  };

  const handlOpenAlertDialog = (supplier: PaperSupplier) => {
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

    return suppliers.filter((s) =>
      Object.values(s).some((val) =>
        String(val).toLowerCase().includes(lower)
      )
    );
  }, [suppliers, searchTerm]);

  const handleAddSupplier = async (data: PaperSupplier) => {

    try {
      await addPaperSupplier(data).unwrap();

      const newSupplier = { ...data, _id: { $oid: "mock" } };
      setSuppliers((prev) => [...prev, newSupplier]);

      toaster.create({
        title: 'Lưu thành công',
        description: `Đã lưu nhà giấy ${data.code} - ${data.name}`,
        type: 'success',
        closable: true,
      })


    } catch (err) {
      toaster.create({
        title: 'Lưu thất bại',
        description: 'Thử lại sau',
        type: 'error',
        closable: true,
      });
      console.log({ err });
    }
  }

  const handleUpdateSupplier = async (data: PaperSupplier) => {

    try {
      await updatePaperSupplier(data).unwrap();

      setSuppliers((prev) =>
        prev.map((supplier) =>
          supplier._id === data._id ? { ...supplier, ...data } : supplier
        )
      );

      toaster.create({
        title: 'Cập nhật thành công',
        description: `Đã cập nhật nhà giấy ${data.code} - ${data.name}`,
        type: 'success',
        closable: true,
      })


    } catch (err) {
      toaster.create({
        title: 'Cập nhật thất bại',
        description: 'Thử lại sau',
        type: 'error',
        closable: true,
      });
      console.log({ err });
    }
  }

  const handleDeleteSupplier = async (data: PaperSupplier) => {

    try {
      await deletePaperSupplier(data.code).unwrap();

      setSuppliers((prev) =>
        prev.filter((supplier) => supplier._id !== data._id)
      );

      toaster.create({
        title: 'Xóa thành công',
        description: `Xóa nhà giấy ${data.code} - ${data.name}`,
        type: 'success',
        closable: true,
      })


    } catch (err) {
      toaster.create({
        title: 'Xóa thất bại',
        description: 'Thử lại sau',
        type: 'error',
        closable: true,
      });
      console.log({ err });
    }
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

  if (isSuppliersLoading) return <Text>Loading...</Text>;
  if (suppliersError) return <Text>Error loading data</Text>;
  if (check.undefined(suppliers)) return <Text>Unable to load data</Text>;

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
            {filteredSuppliers.map((supplier, index) => (
              <Table.Row key={index}>
                <Table.Cell textAlign={'center'}>{index+1}</Table.Cell>
                <Table.Cell>{supplier.code}</Table.Cell>
                <Table.Cell>{supplier.name}</Table.Cell>
                <Table.Cell>
                  <Group gap={5}>
                    <PaperSupplierDetailDialog code={supplier.code} name={supplier.name} />
                    <Button variant={"surface"} colorPalette={"yellow"} onClick={() => handleOpenFormDialog(supplier)}><Icon><FaEdit /></Icon>Sửa</Button>
                    <Button variant={"surface"} colorPalette={"red"} onClick={() => handlOpenAlertDialog(supplier)}><Icon><FaTrashCan /></Icon>Xóa</Button>
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
