import React, { useEffect, useState } from "react";
import { Button, Combobox, Dialog, Field, Flex, Input, NumberInput, Portal, Select, createListCollection, useFilter, useListCollection } from "@chakra-ui/react";
import { SemiFinishedGood } from "@/types/SemiFinishedGood";
import { useCreateTransactionMutation } from "@/service/api/semiFinishedGoodTransactionApiSlice";
import { toaster } from "@/components/ui/toaster";
import { SemiFinishedGoodTransaction } from "@/types/SemiFinishedTransaction";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";

interface Props {
    isOpen: boolean;
    manufacturingOrders: ManufacturingOrder[];
    onClose: () => void;
    initialData?: SemiFinishedGood | undefined;
    transactionType?: "IMPORT" | "EXPORT";
}

type TransactionRequest = {
    manufacturingOrderId: string;
    manufacturingOrderCode: string;
    transactionType: "IMPORT" | "EXPORT";
    quantity: number;
    employeeId?: string;
    note?: string;
};

const SemiFinishedTransactionForm: React.FC<Props> = ({ isOpen, onClose, initialData, transactionType, manufacturingOrders }) => {
    const [createTx] = useCreateTransactionMutation();
    const [transaction, setTransaction] = useState<TransactionRequest>({
        manufacturingOrderId: "",
        manufacturingOrderCode: "",
        transactionType: transactionType ?? "IMPORT",
        quantity: 0,
        employeeId: "",
        note: "",
    });

    const { contains } = useFilter({ sensitivity: "base" });
    const initialMOs = manufacturingOrders.map((mo) => ({
        label: `${mo.code}`,
        value: mo._id,
    }));
    const { collection: moCollection, filter: moFilter } = useListCollection({
        initialItems: initialMOs,
        filter: contains,
    });

    useEffect(() => {
        if (isOpen) {
            setTransaction({
                manufacturingOrderId: initialData?.manufacturingOrderId ?? "",
                manufacturingOrderCode: initialData?.manufacturingOrder?.code ?? "",
                transactionType: transactionType ?? "IMPORT",
                quantity: 0,
                employeeId: "69146dd889bf8e8ca320bcff", //TODO: hardcode employee
                note: "",
            });
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!transaction.manufacturingOrderId) {
            toaster.create({ title: "Lỗi", description: "Chưa chọn bán thành phẩm", type: "error", closable: true });
            return;
        }

        try {
            await createTx({
                manufacturingOrderId: transaction.manufacturingOrderId,
                transactionType: transaction.transactionType,
                quantity: transaction.quantity,
                employeeId: transaction.employeeId,
                note: transaction.note
            } as any).unwrap();
            toaster.create({
                title: "Thành công",
                description: `${transaction.transactionType === "IMPORT" ? "Nhập" : "Xuất"} kho 
                ${transaction.quantity} bán thành phẩm lệnh ${transaction.manufacturingOrderCode}`,
                type: "success",
                closable: true
            });
            onClose();
        } catch (err: any) {
            const msg = err?.data?.message || err?.message || "Lỗi khi tạo giao dịch";
            toaster.create({ title: "Lỗi", description: msg, type: "error", closable: true });
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose} size="md">
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>{transaction.transactionType === "IMPORT" ? "Phiếu Nhập" : "Phiếu Xuất"} Kho Bán Thành Phẩm</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Flex direction="column" gap={3}>
                                <Field.Root orientation="vertical">
                                    <Field.Label fontSize="lg">Mã lệnh</Field.Label>
                                    <Combobox.Root
                                        collection={moCollection}
                                        defaultInputValue={initialData?.manufacturingOrder?.code || ""}
                                        readOnly={initialData?.manufacturingOrderId ? true : false}
                                        onInputValueChange={(e) => moFilter(e.inputValue)}
                                        onValueChange={(details) => {
                                            setTransaction({ ...transaction, manufacturingOrderId: details.value[0] });
                                        }}>
                                        <Combobox.Control>
                                            <Combobox.Input placeholder="Chọn hoặc tìm mã lệnh" />
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
                                                {moCollection.items.map((item, index) => (
                                                    <Combobox.Item key={index} item={item}>
                                                        {item.label}
                                                        <Combobox.ItemIndicator />
                                                    </Combobox.Item>
                                                ))}
                                            </Combobox.Content>
                                        </Combobox.Positioner>
                                    </Combobox.Root>
                                </Field.Root>

                                <Field.Root orientation="vertical">
                                    <Field.Label>Loại Thao Tác</Field.Label>
                                    <Input
                                        size="lg"
                                        type="text"
                                        value={transaction.transactionType === "IMPORT" ? "Nhập Bán Thành Phẩm" : "Xuất Bán Thành Phẩm"}
                                        readOnly
                                    />
                                </Field.Root>

                                <Field.Root invalid={transaction.quantity <= 0} orientation="vertical">
                                    <Field.Label fontSize="lg">Số lượng</Field.Label>

                                    <NumberInput.Root
                                        size="lg"
                                        width="200px"
                                        min={0}
                                        max={
                                            transaction.transactionType === "IMPORT"
                                                ? undefined
                                                : (initialData?.currentQuantity ?? 0)
                                        }
                                        value={String(transaction.quantity ?? 0)}
                                        onValueChange={(details) => {
                                            let value = details.valueAsNumber;

                                            if (value == null || isNaN(value) || value < 0) {
                                                value = 0;
                                            }

                                            if (transaction.transactionType === "EXPORT") {
                                                value = Math.min(value, initialData?.currentQuantity ?? 0);
                                            }

                                            setTransaction({
                                                ...transaction,
                                                quantity: value,
                                            });
                                        }}
                                    >
                                        <NumberInput.Input
                                            onKeyDown={(e) => {
                                                if (e.key === "-" || e.key === "e") {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onPaste={(e) => {
                                                const text = e.clipboardData.getData("text");
                                                if (text.includes("-")) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />

                                        <NumberInput.Control />
                                    </NumberInput.Root>
                                </Field.Root>

                                <Field.Root orientation="vertical">
                                    <Field.Label>Ghi chú</Field.Label>
                                    <Input value={transaction.note} onChange={(e) => setTransaction({ ...transaction, note: e.target.value })} />
                                </Field.Root>
                            </Flex>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button onClick={onClose} colorPalette="red">Hủy</Button>
                            </Dialog.ActionTrigger>
                            <Button colorPalette="green" onClick={handleSubmit}>Xác nhận</Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

export default SemiFinishedTransactionForm;
