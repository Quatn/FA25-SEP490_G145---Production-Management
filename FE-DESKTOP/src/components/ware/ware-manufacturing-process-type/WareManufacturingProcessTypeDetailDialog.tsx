import { WareManufacturingProcessType } from "@/types/WareManufacturingProcessType";
import { Button, CloseButton, DataList, Dialog, Portal } from "@chakra-ui/react"

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData: WareManufacturingProcessType | undefined;
}

const WareManufacturingProcessTypeDetailDialog: React.FC<Props> = ({ initialData, isOpen, onClose }) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Thông Tin Loại Gia Công Mã Hàng</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <DataList.Root orientation="horizontal" divideY="1px" maxW="md">
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Mã loại gia công mã hàng</DataList.ItemLabel>
                                    <DataList.ItemValue>{initialData?.code}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Tên loại gia công mã hàng</DataList.ItemLabel>
                                    <DataList.ItemValue>{initialData?.name}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Mô tả</DataList.ItemLabel>
                                    <DataList.ItemValue>{initialData?.description}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Ghi chú</DataList.ItemLabel>
                                    <DataList.ItemValue>{initialData?.note}</DataList.ItemValue>
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

export default WareManufacturingProcessTypeDetailDialog;