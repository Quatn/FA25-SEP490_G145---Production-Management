import React, { useEffect, useState } from "react";
import { Button, Dialog, Portal, DataList, CloseButton, Text, Flex } from "@chakra-ui/react";

import FinishedTransactionHistory from "./FinishedTransactionHistory";
import { FinishedGood } from "@/types/FinishedGood";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    item?: FinishedGood | undefined;
}

const FinishedDetailDialog: React.FC<Props> = ({ isOpen, onClose, item }) => {
    const [current, setCurrent] = useState<FinishedGood | undefined>(item);

    useEffect(() => { if (isOpen) setCurrent(item); }, [isOpen, item]);

    function formatDate(value?: string | Date | number | null, locale = "vi-VN"): string {
        if (value === undefined || value === null || value === "") return "";
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        return date.toLocaleDateString(locale);
    }

    const get = (obj: any, path: string, fallback: any = "-") => {
        return path.split(".").reduce((o, k) => (o?.[k]), obj) ?? fallback;
    };

    const renderDiffStatus = (transactionType: string, value: number, amount: number) => {
        const diff = value - amount;

        if (diff === 0)
            return <> {transactionType == 'import' ? 'Nhập' : 'Xuất'} đủ</>;

        if (diff > 0)
            return <>{transactionType == 'import' ? 'Nhập' : 'Xuất'} thừa {diff}</>;

        if (transactionType == 'export' && value == 0) return <> Chưa xuất kho</>;

        return <>{transactionType == 'import' ? 'Nhập' : 'Xuất'} thiếu {Math.abs(diff)}</>;
    };

    const mo = current?.manufacturingOrder;
    const poItem = mo?.purchaseOrderItem;

    const amount = poItem?.amount ?? 0;
    const importDiff = current?.importedQuantity ?? 0 - amount;
    const exportDiff = current?.exportedQuantity ?? 0 - amount;

    if (!item) return null;

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose} size={"cover"} scrollBehavior="inside">
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title fontSize={"xl"} fontWeight={"bold"}>Chi tiết nhập xuất thành phẩm</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Flex direction={"row"} gap={5} justifyContent={"space-between"}>
                                <DataList.Root orientation="horizontal" divideY="1px" maxW="md">
                                    <Text fontSize={"lg"} fontWeight={"bold"}>Thông tin cơ bản</Text>
                                    <DataList.Item pt="4" fontSize={"lg"}>
                                        <DataList.ItemLabel>
                                            Lệnh
                                        </DataList.ItemLabel>
                                        <DataList.ItemValue fontSize={"lg"}>
                                            {mo?.code ?? "-"}
                                        </DataList.ItemValue>
                                    </DataList.Item>
                                    <DataList.Item pt="4" fontSize={"lg"}>
                                        <DataList.ItemLabel>
                                            Số đơn hàng
                                        </DataList.ItemLabel>
                                        <DataList.ItemValue fontSize={"lg"}>
                                            {get(poItem, "subPurchaseOrder.purchaseOrder.code")}
                                        </DataList.ItemValue>
                                    </DataList.Item>
                                    <DataList.Item pt="4" fontSize={"lg"}>
                                        <DataList.ItemLabel>
                                            Khách hàng
                                        </DataList.ItemLabel>
                                        <DataList.ItemValue fontSize={"lg"}>
                                            {get(poItem, "subPurchaseOrder.purchaseOrder.customer.code")}
                                        </DataList.ItemValue>
                                    </DataList.Item>
                                    <DataList.Item pt="4" fontSize={"lg"}>
                                        <DataList.ItemLabel>
                                            Mã hàng
                                        </DataList.ItemLabel>
                                        <DataList.ItemValue fontSize={"lg"}>
                                            {get(poItem, "ware.code")}
                                        </DataList.ItemValue>
                                    </DataList.Item>
                                </DataList.Root>

                                <DataList.Root orientation="horizontal" divideY="1px" maxW="md">
                                    <Text fontSize={"lg"} fontWeight={"bold"}>Thông số kỹ thuật</Text>
                                    <DataList.Item pt="4" fontSize={"lg"}>
                                        <DataList.ItemLabel>
                                            Số lớp
                                        </DataList.ItemLabel>
                                        <DataList.ItemValue fontSize={"lg"}>
                                            {get(poItem, "ware.fluteCombination.code")}
                                        </DataList.ItemValue>
                                    </DataList.Item>
                                    <DataList.Item pt="4" fontSize={"lg"}>
                                        <DataList.ItemLabel>
                                            Kích thước
                                        </DataList.ItemLabel>
                                        <DataList.ItemValue fontSize={"lg"}>
                                            {`${get(poItem, "ware.wareLength")}x${get(poItem, "ware.wareWidth")}x${get(poItem, "ware.wareHeight")}`}
                                        </DataList.ItemValue>
                                    </DataList.Item>
                                    <DataList.Item pt="4" fontSize={"lg"}>
                                        <DataList.ItemLabel>
                                            Số lượng
                                        </DataList.ItemLabel>
                                        <DataList.ItemValue fontSize={"lg"}>
                                            {amount}
                                        </DataList.ItemValue>
                                    </DataList.Item>
                                    <DataList.Item pt="4" fontSize={"lg"}>
                                        <DataList.ItemLabel>
                                            Ngày giao
                                        </DataList.ItemLabel>
                                        <DataList.ItemValue fontSize={"lg"}>
                                            {formatDate(get(poItem, "subPurchaseOrder.deliveryDate", null))}
                                        </DataList.ItemValue>
                                    </DataList.Item>
                                </DataList.Root>

                                <DataList.Root orientation="horizontal" divideY="1px" maxW="md">
                                    <Text fontSize={"lg"} fontWeight={"bold"}>Sản lượng nhập</Text>
                                    <DataList.Item pt="4" fontSize={"lg"}>
                                        <DataList.ItemLabel>
                                            Tổng số lượng cần nhập
                                        </DataList.ItemLabel>
                                        <DataList.ItemValue fontSize={"lg"}>
                                            {amount}
                                        </DataList.ItemValue>
                                    </DataList.Item>
                                    <DataList.Item pt="4" fontSize={"lg"}>
                                        <DataList.ItemLabel>
                                            Tổng số lượng đã nhập
                                        </DataList.ItemLabel>
                                        <DataList.ItemValue fontSize={"lg"}>
                                            {current?.importedQuantity}
                                        </DataList.ItemValue>
                                    </DataList.Item>
                                    <DataList.Item pt="4" fontSize={"lg"}>
                                        <DataList.ItemLabel>
                                            Tình trạng nhập hàng
                                        </DataList.ItemLabel>
                                        <DataList.ItemValue
                                            fontSize={"lg"}>
                                            {renderDiffStatus('import', current?.importedQuantity ?? 0, amount)}
                                        </DataList.ItemValue>
                                    </DataList.Item>
                                </DataList.Root>

                                <DataList.Root orientation="horizontal" divideY="1px" maxW="md">
                                    <Text fontSize={"lg"} fontWeight={"bold"}>Sản lượng xuất</Text>
                                    <DataList.Item pt="4" fontSize={"lg"}>
                                        <DataList.ItemLabel>
                                            Tổng số lượng đã nhập
                                        </DataList.ItemLabel>
                                        <DataList.ItemValue fontSize={"lg"}>
                                            {current?.exportedQuantity}
                                        </DataList.ItemValue>
                                    </DataList.Item>
                                    <DataList.Item pt="4" fontSize={"lg"}>
                                        <DataList.ItemLabel>
                                            Tồn kho
                                        </DataList.ItemLabel>
                                        <DataList.ItemValue fontSize={"lg"}>
                                            {current?.currentQuantity}
                                        </DataList.ItemValue>
                                    </DataList.Item>
                                    <DataList.Item pt="4" fontSize={"lg"}>
                                        <DataList.ItemLabel>
                                            Tình trạng xuất hàng
                                        </DataList.ItemLabel>
                                        <DataList.ItemValue
                                            fontSize={"lg"}>
                                            {renderDiffStatus('export', current?.exportedQuantity ?? 0, amount)}
                                        </DataList.ItemValue>
                                    </DataList.Item>
                                </DataList.Root>
                            </Flex>
                            <Text mt={10} mb={2} fontSize={"xl"} fontWeight={"bold"}>Lịch Sử Nhập Xuất</Text>
                            <FinishedTransactionHistory id={current?._id} />
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

export default FinishedDetailDialog;
