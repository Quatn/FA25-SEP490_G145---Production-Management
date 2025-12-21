import { Box, Button, CloseButton, Dialog, Field, NumberInput, Portal, Text } from "@chakra-ui/react"
import { OrderFinishingProcess } from "@/types/OrderFinishingProcess";
import { OrderFinishingProcessStatus } from "@/types/enums/OrderFinishingProcessStatus";
import { useState } from "react";
import { SemiFinishedGood } from "@/types/SemiFinishedGood";

interface OrderFinishingProcessAlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: OrderFinishingProcess;
    semiFinishedGood?: SemiFinishedGood;
    updateToStatus?: OrderFinishingProcessStatus;
    onUpdate: (updateId: string, updateStatus: OrderFinishingProcessStatus, updateCompletedAmount?: number) => void;
}

const OrderFinishingProcessDialog: React.FC<OrderFinishingProcessAlertDialogProps> = ({
    isOpen,
    onClose,
    initialData,
    semiFinishedGood,
    updateToStatus,
    onUpdate,
}) => {

    const [quantity, setQuantity] = useState(0);

    const isSfgInvalid = updateToStatus === OrderFinishingProcessStatus.InProduction && (!semiFinishedGood || (semiFinishedGood?.exportedQuantity ?? 0) <= 0);

    const isQuantityInsufficient =
        updateToStatus === OrderFinishingProcessStatus.FinishedProduction &&
        quantity < Math.max(0, initialData?.requiredAmount ?? 0);

    const isDisabled = isSfgInvalid || isQuantityInsufficient;

    const handleSubmit = () => {
        if (initialData && updateToStatus) onUpdate(initialData._id, updateToStatus, quantity);
        onClose();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Xác Nhận Chạy Kế Hoạch</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            {updateToStatus == OrderFinishingProcessStatus.InProduction &&
                                <Box>
                                    <Text>Chạy kế hoạch {initialData?.code} ?</Text>
                                    <Text fontWeight={'bold'} color={'red'}>
                                        {semiFinishedGood ?
                                            (semiFinishedGood.exportedQuantity > 0 ?
                                                `Kho phôi đã xuất ${semiFinishedGood.exportedQuantity} tấm`
                                                : 'Phôi chưa xuất kho')
                                            : 'Chưa có phôi, không được phép chạy kế hoạch!'}
                                    </Text>
                                </Box>
                            }

                            {updateToStatus == OrderFinishingProcessStatus.FinishedProduction &&

                                <Field.Root invalid={quantity < Math.max(0, initialData?.requiredAmount ?? 0)} orientation="vertical">
                                    <Text>
                                        Hoàn thành kế hoạch {initialData?.code} ?
                                    </Text>
                                    <Field.Label fontSize="lg">Sản lượng</Field.Label>

                                    <NumberInput.Root
                                        size="lg"
                                        width="200px"
                                        step={100}
                                        min={0}
                                        value={String(quantity ?? 0)}
                                        onValueChange={(details) => {
                                            let value = details.valueAsNumber;

                                            if (value == null || isNaN(value) || value < 0) {
                                                value = 0;
                                            }

                                            setQuantity(value);
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

                                    <Field.HelperText color={'red'} fontWeight={'bold'}>
                                        Sản lượng không được phép nhỏ hơn số lượng yêu cầu: ({initialData?.requiredAmount})
                                    </Field.HelperText>
                                </Field.Root>
                            }
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline">Hủy</Button>
                            </Dialog.ActionTrigger>
                            <Button
                                colorPalette="red"
                                onClick={() => handleSubmit()}
                                disabled={isDisabled}
                            >
                                Xác nhận
                            </Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

export default OrderFinishingProcessDialog;