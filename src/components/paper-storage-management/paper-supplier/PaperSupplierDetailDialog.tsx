import { PaperSupplier } from "@/types/PaperSupplier";
import { Button, CloseButton, DataList, Dialog, Icon, Portal } from "@chakra-ui/react"
import { FaEye } from "react-icons/fa"


const PaperSupplierDetailDialog: React.FC<PaperSupplier> = ({ code, name }) => {
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
                            <Dialog.Title>Thông tin nhà giấy</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <DataList.Root orientation="horizontal" divideY="1px" maxW="md">
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Mã Nhà Giấy</DataList.ItemLabel>
                                    <DataList.ItemValue>{code}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Tên Nhà Giấy</DataList.ItemLabel>
                                    <DataList.ItemValue>{name}</DataList.ItemValue>
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