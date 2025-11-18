import React from "react";
import { Table, Group, Button, Icon } from "@chakra-ui/react";
import { FaEye, FaMinus, FaPlus } from "react-icons/fa";
import { FinishedGood } from "@/types/FinishedGood";
import { FluteCombination } from "@/types/FluteCombination";


interface Props {
    page: number;
    limit: number;
    items: FinishedGood[];
    onView: (item: FinishedGood) => void;
    onTransaction: (type: "IMPORT" | "EXPORT", item: FinishedGood) => void;
}

const FinishedTable: React.FC<Props> = ({ page, limit, items, onView, onTransaction }) => {
    function formatDate(value?: string | Date | number | null, locale = "vi-VN"): string {
        if (value === undefined || value === null || value === "") return "";
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        return date.toLocaleDateString(locale, {
            day: "2-digit",
            month: "2-digit"
        });
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

    function dayGap(date?: string): number {
        if (!date) return 0;

        const created = new Date(date);
        if (isNaN(created.getTime())) return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const createdDay = new Date(created);
        createdDay.setHours(0, 0, 0, 0);

        const diffMs = today.getTime() - createdDay.getTime();
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }

    return (
        <Table.ScrollArea borderWidth="1px" width={"100%"} rounded="md" mt={5}>
            <Table.Root
                size="lg"
                stickyHeader
                interactive
                showColumnBorder
                colorPalette="orange"
                tableLayout="auto"
                w="100%"
                css={{
                    "& td, & th": {
                        border: "1px solid black"
                    },
                }}
                border={"1px solid black"}>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader colSpan={1}></Table.ColumnHeader>
                        <Table.ColumnHeader colSpan={4} textAlign={"center"}>THÔNG TIN CƠ BẢN</Table.ColumnHeader>
                        <Table.ColumnHeader colSpan={6} textAlign={"center"}>THÔNG SỐ KỸ THUẬT</Table.ColumnHeader>
                        <Table.ColumnHeader colSpan={3} textAlign={"center"}> SẢN LƯỢNG NHẬP</Table.ColumnHeader>
                        <Table.ColumnHeader colSpan={3} textAlign={"center"}> SẢN LƯỢNG XUẤT</Table.ColumnHeader>
                        <Table.ColumnHeader colSpan={3} textAlign={"center"}> SẢN LƯỢNG TỒN</Table.ColumnHeader>
                        <Table.ColumnHeader colSpan={1} textAlign={"center"}></Table.ColumnHeader>
                    </Table.Row>
                    <Table.Row>
                        <Table.ColumnHeader rowSpan={2} w="1%" textAlign="center">STT</Table.ColumnHeader>
                        <Table.ColumnHeader rowSpan={2}>Lệnh</Table.ColumnHeader>
                        <Table.ColumnHeader rowSpan={2}>Số đơn hàng</Table.ColumnHeader>
                        <Table.ColumnHeader rowSpan={2}>Khách hàng</Table.ColumnHeader>
                        <Table.ColumnHeader rowSpan={2}>Mã hàng</Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Số lớp</Table.ColumnHeader>
                        <Table.ColumnHeader colSpan={3} rowSpan={1} textAlign={"center"}>Kích thước (mm)</Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Số lượng</Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Ngày giao</Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Tổng số lượng cần nhập</Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Tổng số lượng đã nhập</Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Tình trạng nhập hàng</Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Tổng số lượng đã xuất</Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Tồn kho</Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Tình trạng xuất hàng</Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Số ngày tồn kho</Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Số lượng thừa</Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Điều kiện</Table.ColumnHeader>
                        <Table.ColumnHeader rowSpan={2} textAlign={"center"}>Thao tác</Table.ColumnHeader>

                    </Table.Row>
                    <Table.Row>
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
                        const exportDiff = item.exportedQuantity - amount;

                        return (
                            <Table.Row key={item._id ?? index}>
                                <Table.Cell textAlign="center">
                                    {(page - 1) * limit + index + 1}
                                </Table.Cell>

                                <Table.Cell>{mo?.code ?? "-"}</Table.Cell>
                                <Table.Cell>{get(poItem, "subPurchaseOrder.purchaseOrder.code")}</Table.Cell>
                                <Table.Cell>{get(poItem, "subPurchaseOrder.purchaseOrder.customer.code")}</Table.Cell>
                                <Table.Cell>{get(poItem, "ware.code")}</Table.Cell>
                                <Table.Cell>{get(poItem, "ware.fluteCombination.code")}</Table.Cell>
                                <Table.Cell>{get(poItem, "ware.wareLength")}</Table.Cell>
                                <Table.Cell>{get(poItem, "ware.wareWidth")}</Table.Cell>
                                <Table.Cell>{get(poItem, "ware.wareHeight")}</Table.Cell>

                                <Table.Cell>{amount}</Table.Cell>

                                <Table.Cell>
                                    {formatDate(get(poItem, "subPurchaseOrder.deliveryDate", null))}
                                </Table.Cell>

                                {/** San luong nhap */}
                                <Table.Cell>{amount}</Table.Cell>
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

                                {/** San luong xuat */}
                                <Table.Cell>{item.exportedQuantity}</Table.Cell>
                                <Table.Cell>{item.currentQuantity}</Table.Cell>
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
                                <Table.Cell>{item.currentQuantity == 0 ? '' : dayGap(item.createdAt)}</Table.Cell>
                                <Table.Cell>{item.currentQuantity}</Table.Cell>
                                <Table.Cell
                                    backgroundColor={
                                        item.currentStatus == 'SAVE' ? "" : "yellow"
                                    }
                                    color={item.currentStatus == 'SAVE' ? "" : "red.600"}
                                    fontWeight={"bold"}
                                >
                                    {item.currentStatus == 'SAVE' ? "Lưu" : "Hủy"}
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
                                        <Button variant="surface"
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
                                            <Icon><FaMinus />
                                            </Icon>
                                            Xuất Kho
                                        </Button>
                                    </Group>
                                </Table.Cell>

                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table.Root>
        </Table.ScrollArea>
    );
};

export default FinishedTable;
