import React from "react";
import { Table } from "@chakra-ui/react";
import { formatDate } from "@/utils/dateUtils";
import { safeGet } from "@/utils/storagesUtils";
import { SemiFinishedGoodTransaction } from "@/types/SemiFinishedTransaction";
import { Employee } from "@/types/Employee";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";

interface Props {
    page: number;
    limit: number;
    items: SemiFinishedGoodTransaction[];
}

const SemiFinishedInventoryAuditTable: React.FC<Props> = ({ page, limit, items }) => {

    return (
        <Table.ScrollArea borderWidth="1px" rounded="md" mt={5}>
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
                    <Table.Row background={'blue.100'}>
                        <Table.ColumnHeader rowSpan={2} w="1%" textAlign="center">
                            STT
                        </Table.ColumnHeader>

                        <Table.ColumnHeader rowSpan={2} w="1%" textAlign="center">
                            Ngày kiểm kê
                        </Table.ColumnHeader>

                        <Table.ColumnHeader rowSpan={2}>
                            Lệnh SX
                        </Table.ColumnHeader>

                        <Table.ColumnHeader textAlign={'center'} colSpan={3}>
                            Thông tin sản xuất
                        </Table.ColumnHeader>

                        <Table.ColumnHeader rowSpan={2}>
                            Tồn kho
                        </Table.ColumnHeader>

                        <Table.ColumnHeader rowSpan={2}>
                            Thực kiểm
                        </Table.ColumnHeader>

                        <Table.ColumnHeader rowSpan={2}>
                            Chênh lệch
                        </Table.ColumnHeader>

                        <Table.ColumnHeader rowSpan={2}>
                            Người phụ trách
                        </Table.ColumnHeader>

                        <Table.ColumnHeader rowSpan={2}>
                            Ghi chú
                        </Table.ColumnHeader>
                        

                    </Table.Row>
                    <Table.Row background={'blue.100'}>
                        <Table.ColumnHeader colSpan={1}>Khách hàng</Table.ColumnHeader>
                        <Table.ColumnHeader colSpan={1}>Mã đơn hàng</Table.ColumnHeader>
                        <Table.ColumnHeader colSpan={1}>Mã hàng</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {items.map((item, index) => {
                        const mo = item.semiFinishedGood?.manufacturingOrder as ManufacturingOrder;
                        const poItem = mo?.purchaseOrderItem;
                        const quantityGap = item.finalQuantity - item.initialQuantity;
                        return (
                            <Table.Row key={item._id ?? index}>
                                <Table.Cell textAlign="center">
                                    {(page - 1) * limit + index + 1}
                                </Table.Cell>
                                <Table.Cell>
                                    {formatDate(item.transactionDate)}
                                </Table.Cell>
                                <Table.Cell>
                                    {mo?.code ?? "-"}
                                </Table.Cell>
                                <Table.Cell>
                                    {safeGet(poItem, "subPurchaseOrder.purchaseOrder.customer.code")}
                                </Table.Cell>
                                <Table.Cell>
                                    {safeGet(poItem, "subPurchaseOrder.purchaseOrder.code")}
                                </Table.Cell>
                                <Table.Cell>
                                    {safeGet(poItem, "ware.code")}
                                </Table.Cell>

                                <Table.Cell>
                                    {item.initialQuantity}
                                </Table.Cell>

                                <Table.Cell>
                                    {item.finalQuantity}
                                </Table.Cell>

                                <Table.Cell 
                                background={quantityGap < 0 ? 'red' : 'yellow'}
                                color={quantityGap >= 0 ? 'black' : 'white'}
                                fontWeight={'bold'}
                                >
                                    {` ${quantityGap < 0 ? 'Thiếu' : 'Thừa'} ${Math.abs(quantityGap)}`}
                                </Table.Cell>

                                <Table.Cell>
                                    {(item.employee as Employee).code}
                                </Table.Cell>

                                <Table.Cell overflow={'auto'} maxW="300px">
                                    {item.note}
                                </Table.Cell>

                            </Table.Row>
                        )
                    }
                    )}
                </Table.Body>
            </Table.Root>
        </Table.ScrollArea>
    );
};

export default SemiFinishedInventoryAuditTable;
