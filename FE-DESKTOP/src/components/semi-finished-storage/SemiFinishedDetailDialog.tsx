import React, { useEffect, useState } from "react";
import { Button, Dialog, Portal, DataList, CloseButton, Text } from "@chakra-ui/react";
import { SemiFinishedGood } from "@/types/SemiFinishedGood";
import SemiFinishedTransactionHistory from "./SemiFinishedTransactionHistory";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    item?: SemiFinishedGood | undefined;
}

const SemiFinishedDetailDialog: React.FC<Props> = ({ isOpen, onClose, item }) => {
    const [current, setCurrent] = useState<SemiFinishedGood | undefined>(item);

    useEffect(() => { if (isOpen) setCurrent(item); }, [isOpen, item]);

    if (!item) return null;

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose} size={"cover"}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title fontSize={"xl"} fontWeight={"bold"}>Chi tiết bán thành phẩm</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <DataList.Root orientation="horizontal" divideY="1px" maxW="md">
                                <DataList.Item pt="4" fontSize={"lg"}><DataList.ItemLabel>Mã lệnh</DataList.ItemLabel><DataList.ItemValue fontSize={"lg"}>{current?.manufacturingOrder?.code}</DataList.ItemValue></DataList.Item>
                                <DataList.Item pt="4" fontSize={"lg"}><DataList.ItemLabel>Số lượng</DataList.ItemLabel><DataList.ItemValue fontSize={"lg"}>{current?.currentQuantity}</DataList.ItemValue></DataList.Item>
                                <DataList.Item pt="4" fontSize={"lg"}><DataList.ItemLabel>Ghi chú</DataList.ItemLabel><DataList.ItemValue fontSize={"lg"}>{current?.note}</DataList.ItemValue></DataList.Item>
                            </DataList.Root>
                            <Text mt={10} mb={2} fontSize={"xl"} fontWeight={"bold"}>Lịch Sử Nhập Xuất</Text>
                            <SemiFinishedTransactionHistory id={current?._id} />
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button colorPalette="red">Thoát</Button>
                            </Dialog.ActionTrigger>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}

export default SemiFinishedDetailDialog;
