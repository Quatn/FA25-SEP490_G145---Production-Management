import React, { useEffect, useState } from "react";
import { Button, Dialog, Portal, CloseButton, Text, Flex, Table } from "@chakra-ui/react";
import FinishedTransactionHistory from "./FinishedTransactionHistory";
import { FinishedGood } from "@/types/FinishedGood";
import { dayGap, formatDate } from "@/utils/dateUtils";
import { safeGet } from "@/utils/storagesUtils";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    item?: FinishedGood | undefined;
}

const FinishedDetailDialog: React.FC<Props> = ({ isOpen, onClose, item }) => {
    const [current, setCurrent] = useState<FinishedGood | undefined>(item);

    useEffect(() => { if (isOpen) setCurrent(item); }, [isOpen, item]);

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

    const amount = (poItem as PurchaseOrderItem)?.amount ?? 0;
    const importDiff = (current?.importedQuantity ?? 0) - amount;
    const exportDiff = (current?.exportedQuantity ?? 0) - amount;

    const daysInStock = current?.currentQuantity == 0 ? 0 : dayGap(current?.createdAt);

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
                                <Table.ScrollArea
                                    borderWidth="1px"
                                    rounded="md"
                                    mt={5}
                                >
                                    <Table.Root
                                        size="lg"
                                        showColumnBorder
                                        tableLayout="auto"
                                        w="100%"
                                    >
                                        <Table.Header>
                                            <Table.Row background={'blue.100'}>
                                                <Table.ColumnHeader colSpan={4} textAlign="center">
                                                    THÔNG TIN CƠ BẢN
                                                </Table.ColumnHeader>
                                                <Table.ColumnHeader colSpan={6} textAlign="center">
                                                    THÔNG SỐ KỸ THUẬT
                                                </Table.ColumnHeader>
                                                <Table.ColumnHeader colSpan={3} textAlign="center">
                                                    SẢN LƯỢNG NHẬP
                                                </Table.ColumnHeader>
                                                <Table.ColumnHeader colSpan={2} textAlign="center">
                                                    SẢN LƯỢNG XUẤT
                                                </Table.ColumnHeader>
                                                <Table.ColumnHeader colSpan={2} textAlign="center">
                                                    SẢN LƯỢNG TỒN
                                                </Table.ColumnHeader>
                                            </Table.Row>

                                            <Table.Row>
                                                <Table.ColumnHeader rowSpan={2}>
                                                    Lệnh
                                                </Table.ColumnHeader>

                                                <Table.ColumnHeader rowSpan={2}>
                                                    Số đơn hàng
                                                </Table.ColumnHeader>

                                                <Table.ColumnHeader rowSpan={2}>
                                                    Khách hàng
                                                </Table.ColumnHeader>

                                                <Table.ColumnHeader rowSpan={2}>
                                                    Mã hàng
                                                </Table.ColumnHeader>

                                                <Table.ColumnHeader rowSpan={2}>Số lớp</Table.ColumnHeader>
                                                <Table.ColumnHeader colSpan={3} textAlign="center">
                                                    Kích thước (mm)
                                                </Table.ColumnHeader>
                                                <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Số lượng</Table.ColumnHeader>
                                                <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Ngày giao</Table.ColumnHeader>
                                                <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Tổng số lượng cần nhập</Table.ColumnHeader>
                                                <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Tổng số lượng đã nhập</Table.ColumnHeader>
                                                <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Tình trạng nhập hàng</Table.ColumnHeader>
                                                <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Tổng số lượng đã xuất</Table.ColumnHeader>
                                                <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Tình trạng xuất hàng</Table.ColumnHeader>
                                                <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Số ngày tồn kho</Table.ColumnHeader>
                                                <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Tồn kho</Table.ColumnHeader>
                                                {/* <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Điều kiện</Table.ColumnHeader> */}

                                            </Table.Row>
                                            <Table.Row background={'blue.100'}>
                                                <Table.ColumnHeader colSpan={1}>Dài</Table.ColumnHeader>
                                                <Table.ColumnHeader colSpan={1}>Rộng</Table.ColumnHeader>
                                                <Table.ColumnHeader colSpan={1}> Cao</Table.ColumnHeader>
                                            </Table.Row>
                                        </Table.Header>

                                        <Table.Body>
                                            <Table.Row>
                                                <Table.Cell>{mo?.code ?? "-"}</Table.Cell>
                                                <Table.Cell>{safeGet(poItem, "subPurchaseOrder.purchaseOrder.code")}</Table.Cell>
                                                <Table.Cell>{safeGet(poItem, "subPurchaseOrder.purchaseOrder.customer.code")}</Table.Cell>
                                                <Table.Cell>{safeGet(poItem, "ware.code")}</Table.Cell>
                                                <Table.Cell>{safeGet(poItem, "ware.fluteCombination.code")}</Table.Cell>
                                                <Table.Cell>{safeGet(poItem, "ware.wareLength")}</Table.Cell>
                                                <Table.Cell>{safeGet(poItem, "ware.wareWidth")}</Table.Cell>
                                                <Table.Cell>{safeGet(poItem, "ware.wareHeight")}</Table.Cell>

                                                <Table.Cell>{amount}</Table.Cell>

                                                <Table.Cell>
                                                    {formatDate(safeGet(poItem, "subPurchaseOrder.deliveryDate", null))}
                                                </Table.Cell>

                                                {/** San luong nhap */}
                                                <Table.Cell>{amount}</Table.Cell>
                                                <Table.Cell>{item.importedQuantity}</Table.Cell>

                                                <Table.Cell
                                                    backgroundColor={
                                                        importDiff == 0
                                                            ? "green.200"
                                                            : importDiff > 0
                                                                ? "yellow.200"
                                                                : "red.200"
                                                    }
                                                >
                                                    {renderDiffStatus('import', item.importedQuantity, amount)}
                                                </Table.Cell>

                                                {/** San luong xuat */}
                                                <Table.Cell>{item.exportedQuantity}</Table.Cell>
                                                <Table.Cell
                                                    backgroundColor={
                                                        exportDiff === 0
                                                            ? "green.200"
                                                            : exportDiff > 0
                                                                ? "yellow.200"
                                                                : (item.exportedQuantity == 0) ? "" : "red.200"
                                                    }
                                                >
                                                    {renderDiffStatus('export', item.exportedQuantity, amount)}
                                                </Table.Cell>

                                                {/** San luong ton */}
                                                <Table.Cell backgroundColor={daysInStock > 2 ? "red" : "white"}
                                                    color={daysInStock > 2 ? "white" : "black"}
                                                    fontWeight={"bold"}
                                                    textAlign={"center"}>{daysInStock}</Table.Cell>
                                                <Table.Cell>{item.currentQuantity}</Table.Cell>
                                                {/* <Table.Cell
                                                    backgroundColor={
                                                        item.currentStatus == 'SAVE' ? "" : "yellow"
                                                    }
                                                    color={item.currentStatus == 'SAVE' ? "" : "red.600"}
                                                    fontWeight={"bold"}
                                                >
                                                    {item.currentStatus == 'SAVE' ? "Lưu" : "Hủy"}
                                                </Table.Cell> */}
                                            </Table.Row>
                                        </Table.Body>
                                    </Table.Root>
                                </Table.ScrollArea>
                            </Flex>
                            <Text mt={10} mb={2} fontSize={"xl"} fontWeight={"bold"}>Lịch Sử Nhập Xuất</Text>
                            <FinishedTransactionHistory id={current?._id} poiAmount={amount} />
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
