import React, { useEffect, useState } from "react";
import { Button, Combobox, Dialog, Field, Flex, Input, NumberInput, Portal, Select, createListCollection, useFilter, useListCollection } from "@chakra-ui/react";
import { SemiFinishedGood } from "@/types/SemiFinishedGood";
import { useCreateSemiFinishedGoodTransactionMutation } from "@/service/api/semiFinishedGoodTransactionApiSlice";
import { toaster } from "@/components/ui/toaster";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { CreateSemiFinishedGoodTransactionDTO } from "@/types/SemiFinishedTransaction";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";
import { UserState } from "@/types/UserState";
import { useAppSelector } from "@/service/hooks";
import { formatDateForInput } from "@/utils/dateUtils";

interface Props {
    isOpen: boolean;
    manufacturingOrders: ManufacturingOrder[];
    onClose: () => void;
}


const SemiFinishedInventoryAuditForm: React.FC<Props> = ({ isOpen, onClose, manufacturingOrders }) => {
    const [createSemiTransaction] = useCreateSemiFinishedGoodTransactionMutation();

    const userState: UserState | null = useAppSelector((state) =>
        state.auth.userState
    );
    const today = new Date();
    const localDate = formatDateForInput(today);

    const [corrugatorProcessAmount, setCorrugatorProcessAmount] = useState(0);

    const [transaction, setTransaction] = useState<CreateSemiFinishedGoodTransactionDTO>({
        manufacturingOrder: "",
        manufacturingOrderCode: "",
        transactionType: "ADJUSTMENT",
        quantity: 0,
        transactionDate: localDate,
        employee: userState?.employeeId ?? "",
        note: "",
    });

    const { contains } = useFilter({ sensitivity: "base" });
    const initialMOs = manufacturingOrders.map((mo) => {
        const poi: PurchaseOrderItem = mo.purchaseOrderItem as PurchaseOrderItem;
        const subPO = poi.subPurchaseOrder;
        const po = subPO?.purchaseOrder;
        const customer = po?.customer;
        return ({
            label: `${mo.code} - ${customer?.code} - ${po?.code} `,
            value: mo._id,
        });
    });
    const { collection: moCollection, filter: moFilter } = useListCollection({
        initialItems: initialMOs,
        filter: contains,
    });

    const handleSubmit = async () => {
        if (!transaction.manufacturingOrder) {
            toaster.create({ title: "Lỗi", description: "Chưa chọn mã lệnh", type: "error", closable: true });
            return;
        }

        if (transaction.quantity < 0) {
            toaster.create({ title: "Lỗi", description: "Số lượng phải lớn hơn hoặc bằng 0", type: "error", closable: true });
            return;
        }

        if (transaction.quantity > corrugatorProcessAmount) {
            toaster.create({ title: "Lỗi", description: "Số lượng không được lớn hơn sản lượng sóng", type: "error", closable: true });
            return;
        }

        try {
            await createSemiTransaction({
                manufacturingOrder: transaction.manufacturingOrder,
                transactionType: transaction.transactionType,
                quantity: transaction.quantity,
                transactionDate: transaction.transactionDate,
                employee: transaction.employee,
                note: transaction.note
            } as any).unwrap();
            toaster.create({
                title: "Thành công",
                description: `Tạo phiếu kiểm kê kho phôi lệnh ${transaction.manufacturingOrderCode} thành công`,
                type: "success",
                closable: true
            });
            moFilter("");
            setTransaction({
                manufacturingOrder: "",
                manufacturingOrderCode: "",
                transactionType: "ADJUSTMENT",
                quantity: 0,
                transactionDate: localDate,
                employee: userState?.employeeId ?? "",
                note: "",
            });
            setCorrugatorProcessAmount(0);
            onClose();
        } catch (err: any) {
            const msg = err?.data?.message || err?.message || "Lỗi khi tạo phiếu kiểm kê";
            toaster.create({ title: "Lỗi", description: msg, type: "error", closable: true });
        }
    };

    const handlUpdateAdjustmentBoundAmount = (id?: string) => {
        if (id) {
            const mo = manufacturingOrders.find(item => item._id == id);
            const amount = mo?.corrugatorProcess.manufacturedAmount ?? 0;
            setCorrugatorProcessAmount(amount);
        } else setCorrugatorProcessAmount(0);
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose} size="md">
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>
                                Phiếu Kiểm Kê Kho Phôi
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Flex direction="column" gap={3}>
                                <Field.Root orientation="vertical">
                                    <Field.Label fontSize="lg">Mã lệnh</Field.Label>
                                    <Combobox.Root
                                        collection={moCollection}
                                        onInputValueChange={(e) => moFilter(e.inputValue)}
                                        onValueChange={(details) => {
                                            handlUpdateAdjustmentBoundAmount(details.value[0]);
                                            setTransaction({ ...transaction, manufacturingOrder: details.value[0] });
                                        }}>
                                        <Combobox.Control>
                                            <Combobox.Input placeholder="Chọn hoặc tìm mã lệnh đang chạy hoặc đã hoàn thành sóng" />
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
                                        value={"Kiểm kê"}
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
                                        value={String(transaction.quantity ?? 0)}
                                        onValueChange={(details) => {
                                            let value = details.valueAsNumber;

                                            if (value == null || isNaN(value) || value < 0) {
                                                value = 0;
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
                                    <Field.HelperText fontSize={'md'} fontWeight={'bold'}>
                                        Đối chiếu sản lượng sóng: {corrugatorProcessAmount}
                                    </Field.HelperText>
                                </Field.Root>

                                <Field.Root orientation="vertical">
                                    <Field.Label fontSize="lg">
                                        Ngày kiểm kê
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

export default SemiFinishedInventoryAuditForm;
