import { useState, useEffect } from "react";
import { Box, Button, CloseButton, Dialog, Portal } from "@chakra-ui/react"
import { FluteCombination } from "@/types/FluteCombination";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: FluteCombination;
    onDelete: (data: FluteCombination) => void;
}

const FluteCombinationAlertDialog: React.FC<Props> = ({ isOpen, onClose, initialData, onDelete }) => {
    const [item, setItem] = useState<FluteCombination>({ _id: "", code: "", flutes: [], description: "", note: "", });

    const handleSubmit = () => {
        onDelete(item);
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setItem(initialData);
            }
        }
    }, [isOpen, initialData]);

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
                                Xóa loại sóng {item.code}?
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