import { PaperType } from "@/types/PaperType";
import { Button, CloseButton, DataList, Dialog, Icon, Portal } from "@chakra-ui/react"
import { FaEye } from "react-icons/fa"

interface PaperTypeDetailDialogProps {
    type: PaperType;
}

const PaperTypeDetailDialog: React.FC<PaperTypeDetailDialogProps> = ({ type: type }) => {
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
                            <Dialog.Title>Thông Tin Loại Giấy</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <DataList.Root orientation="horizontal" divideY="1px" maxW="md">
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Mã Loại Giấy</DataList.ItemLabel>
                                    <DataList.ItemValue>{type.paperColor?.code}/{type.width}/{type.grammage}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Màu Giấy</DataList.ItemLabel>
                                    <DataList.ItemValue>{type.paperColor?.title}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Khổ Giấy</DataList.ItemLabel>
                                    <DataList.ItemValue>{type.width}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Định lượng</DataList.ItemLabel>
                                    <DataList.ItemValue>{type.grammage}</DataList.ItemValue>
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