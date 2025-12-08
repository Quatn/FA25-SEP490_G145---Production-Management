import { FluteCombination } from "@/types/FluteCombination";
import { Button, CloseButton, DataList, Dialog, List, Portal } from "@chakra-ui/react"

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData: FluteCombination | undefined;
}

const FluteCombinationDetailDialog: React.FC<Props> = ({ isOpen, onClose, initialData }) => {

    const fluteLabel = (value: string) => {
        switch (value) {
            case 'EFlute':
                return "Sóng E";
            case 'EBLiner':
                return "Lớp giữa EB";
            case 'BFlute':
                return "Sóng B";
            case 'BACLiner':
                return "Lớp giữa BAC";
            case 'ACFlute':
                return "Sóng AC";
            case 'faceLayer':
                return "Lớp mặt";
            case 'backLayer':
                return "Lớp đáy";
            default:
                return;
        }
    }
    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Thông Tin Tổ Hợp Sóng</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <DataList.Root orientation="horizontal" divideY="1px" maxW="md">
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Mã tổ hợp sóng</DataList.ItemLabel>
                                    <DataList.ItemValue>{initialData?.code ?? '-'}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Tổ hợp sóng</DataList.ItemLabel>
                                    <DataList.ItemValue>
                                        <List.Root>
                                            {initialData?.flutes.map((item, index) => (
                                                <List.Item key={index}>
                                                    {fluteLabel(item)}
                                                </List.Item>
                                            ))}
                                        </List.Root>

                                    </DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Mô tả</DataList.ItemLabel>
                                    <DataList.ItemValue>{initialData?.description ?? '-'}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Ghi chú</DataList.ItemLabel>
                                    <DataList.ItemValue>{initialData?.note ?? '-'}</DataList.ItemValue>
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

export default FluteCombinationDetailDialog;