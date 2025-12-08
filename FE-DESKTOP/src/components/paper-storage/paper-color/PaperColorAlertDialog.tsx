import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react"
import { PaperColor } from "@/types/PaperColor";

interface PaperColorAlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: PaperColor | undefined;
    onDelete: (data: PaperColor) => void;
}

const PaperColorAlertDialog: React.FC<PaperColorAlertDialogProps> = ({
    isOpen,
    onClose,
    initialData,
    onDelete,
}) => {

    const handleSubmit = () => {
        if (initialData) onDelete(initialData);
        onClose();
    };

    return (
        <Dialog.Root role="alertdialog" open={isOpen} onOpenChange={onClose}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Xác Nhận Xóa Màu Giấy</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <p>
                                Xóa Màu Giấy {initialData?.code ?? '-'} - {initialData?.title ?? '-'}?
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

export default PaperColorAlertDialog;