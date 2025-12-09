import { PaperColor } from "@/types/PaperColor";
import { PaperType } from "@/types/PaperType";
import { Button, CloseButton, DataList, Dialog, Portal } from "@chakra-ui/react"

interface PaperTypeDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: PaperType | undefined;
}

const PaperTypeDetailDialog: React.FC<PaperTypeDetailDialogProps> = ({ isOpen, onClose, initialData }) => {
    const paperColor: PaperColor = initialData?.paperColor as PaperColor;
    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Thông Tin Loại Giấy</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <DataList.Root orientation="horizontal" divideY="1px" maxW="md">
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Mã Loại Giấy</DataList.ItemLabel>
                                    <DataList.ItemValue>{paperColor?.code}/{initialData?.width}/{initialData?.grammage}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Màu Giấy</DataList.ItemLabel>
                                    <DataList.ItemValue>{paperColor?.title}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Khổ Giấy</DataList.ItemLabel>
                                    <DataList.ItemValue>{initialData?.width}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Định Lượng</DataList.ItemLabel>
                                    <DataList.ItemValue>{initialData?.grammage}</DataList.ItemValue>
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

export default PaperTypeDetailDialog;