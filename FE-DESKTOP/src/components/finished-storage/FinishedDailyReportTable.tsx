import React from "react";
import { Box, TableScrollArea, Table } from "@chakra-ui/react";
import { FinishedGood } from "@/types/FinishedGood";

interface FinishedGoodSummary {
    finishedGood: FinishedGood;
    total: number;
}

interface DailySummary {
    date: string;
    summaryPerFinishedGood: FinishedGoodSummary[];
}

interface DailyReportTableProps {
    title: string;
    dailySummary: DailySummary[];
}

const get = (obj: any, path: string, fallback: any = "-") =>
    path.split(".").reduce((o, k) => o?.[k], obj) ?? fallback;

function formatDate(value?: string | Date | number | null, locale = "vi-VN"): string {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" });
}

const FinishedDailyReportTable: React.FC<DailyReportTableProps> = ({ title, dailySummary }) => {
    return (
        <Box mt={5}>
            <Box fontWeight="bold" fontSize="lg" mb={2}>
                {title}
            </Box>
            <TableScrollArea borderWidth="1px" rounded="md">
                <Table.Root
                    size="lg"
                    showColumnBorder
                    stickyHeader
                    interactive
                    colorScheme="orange"
                    tableLayout="auto"
                    w="100%"
                    css={{ "& td, & th": { border: "1px solid black" } }}
                    border="1px solid black"
                >
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader rowSpan={2}>Ngày</Table.ColumnHeader>
                            <Table.ColumnHeader rowSpan={2} textAlign="center" w="1%">
                                STT
                            </Table.ColumnHeader>
                            <Table.ColumnHeader rowSpan={2}>Mã hàng</Table.ColumnHeader>
                            <Table.ColumnHeader rowSpan={2}>Số lớp</Table.ColumnHeader>
                            <Table.ColumnHeader colSpan={3} textAlign="center">
                                Kích thước
                            </Table.ColumnHeader>
                            <Table.ColumnHeader rowSpan={2}>Số lượng cần nhập</Table.ColumnHeader>
                            <Table.ColumnHeader rowSpan={2}>Ngày giao hàng</Table.ColumnHeader>
                            <Table.ColumnHeader rowSpan={2}>Số lượng đã nhập</Table.ColumnHeader>
                        </Table.Row>
                        <Table.Row>
                            <Table.ColumnHeader>Dài</Table.ColumnHeader>
                            <Table.ColumnHeader>Rộng</Table.ColumnHeader>
                            <Table.ColumnHeader>Cao</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {dailySummary.map((day) =>
                            day.summaryPerFinishedGood.map((fgSummary, fgIndex) => {
                                const fg = fgSummary.finishedGood;
                                const poItem = fg.manufacturingOrder?.purchaseOrderItem;
                                const amount = poItem?.amount ?? 0;

                                return (
                                    <Table.Row key={`${day.date}-${fg._id}`}>
                                        <Table.Cell textAlign="center">
                                            {new Date(day.date).toLocaleDateString("vi-VN")}
                                        </Table.Cell>
                                        <Table.Cell textAlign="center">{fgIndex + 1}</Table.Cell>
                                        <Table.Cell>{get(poItem, "ware.code")}</Table.Cell>
                                        <Table.Cell>{get(poItem, "ware.fluteCombination.code")}</Table.Cell>
                                        <Table.Cell>{get(poItem, "ware.wareLength")}</Table.Cell>
                                        <Table.Cell>{get(poItem, "ware.wareWidth")}</Table.Cell>
                                        <Table.Cell>{get(poItem, "ware.wareHeight")}</Table.Cell>
                                        <Table.Cell>{amount}</Table.Cell>
                                        <Table.Cell>{formatDate(get(poItem, "subPurchaseOrder.deliveryDate"))}</Table.Cell>
                                        <Table.Cell>{fg.importedQuantity ?? 0}</Table.Cell>
                                    </Table.Row>
                                );
                            })
                        )}
                    </Table.Body>
                </Table.Root>
            </TableScrollArea>
        </Box>
    );
};

export default FinishedDailyReportTable;
