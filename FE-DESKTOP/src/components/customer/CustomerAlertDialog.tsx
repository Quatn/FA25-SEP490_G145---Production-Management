import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react"
import { Customer } from "@/types/Customer";

interface CustomerAlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: Customer | undefined;
    onDelete: (data: Customer) => Promise<boolean>;
}

const CustomerAlertDialog: React.FC<CustomerAlertDialogProps> = ({
    isOpen,
    onClose,
    initialData,
    onDelete,
}) => {

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
                            <Dialog.Title>Xác Nhận Xóa Khách Hàng</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <p>
                                Xóa khách hàng {initialData?.code}?
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
};

export default CustomerAlertDialog;