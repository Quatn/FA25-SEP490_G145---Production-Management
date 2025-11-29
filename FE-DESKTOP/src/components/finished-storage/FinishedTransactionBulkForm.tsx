import React, { useEffect, useState } from "react";
import { Box, Button, Combobox, Dialog, Field, Input, NumberInput, Portal, Table, Text, useFilter, useListCollection } from "@chakra-ui/react";
import { useCreateBulkFinishedGoodTransactionsMutation } from "@/service/api/finishedGoodTransactionApiSlice";
import { toaster } from "@/components/ui/toaster";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { CreateFinishedGoodTransactionDTO } from "@/types/FinishedGoodTransaction";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    manufacturingOrders: ManufacturingOrder[];
    transactionType: "IMPORT" | "EXPORT";
}

const FinishedTransactionBulkForm: React.FC<Props> = ({
    isOpen,
    onClose,
    transactionType,
    manufacturingOrders
}) => {
    const [createBulkTransactions] = useCreateBulkFinishedGoodTransactionsMutation();

    const today = new Date();
    const localDate = today.toISOString().split("T")[0];

    const [openConfirm, setOpenConfirm] = useState(false);

    const [rows, setRows] = useState<CreateFinishedGoodTransactionDTO[]>([
        {
            manufacturingOrder: "",
            transactionType,
            quantity: 0,
            transactionDate: localDate,
            employee: "691b660f3a472fc27fde0c31",
            note: "",
        },
    ]);

    const { contains } = useFilter({ sensitivity: "base" });
    const initialMOs = manufacturingOrders.map((mo) => ({
        label: `${mo.code} - ${mo.purchaseOrderItem?.subPurchaseOrder?.purchaseOrder?.customer?.code} - ${mo.purchaseOrderItem?.subPurchaseOrder?.purchaseOrder?.code} `,
        value: mo._id,
    }));

    const { collection: moCollection, filter: moFilter } = useListCollection({
        initialItems: initialMOs,
        filter: contains,
    });

    useEffect(() => {
        if (isOpen) {
            setRows([
                {
                    manufacturingOrder: "",
                    transactionType,
                    quantity: 0,
                    transactionDate: localDate,
                    employee: "691b660f3a472fc27fde0c31",
                    note: "",
                },
            ]);
        }
    }, [isOpen]);

    const addRow = () => {
        setRows([
            ...rows,
            {
                manufacturingOrder: "",
                transactionType,
                quantity: 0,
                transactionDate: localDate,
                employee: "691b660f3a472fc27fde0c31",
                note: "",
            },
        ]);
    };

    const [errors, setErrors] = useState<
        { rowIndex: number; field: string; message: string }[]
    >([]);

    const setError = (rowIndex: number, field: string, message: string) => {
        setErrors(prev => {
            const filtered = prev.filter(e => !(e.rowIndex === rowIndex && e.field === field));
            return message ? [...filtered, { rowIndex, field, message }] : filtered;
        });
    };

    const validateManufacturingOrder = (value: string, rowIndex: number) => {
        if (!value.trim()) {
            setError(rowIndex, "manufacturingOrder", "Không được để trống");
            return;
        }

        const duplicate = rows.some(
            (r, i) => i !== rowIndex && r.manufacturingOrder === value
        );
        if (duplicate) {
            setError(rowIndex, "manufacturingOrder", "Manufacturing Order bị lặp");
            return;
        }

        setError(rowIndex, "manufacturingOrder", "");
    };

    const updateRow = (index: number, field: keyof CreateFinishedGoodTransactionDTO, value: any) => {
        const updated: any[] = [...rows];
        updated[index][field] = value;
        setRows(updated);

        // gọi validate tương ứng
        if (field === "manufacturingOrder") {
            validateManufacturingOrder(value, index);
        }

    };

    const removeRow = (index: number) => {
        setRows(rows.filter((_, i) => i !== index));
        setErrors(errors.filter(e => e.rowIndex !== index));
    };

    const validateSubmission = () => {
        const moIds = rows.map((r) => r.manufacturingOrder);
        const unique = new Set(moIds);
        if (unique.size !== moIds.length) {
            toaster.create({
                title: "Lỗi",
                description: "Mỗi dòng phải có mã lệnh khác nhau!",
                type: "error",
            });
            return;
        }

        for (const r of rows) {
            if (!r.manufacturingOrder) {
                toaster.create({
                    title: "Lỗi",
                    description: "Có dòng chưa chọn mã lệnh",
                    type: "error",
                });
                return;
            }
            if (r.quantity <= 0) {
                toaster.create({
                    title: "Lỗi",
                    description: "Số lượng phải lớn hơn 0",
                    type: "error",
                });
                return;
            }
        }

        setOpenConfirm(true);

    }

    const handleSubmit = async () => {
        setOpenConfirm(false);
        try {
            await createBulkTransactions(rows).unwrap();

            toaster.create({
                title: "Thành công",
                description: `Tạo phiếu ${transactionType == 'IMPORT' ? 'nhập' : 'xuất'} thành công`,
                type: "success",
            });

            onClose();
        } catch (err: any) {
            toaster.create({
                title: "Lỗi",
                description: err?.data?.message || "Không thể thao tác",
                type: "error",
            });
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose} size="cover">
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>
                                {transactionType === "IMPORT" ? "Phiếu Nhập" : "Phiếu Xuất"} Kho Thành Phẩm
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Table.Root
                                size={'lg'}
                                variant={'line'}
                                interactive
                                colorPalette={'orange'}
                                showColumnBorder>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeader w={"1%"} textAlign={'center'}>STT</Table.ColumnHeader>
                                        <Table.ColumnHeader textAlign={'center'}>Mã Lệnh</Table.ColumnHeader>
                                        <Table.ColumnHeader textAlign={'center'}>Loại Thao Tác</Table.ColumnHeader>
                                        <Table.ColumnHeader w={"1%"} textAlign={'center'}>Số lượng</Table.ColumnHeader>
                                        <Table.ColumnHeader textAlign={'center'}>{`Ngày ${transactionType == 'IMPORT' ? 'nhập' : 'xuất'}`} </Table.ColumnHeader>
                                        <Table.ColumnHeader textAlign={'center'}>Ghi chú</Table.ColumnHeader>
                                        <Table.ColumnHeader textAlign={'center'}>Thao tác</Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {rows.map((row, index) => {
                                        const rowErrors = errors.filter(e => e.rowIndex === index);
                                        const moError = rowErrors.find(e => e.field === "manufacturingOrder");
                                        return (
                                            <Table.Row key={index}>
                                                <Table.Cell>{index + 1}</Table.Cell>
                                                <Table.Cell background={moError ? 'red' : 'white'} >
                                                    <Combobox.Root
                                                        invalid={!!moError}
                                                        collection={moCollection}
                                                        fontWeight={'bold'}
                                                        onInputValueChange={(e) => {
                                                            moFilter(e.inputValue);

                                                        }}
                                                        onValueChange={(details) => {
                                                            const item = initialMOs.find(
                                                                (x) => x.value === details.value[0]
                                                            );
                                                            updateRow(index, "manufacturingOrder", item?.value || "");
                                                        }}
                                                    >
                                                        <Combobox.Control>
                                                            <Combobox.Input placeholder="Chọn mã lệnh" />
                                                            <Combobox.IndicatorGroup>
                                                                <Combobox.ClearTrigger />
                                                                <Combobox.Trigger />
                                                            </Combobox.IndicatorGroup>
                                                        </Combobox.Control>
                                                        <Combobox.Positioner>
                                                            <Combobox.Content>
                                                                <Combobox.Empty>
                                                                    Không có mã lệnh phù hợp
                                                                </Combobox.Empty>
                                                                {moCollection.items.map((item, idx) => (
                                                                    <Combobox.Item key={idx} item={item}>
                                                                        {item.label}
                                                                    </Combobox.Item>
                                                                ))}
                                                            </Combobox.Content>
                                                        </Combobox.Positioner>
                                                    </Combobox.Root>
                                                </Table.Cell>
                                                <Table.Cell textAlign="center">
                                                    <Input
                                                        type="text"
                                                        value={transactionType === "IMPORT" ? "Nhập Thành Phẩm" : "Xuất Thành Phẩm"}
                                                        readOnly
                                                    />
                                                </Table.Cell>
                                                <Table.Cell textAlign="center">
                                                    <NumberInput.Root
                                                        width="200px"
                                                        step={100}
                                                        min={0}
                                                        value={String(row.quantity)}
                                                        onValueChange={(details) =>
                                                            updateRow(
                                                                index,
                                                                "quantity",
                                                                details.valueAsNumber || 0
                                                            )
                                                        }
                                                    >
                                                        <NumberInput.Input
                                                            onKeyDown={(e) => {
                                                                const target = e.target as HTMLInputElement;

                                                                const isDigit = /^[0-9]$/.test(e.key);

                                                                if (target.selectionStart === 0 && target.value === "0" && isDigit) {
                                                                    e.preventDefault();
                                                                    const newValue = e.key;

                                                                    target.value = newValue;
                                                                    target.dispatchEvent(new Event("input", { bubbles: true }));
                                                                }

                                                                if (e.key === "-" || e.key === "e" || e.key === " ") {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                        />

                                                        <NumberInput.Control />
                                                    </NumberInput.Root>
                                                </Table.Cell>
                                                <Table.Cell textAlign="center">
                                                    <Input
                                                        type="date"
                                                        max={localDate}
                                                        value={row.transactionDate}
                                                        onChange={(e) =>
                                                            updateRow(
                                                                index,
                                                                "transactionDate",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Input
                                                        value={row.note}
                                                        onChange={(e) =>
                                                            updateRow(index, "note", e.target.value)
                                                        }
                                                    />
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Button colorPalette={'red'} color={'white'} fontWeight={'bold'} onClick={() => removeRow(index)}>
                                                        Xóa
                                                    </Button>
                                                </Table.Cell>
                                            </Table.Row>
                                        )
                                    })}
                                </Table.Body>
                            </Table.Root>
                            <Button mb={3} mt={5} onClick={addRow} colorPalette="blue">
                                + Thêm 1 dòng
                            </Button>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button onClick={onClose} colorPalette="red">Hủy</Button>
                            </Dialog.ActionTrigger>
                            <Button colorPalette="green" onClick={validateSubmission}>Xác nhận</Button>
                            <Dialog.Root open={openConfirm}>
                                <Portal>
                                    <Dialog.Backdrop />
                                    <Dialog.Positioner>
                                        <Dialog.Content>
                                            <Dialog.Header>
                                                <Dialog.Title>Xác nhận nhập kho thành phẩm</Dialog.Title>
                                            </Dialog.Header>
                                            <Dialog.Body>
                                                <Text fontSize={'lg'}>
                                                    Xác nhận nhập kho? Hành động này không thể thay đổi!
                                                </Text>
                                            </Dialog.Body>
                                            <Dialog.Footer>
                                                <Dialog.ActionTrigger asChild>
                                                    <Button colorPalette="red" onClick={() => setOpenConfirm(false)}>Hủy</Button>
                                                </Dialog.ActionTrigger>
                                                <Button colorPalette="green" onClick={handleSubmit}>Xác nhận</Button>
                                            </Dialog.Footer>
                                        </Dialog.Content>
                                    </Dialog.Positioner>
                                </Portal>
                            </Dialog.Root>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

export default FinishedTransactionBulkForm;
