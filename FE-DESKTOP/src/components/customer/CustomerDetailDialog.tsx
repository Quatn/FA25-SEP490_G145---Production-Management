import { Customer } from "@/types/Customer";
import { Button, CloseButton, DataList, Dialog, Portal } from "@chakra-ui/react"

interface CustomerDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: Customer | undefined;
}

const CustomerDetailDialog: React.FC<CustomerDetailDialogProps> = ({ isOpen, onClose, initialData }) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Thông Tin Khách Hàng</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <DataList.Root orientation="horizontal" divideY="1px" maxW="md">
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Mã Khách Hàng</DataList.ItemLabel>
                                    <DataList.ItemValue>{initialData?.code}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Tên Khách Hàng</DataList.ItemLabel>
                                    <DataList.ItemValue>{initialData?.name}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Địa chỉ</DataList.ItemLabel>
                                    <DataList.ItemValue>{initialData?.address}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Số điện thoại</DataList.ItemLabel>
                                    <DataList.ItemValue>{initialData?.contactNumber}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Email</DataList.ItemLabel>
                                    <DataList.ItemValue>{initialData?.email}</DataList.ItemValue>
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

export default CustomerDetailDialog;