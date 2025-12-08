import { PaperColor } from "@/types/PaperColor";
import { Button, CloseButton, DataList, Dialog, Portal } from "@chakra-ui/react"

interface PaperColorDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: PaperColor | undefined;
}

const PaperColorDetailDialog: React.FC<PaperColorDetailDialogProps> = ({ isOpen, onClose, initialData }) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Thông Tin Màu Giấy</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <DataList.Root orientation="horizontal" divideY="1px" maxW="md">
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Mã Màu Giấy</DataList.ItemLabel>
                                    <DataList.ItemValue>{initialData?.code ?? '-'}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Tiêu Đề Màu Giấy</DataList.ItemLabel>
                                    <DataList.ItemValue>{initialData?.title ?? '-'}</DataList.ItemValue>
                                </DataList.Item>
                            </DataList.Root>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild >
                                <Button colorPalette={"red"}>Thoát</Button>
                            </Dialog.ActionTrigger>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default PaperColorDetailDialog;