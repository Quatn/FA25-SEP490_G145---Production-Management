import { useState, useEffect } from "react";
import { Box, Button, CloseButton, Dialog, Portal } from "@chakra-ui/react"
import { WareManufacturingProcessType } from "@/types/WareManufacturingProcessType";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: WareManufacturingProcessType;
    onDelete: (data: WareManufacturingProcessType) => void;
}

const WareManufacturingProcessTypeAlertDialog: React.FC<Props> = ({ isOpen, onClose, initialData, onDelete }) => {
    const [item, setItem] = useState<WareManufacturingProcessType>({ _id: "", code: "", name: "", description: "", note: "", createdAt: new Date(), updatedAt: new Date() } as WareManufacturingProcessType);

    const handleSubmit = () => {
        onDelete(item);
        onClose();
    };

    useEffect(() => {
        if (isOpen) setItem(initialData ?? { _id: "", code: "", name: "", description: "", note: "", createdAt: new Date(), updatedAt: new Date() } as WareManufacturingProcessType);
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
                                Xóa loại quy trình {item.code} - {item.name}?
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