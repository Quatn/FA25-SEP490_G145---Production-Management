import { WareManufacturingProcessType } from "@/types/WareManufacturingProcessType";
import { Button, CloseButton, DataList, Dialog, Icon, Portal } from "@chakra-ui/react"
import { FaEye } from "react-icons/fa"

interface Props {
    item: WareManufacturingProcessType;
}

const WareManufacturingProcessTypeDetailDialog: React.FC<Props> = ({ item }) => {
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
                            <Dialog.Title>Thông Tin Loại Quy Trình</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <DataList.Root orientation="horizontal" divideY="1px" maxW="md">
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Mã</DataList.ItemLabel>
                                    <DataList.ItemValue>{item.code}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Tên</DataList.ItemLabel>
                                    <DataList.ItemValue>{item.name}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Mô tả</DataList.ItemLabel>
                                    <DataList.ItemValue>{item.description}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Ghi chú</DataList.ItemLabel>
                                    <DataList.ItemValue>{item.note}</DataList.ItemValue>
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