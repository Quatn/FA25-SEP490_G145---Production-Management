import { useState, useEffect } from "react";
import { Box, Button, CloseButton, Dialog, Field, Flex, Input, Portal } from "@chakra-ui/react"
import { PaperType } from "@/types/PaperType";

interface PaperTypeAlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: PaperType;
    onDelete: (data: PaperType) => void;
}

const PaperTypeAlertDialog: React.FC<PaperTypeAlertDialogProps> = ({
    isOpen,
    onClose,
    initialData,
    onDelete,
}) => {

    const [type, setType] = useState<PaperType>({
        paperColor: { _id: '' , code: '', title: '' },
        width: 0,
        grammage: 0,
    });

    const handleSubmit = () => {
        onDelete(type);
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            setType(initialData ?? {
                paperColor: { _id:'' , code: '', title: '' },
                width: 0,
                grammage: 0,
            });
        }
    }, [isOpen, initialData]);

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
                                Xóa Loại Giấy {type.paperColor?.code}/{type.width}/{type.grammage}?
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