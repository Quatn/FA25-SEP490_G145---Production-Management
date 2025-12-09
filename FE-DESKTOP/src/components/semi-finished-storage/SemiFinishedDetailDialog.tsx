import React, { useEffect, useState } from "react";
import { Button, Dialog, Portal, CloseButton, Text, Table } from "@chakra-ui/react";
import { SemiFinishedGood } from "@/types/SemiFinishedGood";
import SemiFinishedTransactionHistory from "./SemiFinishedTransactionHistory";
import { formatDate, hourGap } from "@/utils/dateUtils";
import { safeGet } from "@/utils/storagesUtils";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    item?: SemiFinishedGood | undefined;
}

const SemiFinishedDetailDialog: React.FC<Props> = ({ isOpen, onClose, item }) => {
    const [current, setCurrent] = useState<SemiFinishedGood | undefined>(item);

    const renderDiffStatus = (transactionType: string, value: number, amount: number) => {
        const diff = value - amount;

        if (diff === 0)
            return <> {transactionType == 'import' ? 'Nhập' : 'Xuất'} đủ</>;

        if (diff > 0)
            return <>{transactionType == 'import' ? 'Nhập' : 'Xuất'} thừa {diff}</>;

        if (transactionType == 'export' && value == 0) return <> Chưa xuất kho</>;

        return <>{transactionType == 'import' ? 'Nhập' : 'Xuất'} thiếu {Math.abs(diff)}</>;
    };

    useEffect(() => { if (isOpen) setCurrent(item); }, [isOpen, item]);

    const mo = current?.manufacturingOrder;
    const poItem = mo?.purchaseOrderItem;

    const amount = (poItem as PurchaseOrderItem)?.amount ?? 0;
    const importDiff = (current?.importedQuantity ?? 0) - amount;
    const hoursInStock = current?.currentQuantity == 0 ? 0 : hourGap(current?.createdAt);

    if (!item) return null;

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose} size={"cover"} scrollBehavior="inside">
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title fontSize={"xl"} fontWeight={"bold"}>Chi tiết phôi</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Table.ScrollArea
                                borderWidth="1px"
                                rounded="md"
                                mt={5}
                            >
                                <Table.Root
                                    size="lg"
                                    stickyHeader
                                    interactive
                                    showColumnBorder
                                    colorPalette="orange"
                                    tableLayout="auto"
                                    w="100%"
                                    border={"1px solid black"}
                                    css={{
                                        "& td, & th": {
                                            border: "1px solid black"
                                        },
                                    }}>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.ColumnHeader rowSpan={2} w="1%" textAlign="center">
                                                Ngày SX
                                            </Table.ColumnHeader>

                                            <Table.ColumnHeader rowSpan={2}>
                                                Lệnh SX
                                            </Table.ColumnHeader>

                                            <Table.ColumnHeader textAlign={'center'} colSpan={2}>
                                                Thông tin sản xuất
                                            </Table.ColumnHeader>

                                            <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Lớp sóng</Table.ColumnHeader>
                                            <Table.ColumnHeader colSpan={3} textAlign="center">
                                                Kích thước sản phẩm
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Số lượng</Table.ColumnHeader>
                                            <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Tổng số lượng đã nhập</Table.ColumnHeader>
                                            <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Cảnh báo thừa thiếu</Table.ColumnHeader>
                                            <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Xuất phôi</Table.ColumnHeader>
                                            <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Tổng xuất</Table.ColumnHeader>
                                            <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Tồn kho</Table.ColumnHeader>
                                            <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Số giờ tồn kho</Table.ColumnHeader>
                                            <Table.ColumnHeader rowSpan={2}>Ghi chú</Table.ColumnHeader>

                                        </Table.Row>
                                        <Table.Row >
                                            <Table.ColumnHeader colSpan={1}>Khách hàng</Table.ColumnHeader>
                                            <Table.ColumnHeader colSpan={1}>Mã hàng</Table.ColumnHeader>
                                            <Table.ColumnHeader colSpan={1}>Dài</Table.ColumnHeader>
                                            <Table.ColumnHeader colSpan={1}>Rộng</Table.ColumnHeader>
                                            <Table.ColumnHeader colSpan={1}> Cao</Table.ColumnHeader>
                                        </Table.Row>
                                    </Table.Header>

                                    <Table.Body>
                                        <Table.Row>
                                            <Table.Cell>{formatDate(mo?.manufacturingDate)}</Table.Cell>
                                            <Table.Cell>
                                                {mo?.code ?? "-"}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {safeGet(poItem, "subPurchaseOrder.purchaseOrder.customer.code")}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {safeGet(poItem, "ware.code")}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {safeGet(poItem, "ware.fluteCombination.code")}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {safeGet(poItem, "ware.wareLength")}
                                            </Table.Cell>
                                            <Table.Cell>

                                                {safeGet(poItem, "ware.wareWidth")}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {safeGet(poItem, "ware.wareHeight")}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {amount}
                                            </Table.Cell>
                                            <Table.Cell>{item.importedQuantity}</Table.Cell>
                                            <Table.Cell
                                                backgroundColor={
                                                    importDiff === 0
                                                        ? "green.200"
                                                        : importDiff > 0
                                                            ? "yellow.200"
                                                            : "red.200"
                                                }
                                            >
                                                {renderDiffStatus('import', item.importedQuantity, amount)}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {item.exportedTo}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {item.exportedQuantity}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {item.currentQuantity}
                                            </Table.Cell>
                                            <Table.Cell backgroundColor={hoursInStock > 48 ? "red" : "white"}
                                                color={hoursInStock > 48 ? "white" : "black"}
                                                fontWeight={"bold"}
                                                textAlign={"center"}>
                                                {hoursInStock}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {item.note}
                                            </Table.Cell>

                                        </Table.Row>
                                    </Table.Body>
                                </Table.Root>
                            </Table.ScrollArea>
                            <Text mt={10} mb={2} fontSize={"xl"} fontWeight={"bold"}>Lịch Sử Nhập Xuất</Text>
                            <SemiFinishedTransactionHistory
                                id={current?._id}
                                poiAmount={amount} />
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
