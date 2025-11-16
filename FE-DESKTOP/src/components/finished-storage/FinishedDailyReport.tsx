"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Flex,
    Spacer,
    Input,
    Button,
    Table,
    Stack,
    Spinner,
    TableScrollArea,
    Pagination,
    ButtonGroup,
    IconButton,
} from "@chakra-ui/react";
import { FaFileExcel } from "react-icons/fa";
import { useGetFGDailyReportQuery } from "@/service/api/finishedGoodTransactionApiSlice";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import exportDailyReportToExcel from "./FinishedExportExcelButton";

const FinishedDailyReport: React.FC = () => {
    const [date, setDate] = useState<string>(() =>
        new Date().toISOString().slice(0, 10)
    );

    const ITEMS_PER_PAGE = 10;

    const [page, setPage] = useState(1);

    const today = new Date();
    const localDate = today.toLocaleDateString('en-CA');

    const { data: sfDRData, isLoading, error } = useGetFGDailyReportQuery({ date });

    const report = sfDRData?.data;
    const transactions = report?.data ?? [];

    const paginatedData = transactions.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE) ?? [];


    if (isLoading) return <Spinner />;
    if (error)
        return (
            <Box>
                Không thể tải dữ liệu
            </Box>
        );

    return (
        <Box p={4}>
            <Flex mb={4} align="center">
                <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={localDate}
                    width="200px"
                />
                <Spacer />
                <Stack direction="row">
                    <Button colorPalette={"green"} onClick={() => exportDailyReportToExcel(transactions, date)}>
                        <FaFileExcel /> Xuất báo cáo
                    </Button>
                </Stack>
            </Flex>



            <Flex mb={4} justify="center" align="center">
                <Box fontSize="lg" fontWeight="bold">
                    BÁO CÁO NGÀY {new Date(date).toLocaleDateString('vi-VN')}
                </Box>
            </Flex>
            {report && (
                <Box mb={4}>
                    <Flex gap={5} direction={"row"}>
                        <Box fontSize={"lg"}>Tổng nhập: {report.totalImport}</Box>
                        <Box fontSize={"lg"}>Tổng xuất: {report.totalExport}</Box>
                        <Box fontSize={"lg"}>Tồn kho: {report.net}</Box>
                    </Flex>
                </Box>
            )}
            <TableScrollArea borderWidth="1px" rounded="md" mt={5}>
                <Table.Root size="lg" showColumnBorder stickyHeader interactive colorPalette="orange" tableLayout="auto" w="100%">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader w="1%" textAlign="center">STT</Table.ColumnHeader>
                            <Table.ColumnHeader>Thời gian</Table.ColumnHeader>
                            <Table.ColumnHeader>Loại</Table.ColumnHeader>
                            <Table.ColumnHeader>Mã lệnh</Table.ColumnHeader>
                            <Table.ColumnHeader>Nhân viên</Table.ColumnHeader>
                            <Table.ColumnHeader>Số lượng</Table.ColumnHeader>
                            <Table.ColumnHeader>Tồn đầu</Table.ColumnHeader>
                            <Table.ColumnHeader>Tồn cuối</Table.ColumnHeader>
                            <Table.ColumnHeader>Ghi chú</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {paginatedData.map((tx, index) => {
                            const quantity =
                                tx.transactionType === "IMPORT"
                                    ? tx.finalQuantity - tx.initialQuantity
                                    : tx.initialQuantity - tx.finalQuantity;

                            return (
                                <Table.Row key={tx._id ?? index}>
                                    <Table.Cell textAlign="center">{(page - 1) * ITEMS_PER_PAGE + index + 1}</Table.Cell>
                                    <Table.Cell>{new Date(tx.createdAt ?? "").toLocaleTimeString()}</Table.Cell>
                                    <Table.Cell>{tx.transactionType == "IMPORT" ? "Nhập" : "Xuất"}</Table.Cell>
                                    <Table.Cell>{tx.finishedGood?.manufacturingOrder?.code ?? "-"}</Table.Cell>
                                    <Table.Cell>{tx.employee?.name ?? "-"}</Table.Cell>
                                    <Table.Cell>{quantity}</Table.Cell>
                                    <Table.Cell>{tx.initialQuantity}</Table.Cell>
                                    <Table.Cell>{tx.finalQuantity}</Table.Cell>
                                    <Table.Cell>{tx.note}</Table.Cell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table.Root>
            </TableScrollArea>
            <Flex mt={4} justify="center">
                <Pagination.Root
                    count={transactions.length}
                    pageSize={ITEMS_PER_PAGE}
                    page={page}
                    onPageChange={(e) => setPage(e.page)}
                >
                    <ButtonGroup variant="ghost" size="sm">
                        <Pagination.PrevTrigger asChild>
                            <IconButton><LuChevronLeft /></IconButton>
                        </Pagination.PrevTrigger>

                        <Pagination.Items
                            render={(p) => (
                                <IconButton
                                    variant={{ base: "ghost", _selected: "outline" }}
                                >
                                    {p.value}
                                </IconButton>
                            )}
                        />

                        <Pagination.NextTrigger asChild>
                            <IconButton><LuChevronRight /></IconButton>
                        </Pagination.NextTrigger>
                    </ButtonGroup>
                </Pagination.Root>
            </Flex>
        </Box>
    );
};

export default FinishedDailyReport;
