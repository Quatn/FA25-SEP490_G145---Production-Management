import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react"
import { PaperType } from "@/types/PaperType";
import { PaperColor } from "@/types/PaperColor";

interface PaperTypeAlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: PaperType | undefined;
    onDelete: (data: PaperType) => Promise<boolean>;
}

const PaperTypeAlertDialog: React.FC<PaperTypeAlertDialogProps> = ({
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
                            <Dialog.Title>Xác Nhận Xóa Loại Giấy</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <p>
                                Xóa Loại Giấy {(initialData?.paperColor as PaperColor)?.code}/{initialData?.width}/{initialData?.grammage}?
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

export default PaperTypeAlertDialog;