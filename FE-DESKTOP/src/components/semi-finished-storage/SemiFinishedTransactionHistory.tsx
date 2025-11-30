import React, { useEffect, useState } from "react";
import { Button, IconButton, Pagination, ButtonGroup, Spinner, Table, Text } from "@chakra-ui/react";
import { useGetSemiFinishedGoodTransactionsQuery } from "@/service/api/semiFinishedGoodTransactionApiSlice";
import { SemiFinishedGoodTransaction, SemiFinishedGoodTransactionHistory } from "@/types/SemiFinishedTransaction";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { Employee } from "@/types/Employee";
import { formatDate } from "@/utils/dateUtils";

interface Props {
    id: string | undefined;
    poiAmount: number;
}

const SemiFinishedTransactionHistory: React.FC<Props> = ({ id, poiAmount }) => {
    const [page, setPage] = useState(1);
    const limit = 10;
    const { data, error, isLoading } = useGetSemiFinishedGoodTransactionsQuery({ page, limit, search: '', semiFinishedGood: id ?? '' });
    const items: SemiFinishedGoodTransactionHistory[] = (data as any)?.data?.data ?? [];
    const totalPages = (data as any)?.data?.totalPages ?? 1;

    if (isLoading) return <Spinner />;
    if (error) return <Text>Không thể tải lịch sử.</Text>;

    return (
        <>
            <Table.ScrollArea borderWidth="1px" rounded="md" mt={4}>
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader fontSize={"lg"}>STT</Table.ColumnHeader>
                            <Table.ColumnHeader fontSize={"lg"}>Thời gian tạo phiếu</Table.ColumnHeader>
                            <Table.ColumnHeader fontSize={"lg"}>Ngày thực hiện</Table.ColumnHeader>
                            <Table.ColumnHeader fontSize={"lg"}>Loại thao tác</Table.ColumnHeader>
                            <Table.ColumnHeader fontSize={"lg"}>Số lượng đơn</Table.ColumnHeader>
                            <Table.ColumnHeader fontSize={"lg"}>Nhập</Table.ColumnHeader>
                            <Table.ColumnHeader fontSize={"lg"}>Xuất</Table.ColumnHeader>
                            <Table.ColumnHeader fontSize={"lg"}>Tồn</Table.ColumnHeader>
                            <Table.ColumnHeader fontSize={"lg"}>Người phụ trách</Table.ColumnHeader>
                            <Table.ColumnHeader fontSize={"lg"}>Ghi chú</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {items.map((it) => (
                            <Table.Row key={it.index}>
                                <Table.Cell fontSize={"lg"}>{it.index}</Table.Cell>
                                <Table.Cell fontSize={"lg"}>{new Date(it.createdDate ?? '').toLocaleString("vi-VN", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                })}</Table.Cell>
                                <Table.Cell fontSize={"lg"}>{it.transactionDate ? formatDate(it.transactionDate) : '-'}</Table.Cell>
                                <Table.Cell fontSize={"lg"}>{it.transactionType === 'IMPORT' ? 'Nhập' : 'Xuất'}</Table.Cell>
                                <Table.Cell fontSize={"lg"}>{poiAmount}</Table.Cell>
                                <Table.Cell fontSize={"lg"}>{it.totalImport}</Table.Cell>
                                <Table.Cell fontSize={"lg"}>{it.totalExport}</Table.Cell>
                                <Table.Cell fontSize={"lg"}>{it.totalCurrent}</Table.Cell>
                                <Table.Cell fontSize={"lg"}>{it.employee}</Table.Cell>
                                <Table.Cell fontSize={"lg"}>{it.note}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>

            <Pagination.Root count={totalPages * limit} pageSize={limit} page={page} onPageChange={(e) => setPage(e.page)}>
                <ButtonGroup variant="ghost" size="sm" mt={4} justifyContent="center">
                    <Pagination.PrevTrigger asChild>
                        <IconButton aria-label="Previous"><HiChevronLeft /></IconButton>
                    </Pagination.PrevTrigger>
                    <Pagination.Items render={(p) => <IconButton key={p.value} onClick={() => setPage(p.value)}>{p.value}</IconButton>} />
                    <Pagination.NextTrigger asChild>
                        <IconButton aria-label="Next"><HiChevronRight /></IconButton>
                    </Pagination.NextTrigger>
                </ButtonGroup>
            </Pagination.Root>
        </>
    );
}

export default SemiFinishedTransactionHistory;
