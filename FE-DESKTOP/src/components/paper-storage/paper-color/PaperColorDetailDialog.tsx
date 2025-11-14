import { PaperColor } from "@/types/PaperColor";
import { Button, CloseButton, DataList, Dialog, Icon, Portal } from "@chakra-ui/react"
import { FaEye } from "react-icons/fa"

interface PaperColorDetailDialogProps {
    color: PaperColor;
}

const PaperColorDetailDialog: React.FC<PaperColorDetailDialogProps> = ({ color }) => {
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
                            <Dialog.Title>Thông Tin Màu Giấy</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <DataList.Root orientation="horizontal" divideY="1px" maxW="md">
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Mã Màu Giấy</DataList.ItemLabel>
                                    <DataList.ItemValue>{color.code}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Tiêu Đề Màu Giấy</DataList.ItemLabel>
                                    <DataList.ItemValue>{color.title}</DataList.ItemValue>
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