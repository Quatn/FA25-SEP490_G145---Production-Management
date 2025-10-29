import { useState, useEffect } from "react";
import { Box, Button, CloseButton, Dialog, Field, Flex, Input, Portal } from "@chakra-ui/react"
import { PaperSupplier } from "@/types/PaperSupplier";

interface PaperSupplierAlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: PaperSupplier;
    onDelete: (data: PaperSupplier) => void;
}

const PaperSupplierAlertDialog: React.FC<PaperSupplierAlertDialogProps> = ({
    isOpen,
    onClose,
    initialData,
    onDelete,
}) => {

    const [supplier, setSupplier] = useState<PaperSupplier>({
        code: "",
        name: "",
    });

    const handleSubmit = () => {
        onDelete(supplier);
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            setSupplier(initialData ?? { code: "", name: "" });
        }
    }, [isOpen, initialData]);

    return (
        <Dialog.Root role="alertdialog" open={isOpen} onOpenChange={onClose}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Xác nhận xóa nhà giấy</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <p>
                                Xóa nhà giấy {supplier.code} - {supplier.name}?
                            </p>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline">Cancel</Button>
                            </Dialog.ActionTrigger>
                            <Button colorPalette="red" onClick={() => handleSubmit()}>Delete</Button>
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

export default PaperSupplierAlertDialog;