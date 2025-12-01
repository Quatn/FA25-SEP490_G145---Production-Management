import React from "react";
import { Table, Group, Button, Icon, Highlight } from "@chakra-ui/react";
import { FaEye, FaMinus, FaPlus } from "react-icons/fa";
import { SemiFinishedGood } from "@/types/SemiFinishedGood";
import { formatDate, hourGap } from "@/utils/dateUtils";
import { safeGet } from "@/utils/storagesUtils";

interface Props {
    page: number;
    limit: number;
    items: SemiFinishedGood[];
    onView: (item: SemiFinishedGood) => void;
    onTransaction: (type: "IMPORT" | "EXPORT", item: SemiFinishedGood) => void;
    search: string;
}

const SemiFinishedTable: React.FC<Props> = ({ page, limit, items, onView, onTransaction, search }) => {

    const renderDiffStatus = (transactionType: string, value: number, amount: number) => {
        const diff = value - amount;

        if (diff === 0)
            return <> {transactionType == 'import' ? 'Nhập' : 'Xuất'} đủ</>;

        if (diff > 0)
            return <>{transactionType == 'import' ? 'Nhập' : 'Xuất'} thừa {diff}</>;

        if (transactionType == 'export' && value == 0) return <> Chưa xuất kho</>;

        return <>{transactionType == 'import' ? 'Nhập' : 'Xuất'} thiếu {Math.abs(diff)}</>;
    };
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
                    <Table.Row>
                        <Table.ColumnHeader rowSpan={2} w="1%" textAlign="center">
                            STT
                        </Table.ColumnHeader>

                        <Table.ColumnHeader rowSpan={2} w="1%" textAlign="center">
                            Ngày SX
                        </Table.ColumnHeader>

                        <Table.ColumnHeader rowSpan={2}>
                            Lệnh SX
                        </Table.ColumnHeader>

                        <Table.ColumnHeader textAlign={'center'} colSpan={2}>
                            Thông tin sản xuất
                        </Table.ColumnHeader>

                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>
                            Lớp sóng
                        </Table.ColumnHeader>
                        <Table.ColumnHeader colSpan={3} textAlign="center">
                            Kích thước sản phẩm
                        </Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>
                            Số lượng
                        </Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>
                            Tổng số lượng đã nhập
                        </Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>
                            Cảnh báo thừa thiếu
                        </Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>
                            Xuất phôi
                        </Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>
                            Tổng xuất
                        </Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>
                            Tồn kho
                        </Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>
                            Số giờ tồn kho
                        </Table.ColumnHeader>
                        <Table.ColumnHeader rowSpan={2}>
                            Ghi chú
                        </Table.ColumnHeader>
                        <Table.ColumnHeader rowSpan={2} textAlign={"center"}>
                            Thao tác
                        </Table.ColumnHeader>

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
                    {items.map((item, index) => {
                        const mo = item.manufacturingOrder;
                        const poItem = mo?.purchaseOrderItem;
                        const amount = poItem?.amount ?? 0;
                        const importDiff = item.importedQuantity - amount;

                        const hoursInStock = item.currentQuantity == 0 ? 0 : hourGap(item.createdAt);
                        return (
                            <Table.Row key={item._id ?? index}>
                                <Table.Cell textAlign="center">
                                    {(page - 1) * limit + index + 1}
                                </Table.Cell>
                                <Table.Cell>
                                    {formatDate(mo?.manufacturingDate)}
                                </Table.Cell>
                                <Table.Cell>
                                    <Highlight
                                        ignoreCase
                                        query={search}
                                        styles={{ bg: "teal.muted" }}

                                    >
                                        {mo?.code ?? "-"}
                                    </Highlight>

                                </Table.Cell>
                                <Table.Cell>
                                    <Highlight
                                        ignoreCase
                                        query={search}
                                        styles={{ bg: "teal.muted" }}

                                    >
                                        {safeGet(poItem, "subPurchaseOrder.purchaseOrder.customer.code")}
                                    </Highlight>
                                </Table.Cell>
                                <Table.Cell>
                                    <Highlight
                                        ignoreCase
                                        query={search}
                                        styles={{ bg: "teal.muted" }}

                                    >
                                        {safeGet(poItem, "ware.code")}
                                    </Highlight>
                                </Table.Cell>
                                <Table.Cell>
                                    <Highlight
                                        ignoreCase
                                        query={search}
                                        styles={{ bg: "teal.muted" }}

                                    >
                                        {safeGet(poItem, "ware.fluteCombination.code")}
                                    </Highlight></Table.Cell>
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
                                    {item.exportedTo ?? 'Chưa xuất phôi'}
                                </Table.Cell>
                                <Table.Cell>
                                    {item.exportedQuantity}
                                </Table.Cell>
                                <Table.Cell>
                                    {item.currentQuantity}
                                </Table.Cell>
                                <Table.Cell backgroundColor={hoursInStock > 48 ? "red" : "white"}
                                    color={hoursInStock > 2 ? "white" : "black"}
                                    fontWeight={"bold"}
                                    textAlign={"center"}>
                                    {hoursInStock}
                                </Table.Cell>
                                <Table.Cell>
                                    {item.note}
                                </Table.Cell>

                                <Table.Cell>
                                    <Group gap={3}>
                                        <Button
                                            variant="surface"
                                            colorPalette="blue"
                                            onClick={() => onView(item)}>
                                            <Icon>
                                                <FaEye />
                                            </Icon>
                                            Chi tiết
                                        </Button>
                                        <Button
                                            variant="surface"
                                            colorPalette="green"
                                            onClick={() => onTransaction("IMPORT", item)}>
                                            <Icon>
                                                <FaPlus />
                                            </Icon>
                                            Nhập Kho
                                        </Button>
                                        <Button
                                            variant="surface"
                                            colorPalette={item.currentQuantity <= 0 ? "gray" : "red"}
                                            disabled={item.currentQuantity <= 0}
                                            onClick={() => onTransaction("EXPORT", item)}>
                                            <Icon>
                                                <FaMinus />
                                            </Icon>
                                            Xuất Kho
                                        </Button>
                                    </Group>
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

export default SemiFinishedTable;
