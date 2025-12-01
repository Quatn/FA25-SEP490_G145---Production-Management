import React, { useEffect, useState } from "react";
import { Button, IconButton, Pagination, ButtonGroup, Spinner, Table, Text, useCollapsible, Flex, Icon, InputGroup, Input } from "@chakra-ui/react";
import { FinishedGoodTransactionHistory, FinishedGoodTransaction } from "@/types/FinishedGoodTransaction";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { useGetFinishedGoodTransactionsQuery } from "@/service/api/finishedGoodTransactionApiSlice";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";
import { FinishedTransactionHistoryFilter } from "./FinishedTransactionHistoryFilter";
import { FinishedTransactionHistoryTable } from "./FinishedTransactionHistoryTable";

interface Props {
    id: string | undefined;
    poiAmount: number;
}

const FinishedTransactionHistory: React.FC<Props> = ({ id, poiAmount }) => {
    const [page, setPage] = useState(1);
    const limit = 10;
    const [startDate, setStartDate] = useState('');
    const [transactionType, setTransactionType] = useState('');
    const [endDate, setEndDate] = useState('');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('ASC');
    const { data, error, isLoading } = useGetFinishedGoodTransactionsQuery(
        {
            page,
            limit,
            finishedGood: id ?? '',
            search: search == '' ? undefined : search,
            transactionType: transactionType == '' ? undefined : transactionType,
            startDate: startDate == '' ? undefined : startDate,
            endDate: endDate == '' ? undefined : endDate,
            sort,
        });
    const items: FinishedGoodTransactionHistory[] = (data as any)?.data?.data ?? [];
    const totalPages = (data as any)?.data?.totalPages ?? 1;
    const collapsible = useCollapsible({ defaultOpen: false });
    
    if (isLoading) return <Spinner />;
    if (error) return <Text>Không thể tải lịch sử.</Text>;

    return (
        <>
            <Flex direction="column" gap={4}>
                <Flex direction="row" justifyContent={"space-between"}>
                    <Button
                        size="lg"
                        variant="subtle"
                        onClick={() => collapsible.setOpen(!collapsible.open)}
                    >
                        {collapsible.open ? "Ẩn" : "Hiện"} lọc lịch sử
                        <Icon>{collapsible.open ? <LuChevronRight /> : <LuChevronDown />}</Icon>
                    </Button>
                    <InputGroup w={"full"} maxW={"sm"}>
                        <Input
                            size="lg"
                            placeholder="Tìm kiếm mã người phụ trách"
                            value={search}
                            onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
                    </InputGroup>
                </Flex>

                <FinishedTransactionHistoryFilter
                    collapsible={collapsible}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    setSort={setSort}
                    setTransactionType={setTransactionType} />
            </Flex>

            <FinishedTransactionHistoryTable items={items} poiAmount={poiAmount} />

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
