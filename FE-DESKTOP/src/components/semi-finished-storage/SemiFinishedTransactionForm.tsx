import React, { useEffect, useState } from "react";
import { Button, Combobox, Dialog, Field, Flex, Input, NumberInput, Portal, Select, createListCollection, useFilter, useListCollection } from "@chakra-ui/react";
import { SemiFinishedGood } from "@/types/SemiFinishedGood";
import { useCreateSemiFinishedGoodTransactionMutation } from "@/service/api/semiFinishedGoodTransactionApiSlice";
import { toaster } from "@/components/ui/toaster";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { CreateSemiFinishedGoodTransactionDTO } from "@/types/SemiFinishedTransaction";

interface Props {
    isOpen: boolean;
    manufacturingOrders: ManufacturingOrder[];
    onClose: () => void;
    initialData?: SemiFinishedGood | undefined;
    transactionType?: "IMPORT" | "EXPORT";
}


const SemiFinishedTransactionForm: React.FC<Props> = ({ isOpen, onClose, initialData, transactionType, manufacturingOrders }) => {
    const [createSemiTransaction] = useCreateSemiFinishedGoodTransactionMutation();

    const today = new Date();
    const localDate = today.toISOString().split("T")[0];
    const departments = createListCollection({
        items: [
            { label: "Bộ Phận In", value: "BP IN" },
            { label: "Chế Biến", value: "CHE BIEN" },
            { label: "Kho Thành Phẩm", value: "KHO TP" },
        ],
    })

    const [transaction, setTransaction] = useState<CreateSemiFinishedGoodTransactionDTO>({
        manufacturingOrder: "",
        manufacturingOrderCode: "",
        transactionType: transactionType ?? "IMPORT",
        quantity: 0,
        transactionDate: localDate,
        exportedTo: undefined,
        employee: "691b660f3a472fc27fde0c31",
        note: "",
    });

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
            setTransaction({
                manufacturingOrder: initialData?.manufacturingOrder?._id ?? "",
                manufacturingOrderCode: initialData?.manufacturingOrder?.code ?? "",
                transactionType: transactionType ?? "IMPORT",
                quantity: 0,
                transactionDate: localDate,
                exportedTo: initialData?.exportedTo,
                employee: "69146dd889bf8e8ca320bcff", //TODO: hardcode employee
                note: "",
            });
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!transaction.manufacturingOrder) {
            toaster.create({ title: "Lỗi", description: "Chưa chọn bán thành phẩm", type: "error", closable: true });
            return;
        }

        if (transaction.transactionType == 'EXPORT' && transaction.exportedTo == undefined) {
            toaster.create({ title: "Lỗi", description: "Chưa chọn bộ phận xuất phôi", type: "error", closable: true });
            return;
        }

        try {
            await createSemiTransaction({
                manufacturingOrder: transaction.manufacturingOrder,
                transactionType: transaction.transactionType,
                quantity: transaction.quantity,
                transactionDate: transaction.transactionDate,
                exportedTo: transaction.exportedTo,
                employee: transaction.employee,
                note: transaction.note
            } as any).unwrap();
            toaster.create({
                title: "Thành công",
                description: `${transaction.transactionType === "IMPORT" ? "Nhập" : "Xuất"} kho 
                ${transaction.quantity} bán thành phẩm lệnh ${transaction.manufacturingOrderCode}`,
                type: "success",
                closable: true
            });
            moFilter("");
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
                            <Dialog.Title>
                                {transaction.transactionType === "IMPORT" ? "Phiếu Nhập" : "Phiếu Xuất"} Kho Bán Thành Phẩm
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Flex direction="column" gap={3}>
                                <Field.Root orientation="vertical">
                                    <Field.Label fontSize="lg">Mã lệnh</Field.Label>
                                    <Combobox.Root
                                        collection={moCollection}
                                        defaultInputValue={initialData?.manufacturingOrder?.code || ""}
                                        readOnly={initialData?.manufacturingOrder ? true : false}
                                        onInputValueChange={(e) => moFilter(e.inputValue)}
                                        onValueChange={(details) => {
                                            setTransaction({ ...transaction, manufacturingOrder: details.value[0] });
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
                                        step={100}
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
                                </Field.Root>

                                {transaction.transactionType == 'EXPORT' &&
                                    <Field.Root orientation="vertical">
                                        <Select.Root
                                            collection={departments}
                                            width="320px"
                                            value={[transaction.exportedTo ?? '']}
                                            readOnly={transaction.exportedTo != undefined}
                                            onValueChange={(e) => setTransaction({ ...transaction, exportedTo: e.value[0] })}
                                        >
                                            <Select.HiddenSelect />
                                            <Select.Label>Xuất phôi</Select.Label>
                                            <Select.Control>
                                                <Select.Trigger>
                                                    <Select.ValueText placeholder="Chọn bộ phận xuất phôi" />
                                                </Select.Trigger>
                                                <Select.IndicatorGroup>
                                                    <Select.Indicator />
                                                </Select.IndicatorGroup>
                                            </Select.Control>
                                            <Select.Positioner>
                                                <Select.Content>
                                                    {departments.items.map((department) => (
                                                        <Select.Item item={department} key={department.value}>
                                                            {department.label}
                                                            <Select.ItemIndicator />
                                                        </Select.Item>
                                                    ))}
                                                </Select.Content>
                                            </Select.Positioner>
                                        </Select.Root>
                                    </Field.Root>
                                }

                                <Field.Root orientation="vertical">
                                    <Field.Label fontSize="lg">
                                        Ngày {transaction.transactionType === "IMPORT" ? "nhập" : "xuất"}
                                    </Field.Label>
                                    <Input
                                        type="date"
                                        value={transaction.transactionDate}
                                        onChange={(e) => setTransaction({ ...transaction, transactionDate: e.target.value })}
                                        max={localDate}
                                        width="200px"
                                    />
                                </Field.Root>

                                <Field.Root orientation="vertical">
                                    <Field.Label>Ghi chú</Field.Label>
                                    <Input
                                        value={transaction.note}
                                        onChange={(e) => setTransaction({ ...transaction, note: e.target.value })} />
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
