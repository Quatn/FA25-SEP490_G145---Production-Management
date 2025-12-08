import { FluteCombination } from "@/types/FluteCombination";
import { Button, CloseButton, DataList, Dialog, Icon, List, Portal } from "@chakra-ui/react"
import { useEffect, useState } from "react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: FluteCombination;
}

const FluteCombinationDetailDialog: React.FC<Props> = ({ isOpen, onClose, initialData }) => {
    const [item, setItem] = useState<FluteCombination>({ _id: "", code: "", flutes: [], description: "", note: "", });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setItem(initialData);
            }
        }
    }, [isOpen, initialData]);

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
                                    <DataList.ItemLabel>Mã</DataList.ItemLabel>
                                    <DataList.ItemValue>{item.code}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item pt="4">
                                    <DataList.ItemLabel>Tổ hợp sóng</DataList.ItemLabel>
                                    <DataList.ItemValue>
                                        <List.Root>
                                            {item.flutes.map((item, index) => (
                                                <List.Item key={index}>
                                                    {fluteLabel(item)}
                                                </List.Item>
                                            ))}
                                        </List.Root>

                                    </DataList.ItemValue>
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

export default FluteCombinationDetailDialog;