import React from "react";
import { Box, TableScrollArea, Table, Field, Flex, Button } from "@chakra-ui/react";
import { FinishedGood } from "@/types/FinishedGood";
import { formatDate } from "@/utils/dateUtils";
import { exportFinishedDailyReport } from "./FinishedExportExcelButton";
import { FaFileExcel } from "react-icons/fa";

interface FinishedGoodSummary {
    finishedGood: FinishedGood;
    total: number;
}

interface DailySummary {
    date: string;
    summaryPerFinishedGood: FinishedGoodSummary[];
}

interface DailyReportTableProps {
    transactionType: 'IMPORT' | 'EXPORT';
    dailySummary: DailySummary[];
}

const get = (obj: any, path: string, fallback: any = "-") =>
    path.split(".").reduce((o, k) => o?.[k], obj) ?? fallback;

const FinishedDailyReportTable: React.FC<DailyReportTableProps> = ({ dailySummary, transactionType }) => {
    const totalQuantity = dailySummary
        .flatMap(day => day.summaryPerFinishedGood)
        .reduce((sum, fgSummary) => sum + (fgSummary.total ?? 0), 0);
    return (
        <Box mt={5}>

            <Flex mt={5} mb={4} gap={4} align="end">
                <Field.Root alignItems="start">
                    <Field.Label fontSize={'xl'}>Báo cáo {`${transactionType == 'IMPORT' ? 'nhập' : 'xuất'}`} kho thành phẩm</Field.Label>
                </Field.Root>
                <Field.Root alignItems="end">
                    <Field.Label>Báo Cáo Excel</Field.Label>
                    <Button
                        colorPalette={'green'}
                        onClick={() =>
                            exportFinishedDailyReport(dailySummary, 'IMPORT')
                        }
                    >
                        <FaFileExcel /> Xuất báo cáo
                    </Button>
                </Field.Root>
            </Flex>

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
                            <Table.ColumnHeader></Table.ColumnHeader>
                            <Table.ColumnHeader></Table.ColumnHeader>
                            <Table.ColumnHeader fontSize={'xl'} textAlign={'center'} colSpan={10}>{`BÁO CÁO CHI TIẾT ${transactionType == 'IMPORT' ? 'NHẬP' : 'XUẤT'} THEO NGÀY`}</Table.ColumnHeader>
                            <Table.ColumnHeader fontWeight={'bold'} whiteSpace={"normal"} w={"1%"}>TỔNG {transactionType == 'IMPORT' ? 'NHẬP' : 'XUẤT'}</Table.ColumnHeader>
                        </Table.Row>
                        <Table.Row>
                            <Table.ColumnHeader rowSpan={2} textAlign="center" w="1%">
                                STT
                            </Table.ColumnHeader>
                            <Table.ColumnHeader rowSpan={2}>Ngày</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign={'center'} rowSpan={2}>Lệnh</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign={'center'} rowSpan={2}>Mã đơn hàng</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign={'center'} rowSpan={2}>Khách hàng</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign={'center'} rowSpan={2}>Mã hàng</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign={'center'} rowSpan={2}>Số lớp</Table.ColumnHeader>
                            <Table.ColumnHeader colSpan={3} textAlign="center">
                                Kích thước
                            </Table.ColumnHeader>
                            <Table.ColumnHeader textAlign={'center'} rowSpan={2}>Số lượng</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign={'center'} rowSpan={2}>Ngày giao hàng</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign={'center'} rowSpan={2}>{totalQuantity}</Table.ColumnHeader>

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
                                const mo = fg.manufacturingOrder;
                                const poItem = mo?.purchaseOrderItem;
                                const amount = poItem?.amount ?? 0;

                                return (
                                    <Table.Row key={`${day.date}-${fg._id}`}>
                                        <Table.Cell textAlign="center">{fgIndex + 1}</Table.Cell>
                                        <Table.Cell textAlign="center">
                                            {formatDate(day.date)}
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
                                        <Table.Cell>{formatDate(get(poItem, "subPurchaseOrder.deliveryDate"))}</Table.Cell>
                                        <Table.Cell>{fgSummary.total ?? 0}</Table.Cell>
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
