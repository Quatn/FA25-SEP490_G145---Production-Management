import { PaperSupplier } from "@/types/PaperSupplier";
import { Button, CloseButton, DataList, Dialog, Icon, Portal } from "@chakra-ui/react"
import { FaEye } from "react-icons/fa"

interface PaperSupplierDetailDialogProps {
  supplier: PaperSupplier;
}

const PaperSupplierDetailDialog: React.FC<PaperSupplierDetailDialogProps > = ({ supplier }) => {
    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <Button variant={"surface"} colorPalette={"blue"}> <Icon><FaEye /></Icon> Chi tiết</Button>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Thông Tin Nhà Giấy</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <DataList.Root orientation="horizontal" divideY="1px" maxW="md">
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Mã Nhà Giấy</DataList.ItemLabel>
                                    <DataList.ItemValue>{supplier.code}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Tên Nhà Giấy</DataList.ItemLabel>
                                    <DataList.ItemValue>{supplier.name}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Địa chỉ</DataList.ItemLabel>
                                    <DataList.ItemValue>{supplier.address}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Số điện thoại</DataList.ItemLabel>
                                    <DataList.ItemValue>{supplier.phone}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Email</DataList.ItemLabel>
                                    <DataList.ItemValue>{supplier.email}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Ngân hàng</DataList.ItemLabel>
                                    <DataList.ItemValue>{supplier.bank}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Tài khoản ngân hàng</DataList.ItemLabel>
                                    <DataList.ItemValue>{supplier.bankAccount}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Ghi chú</DataList.ItemLabel>
                                    <DataList.ItemValue>{supplier.note}</DataList.ItemValue>
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

export default PaperSupplierDetailDialog;