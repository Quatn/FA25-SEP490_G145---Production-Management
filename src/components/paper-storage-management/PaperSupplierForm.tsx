"use client";

import {
    useGetPaperSuppliersQuery,
    useAddPaperSuppliersMutation,
    useUpdatePaperSupplierMutation,
    useDeletePaperSupplierMutation
} from "../../service/api/paperRollStorageApiSlice";
import { Button, CloseButton, Dialog, Flex, Icon, Input, Portal, Spacer, Text, } from "@chakra-ui/react";
import check from "check-types";
import { toaster } from "@/components/ui/toaster"
import { useState, useMemo, useEffect, useRef } from "react";
import { HiX } from "react-icons/hi";
import { PiMicrosoftExcelLogoThin } from "react-icons/pi";
import { PaperSupplier, SupplierRow } from "@/types/paperSupplier.types";
import { validateSuppliers } from "@/utils/validationUtils";
import { SupplierRowItem } from "./SupplierRowItem";
import { importSuppliersFromExcel } from "@/utils/importFromExcel";

const PaperSupplierForm: React.FC = () => {

    const [addPaperSuppliers] = useAddPaperSuppliersMutation();
    const [updatePaperSupplier] = useUpdatePaperSupplierMutation();
    const [deletePaperSupplier] = useDeletePaperSupplierMutation();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const DEFAULT_ROW: SupplierRow = {
        code: "",
        name: "",
        isSaved: false,
        isEditing: true,
    };

    const {
        data: suppliersData,
        isLoading: isSuppliersLoading,
        error: suppliersError,
    } = useGetPaperSuppliersQuery({ page: 1, limit: 20, });

    const suppliers = useMemo(() => suppliersData?.paperSuppliers ?? [], [suppliersData]);

    const [rows, setRows] = useState<SupplierRow[]>([]);

    const getValidRows = () =>
        rows.filter(
            (row) =>
                (row.code.trim() !== "" || row.name.trim() !== "") &&
                !row.error?.code &&
                !row.error?.name &&
                (!row.isSaved || row.isEditing)
        );

    const updateRow = (index: number, updates: Partial<SupplierRow>) => {
        setRows((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...updates };
            return validateSuppliers(updated, suppliers);
        });
    };

    const toggleEditing = (index: number) => {
        updateRow(index, { isEditing: true });
    };

    const handleChange = <K extends keyof SupplierRow>(index: number, field: K, value: SupplierRow[K]) => {
        updateRow(index, { [field]: value });
    };

    const handleAddRow = () => {
        const newRows: SupplierRow[] = Array.from({ length: 1 }, () => (DEFAULT_ROW));
        setRows((rows) => {
            const updated = [...rows, ...newRows];
            return validateSuppliers(updated, suppliers);
        });
    };

    const handleResetRow = () => {
        setRows(() => validateSuppliers([DEFAULT_ROW], suppliers));
    }

    const handleRemoveInvalidRows = () => {
        setRows(getValidRows());
    };

    const handleRemoveRow = async (index: number) => {
        const row = rows[index];
        if (!row?.isSaved) {
            setRows((prev) => validateSuppliers(prev.filter((_, i) => i !== index), suppliers));
            return;
        }

        updateRow(index, { isDeleting: true });

        try {
            await deletePaperSupplier(row.code!).unwrap();
            setRows((prev) => prev.filter((_, i) => i !== index));

            toaster.create({
                title: 'Xóa thành công',
                description: `Đã xóa nhà giấy ${row.code} - ${row.name}`,
                type: "success",
                action: {
                    label: "Hoàn tác",
                    onClick: () => {
                        setTimeout(() => {
                            const restoredRow = { ...row, isDeleting: false, isSaved: false };
                            setRows((prev) => {
                                const updated = [...prev];
                                updated.splice(index, 0, restoredRow);
                                return validateSuppliers(updated, suppliers);
                            });
                        }, 0);
                    },
                },
            });
        } catch {
            toaster.create({
                title: "Xóa thất bại",
                description: "Thử lại sau",
                type: "error",
                closable: true,
            });
            updateRow(index, { isDeleting: false });
        }
    };

    const handleSaveOrUpdate = async (index: number) => {
        updateRow(index, { isLoading: true });

        const row = rows[index];
        const apiData: PaperSupplier = { name: row.name, code: row.code };

        try {
            row.isSaved
                ? await updatePaperSupplier(apiData).unwrap()
                : await addPaperSuppliers([apiData]).unwrap();

            updateRow(index, {
                isSaved: true,
                isEditing: false,
                isLoading: false,
            });

            toaster.create({
                title: `${row.isSaved ? "Cập nhật" : "Lưu"} thành công`,
                description: `Đã ${row.isSaved ? "cập nhật" : "lưu"} nhà giấy ${row.code} - ${row.name}`,
                type: "success",
                closable: true,
            });
        } catch {
            toaster.create({
                title: `${row.isSaved ? "Cập nhật" : "Lưu"} thất bại`,
                description: "Thử lại sau",
                type: "error",
                closable: true,
            });
            updateRow(index, { isLoading: false });
        }
    };

    const handleSaveAll = async () => {

        const validRows = getValidRows();

        setRows((prev) =>
            prev.map((row) =>
                validRows.some((r) => r === row)
                    ? { ...row, isLoading: true }
                    : row
            )
        );

        const results = await Promise.allSettled(
            validRows.map(async (row) => {
                if (row.isSaved) {
                    return await updatePaperSupplier(row).unwrap();
                } else {
                    return await addPaperSuppliers(row).unwrap();
                }
            })
        );

        const updatedRows = [...rows];
        results.forEach((result, i) => {
            const targetIndex = rows.findIndex((r) => r === validRows[i]);
            const row = validRows[i];

            if (result.status === "fulfilled") {
                updatedRows[targetIndex] = {
                    ...row,
                    isSaved: true,
                    isEditing: false,
                    isLoading: false,
                };

                toaster.create({
                    description: `${row.code} - ${row.name} đã lưu thành công`,
                    type: "success",
                    closable: true,
                });
            } else {
                updatedRows[targetIndex] = { ...row, isLoading: false };

                toaster.create({
                    description: `${row.code || "(không mã)"} - ${row.name || "(không tên)"} lỗi khi lưu`,
                    type: "error",
                    closable: true,
                });
            }
        });

        setRows(updatedRows.filter((row) => !(row.code.trim() === "" && row.name.trim() === "")));

    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !suppliersData?.paperSuppliers) return;

        const validatedRows = await importSuppliersFromExcel(file, suppliersData.paperSuppliers);
        setRows((prev) => [...prev, ...validatedRows]);

        const errorCount = validatedRows.filter((r) => r.error?.code || r.error?.name).length;

        toaster.create({
            description: `Đã nhập ${validatedRows.length} dòng từ Excel${errorCount > 0 ? ` (${errorCount} dòng có lỗi)` : ""}`,
            type: errorCount > 0 ? "warning" : "success",
            closable: true,
        });
    };

    useEffect(() => {
        handleAddRow();
    }, [])

    if (isSuppliersLoading) return <Text>Loading...</Text>;
    if (suppliersError) return <Text>Error loading data</Text>;
    if (check.undefined(suppliers)) return <Text>Unable to load data</Text>;

    return (
        <Dialog.Root size="lg" placement="top" scrollBehavior="inside" motionPreset="slide-in-bottom" closeOnInteractOutside={false} modal={false}>
            <Dialog.Trigger asChild>
                <Button variant="outline" size="sm">
                    Open Dialog
                </Button>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Tạo nhà giấy</Dialog.Title>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton
                                    variant={"outline"}
                                    color={"white"}
                                    backgroundColor={"red"}
                                    size="lg"
                                    onClick={handleResetRow}
                                >
                                    <HiX />
                                </CloseButton>
                            </Dialog.CloseTrigger>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Flex gap={3} justify={"flex-start"} direction={"row"}>
                                <Input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    ref={fileInputRef}
                                    style={{ display: "none" }}
                                    onChange={handleImportExcel}
                                />

                                <Button colorPalette="green" onClick={() => fileInputRef.current?.click()}>
                                    Nhập từ <Icon><PiMicrosoftExcelLogoThin /></Icon> Excel
                                </Button>
                            </Flex>

                            <Flex gap={3} direction={"column"} marginTop={"10"}>
                                {rows.map((row, index) => (
                                    <SupplierRowItem
                                        key={index}
                                        row={row}
                                        index={index}
                                        onChange={handleChange}
                                        onSaveOrUpdate={handleSaveOrUpdate}
                                        onRemove={handleRemoveRow}
                                        onEdit={toggleEditing}
                                    />
                                ))}
                            </Flex>

                            <Flex marginTop={10} gap={3} justify={"flex-start"} direction={"row"}>
                                <Button variant="surface" onClick={handleAddRow}>Thêm 1 dòng</Button>
                                <Spacer />
                                <Button
                                    colorPalette="blue"
                                    onClick={handleSaveAll}
                                    disabled={!getValidRows().length}>
                                    Lưu {getValidRows().length} dòng hợp lệ
                                </Button>

                                <Button
                                    colorPalette="red"
                                    onClick={handleRemoveInvalidRows}>
                                    Xóa dòng lỗi
                                </Button>
                            </Flex>
                        </Dialog.Body>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}

export default PaperSupplierForm;
