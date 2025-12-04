import React from "react";
import { Box, TableScrollArea, Table, Field, Flex, Pagination, ButtonGroup, IconButton } from "@chakra-ui/react";
import { formatDate } from "@/utils/dateUtils";
import { safeGet } from "@/utils/storagesUtils";
import { FinishedGoodDailyItem } from "@/types/FinishedGoodTransaction";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";

interface DailyReportTableProps {
    search: string;
    page: number;
    limit: number;
    totalPages: number;
    transactionType: 'IMPORT' | 'EXPORT';
    dailyItems: FinishedGoodDailyItem[];
    handlePageChange: (page: number) => void;
}

const FinishedDailyReportTable: React.FC<DailyReportTableProps> = ({
     search, 
     page, 
     limit,
     totalPages, 
     handlePageChange, 
     dailyItems, 
     transactionType,
    }) => {
    const totalQuantity = dailyItems.reduce((sum, item) => sum + (item.totalQuantity ?? 0), 0);
    return (
        <Box mt={5}>

            <Flex mt={5} mb={4} gap={4}>
                <Field.Root alignItems="start">
                    <Field.Label fontSize={'xl'}>
                        Báo cáo {`${transactionType == 'IMPORT' ? 'nhập' : 'xuất'}`} kho thành phẩm

                    </Field.Label>
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
                            <Table.ColumnHeader
                                fontSize={'xl'}
                                textAlign={'center'}
                                colSpan={9}>
                                {`BÁO CÁO CHI TIẾT ${transactionType == 'IMPORT' ? 'NHẬP' : 'XUẤT'} THEO NGÀY`}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                fontWeight={'bold'}
                                whiteSpace={"normal"}
                                w={"1%"}>
                                TỔNG {transactionType == 'IMPORT' ? 'NHẬP' : 'XUẤT'}
                            </Table.ColumnHeader>
                        </Table.Row>
                        <Table.Row>
                            <Table.ColumnHeader rowSpan={2} textAlign="center" w="1%">
                                STT
                            </Table.ColumnHeader>
                            <Table.ColumnHeader textAlign={'center'} rowSpan={2}>
                                Lệnh
                            </Table.ColumnHeader>
                            <Table.ColumnHeader textAlign={'center'} rowSpan={2}>
                                Mã đơn hàng
                            </Table.ColumnHeader>
                            <Table.ColumnHeader textAlign={'center'} rowSpan={2}>
                                Khách hàng
                            </Table.ColumnHeader>
                            <Table.ColumnHeader textAlign={'center'} rowSpan={2}>
                                Mã hàng
                            </Table.ColumnHeader>
                            <Table.ColumnHeader textAlign={'center'} rowSpan={2}>
                                Số lớp
                            </Table.ColumnHeader>
                            <Table.ColumnHeader colSpan={3} textAlign="center">
                                Kích thước
                            </Table.ColumnHeader>
                            <Table.ColumnHeader textAlign={'center'} rowSpan={2}>
                                Số lượng
                            </Table.ColumnHeader>
                            <Table.ColumnHeader textAlign={'center'} rowSpan={2}>
                                Ngày giao hàng
                            </Table.ColumnHeader>
                            <Table.ColumnHeader textAlign={'center'} rowSpan={2}>
                                {totalQuantity}
                            </Table.ColumnHeader>

                        </Table.Row>
                        <Table.Row>
                            <Table.ColumnHeader>Dài</Table.ColumnHeader>
                            <Table.ColumnHeader>Rộng</Table.ColumnHeader>
                            <Table.ColumnHeader>Cao</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {dailyItems.map((item, index) => {
                            const mo = item.finishedGood.manufacturingOrder;
                            const poItem = mo?.purchaseOrderItem;
                            const amount = (poItem as PurchaseOrderItem)?.amount;
                            return (
                                <Table.Row key={index}>
                                    <Table.Cell textAlign="center">{index + 1}</Table.Cell>
                                    <Table.Cell>{mo?.code ?? "-"}</Table.Cell>
                                    <Table.Cell>{safeGet(poItem, "subPurchaseOrder.purchaseOrder.code")}</Table.Cell>
                                    <Table.Cell>{safeGet(poItem, "subPurchaseOrder.purchaseOrder.customer.code")}</Table.Cell>
                                    <Table.Cell>{safeGet(poItem, "ware.code")}</Table.Cell>
                                    <Table.Cell>{safeGet(poItem, "ware.fluteCombination.code")}</Table.Cell>
                                    <Table.Cell>{safeGet(poItem, "ware.wareLength")}</Table.Cell>
                                    <Table.Cell>{safeGet(poItem, "ware.wareWidth")}</Table.Cell>
                                    <Table.Cell>{safeGet(poItem, "ware.wareHeight")}</Table.Cell>
                                    <Table.Cell>{amount}</Table.Cell>
                                    <Table.Cell>{formatDate(safeGet(poItem, "subPurchaseOrder.deliveryDate"))}</Table.Cell>
                                    <Table.Cell>{item.totalQuantity ?? 0}</Table.Cell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table.Root>
            </TableScrollArea>

            <Pagination.Root
                count={search ? dailyItems.length : totalPages * limit}
                pageSize={limit}
                page={page}
                siblingCount={2}
                onPageChange={(e) => handlePageChange(e.page)}
            >
                <ButtonGroup variant="ghost" size="sm" mt={4} justifyContent="center">
                    <Pagination.PrevTrigger asChild>
                        <IconButton aria-label="Previous page"><HiChevronLeft /></IconButton>
                    </Pagination.PrevTrigger>

                    <Pagination.Items render={(pageItem) => (
                        <IconButton
                            key={pageItem.value}
                            variant={{ base: 'ghost', _selected: 'outline' }}
                            onClick={() => handlePageChange(pageItem.value)}>
                            {pageItem.value}
                        </IconButton>
                    )} />

                    <Pagination.NextTrigger asChild>
                        <IconButton aria-label="Next page"><HiChevronRight /></IconButton>
                    </Pagination.NextTrigger>
                </ButtonGroup>
            </Pagination.Root>
        </Box>
    );
};

export default FinishedDailyReportTable;
