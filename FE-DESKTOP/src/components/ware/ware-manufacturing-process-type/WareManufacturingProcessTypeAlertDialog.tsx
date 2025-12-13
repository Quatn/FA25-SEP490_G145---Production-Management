import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react"
import { WareManufacturingProcessType } from "@/types/WareManufacturingProcessType";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData: WareManufacturingProcessType | undefined;
    onDelete: (data: WareManufacturingProcessType) => Promise<boolean>;
}

const WareManufacturingProcessTypeAlertDialog: React.FC<Props> = ({ isOpen, onClose, initialData, onDelete }) => {

    const handleSubmit = async () => {
        let isSuccess = false;
        if (!!initialData) {
            isSuccess = await onDelete(initialData);
        }

        if (isSuccess) {
            onClose();
        }
    };

    return (
        <Dialog.Root role="alertdialog" open={isOpen} onOpenChange={onClose}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Xác Nhận Xóa</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <p>
                                Xóa loại gia công mã hàng {initialData?.code} - {initialData?.name}?
                            </p>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline">Hủy</Button>
                            </Dialog.ActionTrigger>
                            <Button colorPalette="red" onClick={() => handleSubmit()}>Xóa</Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}

export default WareManufacturingProcessTypeAlertDialog;