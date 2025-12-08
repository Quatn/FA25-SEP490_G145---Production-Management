import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react"
import { FluteCombination } from "@/types/FluteCombination";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData: FluteCombination | undefined;
    onDelete: (data: FluteCombination) => void;
}

const FluteCombinationAlertDialog: React.FC<Props> = ({ isOpen, onClose, initialData, onDelete }) => {

    const handleSubmit = () => {
        if(initialData) onDelete(initialData);
        onClose();
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
                                Xóa tổ hợp sóng {initialData?.code ?? '-'}?
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

export default FluteCombinationAlertDialog;