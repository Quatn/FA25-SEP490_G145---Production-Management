import React, { useEffect, useState } from "react";
import { Button, Dialog, Field, Flex, Input, NumberInput, Portal } from "@chakra-ui/react";
import { useCreateFinishedGoodTransactionMutation } from "@/service/api/finishedGoodTransactionApiSlice";
import { toaster } from "@/components/ui/toaster";
import { FinishedGood } from "@/types/FinishedGood";
import { CreateFinishedGoodTransactionDTO } from "@/types/FinishedGoodTransaction";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: FinishedGood | undefined;
    transactionType?: "IMPORT" | "EXPORT";
}

const FinishedTransactionForm: React.FC<Props> = ({ isOpen, onClose, initialData, transactionType }) => {
    const [createFinishedGoodTransaction] = useCreateFinishedGoodTransactionMutation();
    const today = new Date();
    const localDate = today.toISOString().split("T")[0];
    const [transaction, setTransaction] = useState<CreateFinishedGoodTransactionDTO>({
        manufacturingOrder: "",
        manufacturingOrderCode: "",
        transactionType: transactionType ?? "IMPORT",
        quantity: 0,
        transactionDate: localDate,
        employee: "691b660f3a472fc27fde0c31",
        note: "",
    });

    const [mo, setMo] = useState('');
    const [customer, setCustomer] = useState('');
    const [po, setPo] = useState('');
    
    useEffect(() => {
        if (isOpen) {
            setTransaction({
                manufacturingOrder: initialData?.manufacturingOrder?._id ?? "",
                manufacturingOrderCode: initialData?.manufacturingOrder?.code ?? "",
                transactionType: transactionType ?? "IMPORT",
                quantity: 0,
                transactionDate: localDate,
                employee: "69146dd889bf8e8ca320bcff", //TODO: hardcode employee
                note: "",
            });
            setMo(String(initialData?.manufacturingOrder?.code));
            setCustomer(String(initialData?.manufacturingOrder?.purchaseOrderItem?.subPurchaseOrder?.purchaseOrder?.customer?.code));
            setPo(String(initialData?.manufacturingOrder?.purchaseOrderItem?.subPurchaseOrder?.purchaseOrder?.code));

        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!transaction.manufacturingOrder) {
            toaster.create({ title: "Lỗi", description: "Chưa chọn mã hàng", type: "error", closable: true });
            return;
        }

        try {
            await createFinishedGoodTransaction({
                manufacturingOrder: transaction.manufacturingOrder,
                transactionType: transaction.transactionType,
                quantity: transaction.quantity,
                transactionDate: transaction.transactionDate,
                employee: transaction.employee,
                note: transaction.note
            } as any).unwrap();
            toaster.create({
                title: "Thành công",
                description: `${transaction.transactionType === "IMPORT" ? "Nhập" : "Xuất"} kho 
                ${transaction.quantity} thành phẩm lệnh ${transaction.manufacturingOrderCode}`,
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
                            <Dialog.Title>
                                {transaction.transactionType === "IMPORT" ? "Phiếu Nhập" : "Phiếu Xuất"} Kho Thành Phẩm
                                </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Flex direction="column" gap={3}>
                                <Field.Root orientation="vertical">
                                    <Field.Label fontSize="lg">Mã lệnh</Field.Label>
                                    <Input
                                        size="lg"
                                        type="text"
                                        value={`${mo} - ${customer} - ${po}`}
                                        readOnly
                                    />
                                </Field.Root>

                                <Field.Root orientation="vertical">
                                    <Field.Label>Loại Thao Tác</Field.Label>
                                    <Input
                                        size="lg"
                                        type="text"
                                        value={transaction.transactionType === "IMPORT" ? "Nhập Thành Phẩm" : "Xuất Thành Phẩm"}
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

export default FinishedTransactionForm;
