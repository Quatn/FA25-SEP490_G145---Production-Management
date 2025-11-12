import { useState, useEffect } from "react";
import { Box, Button, CloseButton, Dialog, Portal } from "@chakra-ui/react"
import { WareFinishingProcessType } from "@/types/WareFinishingProcessType";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: WareFinishingProcessType;
    onDelete: (data: WareFinishingProcessType) => void;
}

const WareFinishingProcessTypeAlertDialog: React.FC<Props> = ({ isOpen, onClose, initialData, onDelete }) => {
    const [item, setItem] = useState<WareFinishingProcessType>({ _id: "", code: "", name: "", description: "", note: "", createdAt: new Date(), updatedAt: new Date() } as WareFinishingProcessType);

    const handleSubmit = () => {
        onDelete(item);
        onClose();
    };

    useEffect(() => {
        if (isOpen) setItem(initialData ?? { _id: "", code: "", name: "", description: "", note: "", createdAt: new Date(), updatedAt: new Date() } as WareFinishingProcessType);
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
                                Xóa loại hoàn thiện {item.code} - {item.name}?
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

export default WareFinishingProcessTypeAlertDialog;
