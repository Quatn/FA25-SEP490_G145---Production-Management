import React, { useEffect, useState } from "react";
import { Button, IconButton, Pagination, ButtonGroup, Spinner, Table, Text } from "@chakra-ui/react";
import { FinishedGoodTransaction } from "@/types/FinishedGoodTransaction";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { useGetFinishedGoodTransactionsQuery } from "@/service/api/finishedGoodTransactionApiSlice";

interface Props {
    id: string | undefined;
}

const FinishedTransactionHistory: React.FC<Props> = ({ id }) => {
    const [page, setPage] = useState(1);
    const limit = 10;
    const { data, error, isLoading } = useGetFinishedGoodTransactionsQuery({ page, limit, search: '', finishedGoodId: id ?? '' });
    const items: FinishedGoodTransaction[] = (data as any)?.data?.data ?? [];
    const totalPages = (data as any)?.data?.totalPages ?? 1;

    if (isLoading) return <Spinner />;
    if (error) return <Text>Không thể tải lịch sử.</Text>;

    return (
        <>
            <Table.ScrollArea borderWidth="1px" rounded="md" mt={4}>
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader fontSize={"lg"}>Thời gian</Table.ColumnHeader>
                            <Table.ColumnHeader fontSize={"lg"}>Loại</Table.ColumnHeader>
                            <Table.ColumnHeader fontSize={"lg"}>Số lượng</Table.ColumnHeader>
                            <Table.ColumnHeader fontSize={"lg"}>Tồn đầu</Table.ColumnHeader>
                            <Table.ColumnHeader fontSize={"lg"}>Tồn cuối</Table.ColumnHeader>
                            <Table.ColumnHeader fontSize={"lg"}>Người phụ trách</Table.ColumnHeader>
                            <Table.ColumnHeader fontSize={"lg"}>Ghi chú</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {items.map((it) => (
                            <Table.Row key={it._id}>
                                <Table.Cell fontSize={"lg"}>{new Date(it.createdAt ?? '').toLocaleString()}</Table.Cell>
                                <Table.Cell fontSize={"lg"}>{it.transactionType === 'IMPORT' ? 'Nhập' : 'Xuất'}</Table.Cell>
                                <Table.Cell fontSize={"lg"}>{Math.abs(it.finalQuantity - it.initialQuantity)}</Table.Cell>
                                <Table.Cell fontSize={"lg"}>{it.initialQuantity}</Table.Cell>
                                <Table.Cell fontSize={"lg"}>{it.finalQuantity}</Table.Cell>
                                <Table.Cell fontSize={"lg"}>{it.employee?.name}</Table.Cell>
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

export default FinishedTransactionHistory;
