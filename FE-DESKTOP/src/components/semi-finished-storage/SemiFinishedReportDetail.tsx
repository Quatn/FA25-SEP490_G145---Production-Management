import React from "react";
import { EmployeeDailyStats, SemiFinishedGoodTransaction } from "@/types/SemiFinishedTransaction";
import { Box, Button, ButtonGroup, Collapsible, Combobox, createListCollection, Field, Flex, Icon, IconButton, Input, ListCollection, Pagination, Portal, Select, Spacer, Stack, Table, TableScrollArea, useCollapsible, useFilter, useListCollection } from "@chakra-ui/react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { FaFileExcel } from "react-icons/fa";
import exportDailyReportToExcel from "./SemiFinishedExportExcelButton";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";

interface SemiFinishedReportDetailProps {
    date: string;
    setDate: (date: string) => void;
    transactions: SemiFinishedGoodTransaction[];
    setEmployeeId: (id: string) => void;
    setTransactionType: (type: string) => void;
    page: number;
    setPage: (page: number) => void;
    totalPages: number;
    ITEMS_PER_PAGE: number;
    employeeCollection: ListCollection<{ label: string; value: string; }>;
    employeeFilter: (inputValue: string) => void;
}

export const SemiFinishedReportDetail: React.FC<SemiFinishedReportDetailProps> = ({
    date,
    setDate,
    transactions,
    setEmployeeId,
    setTransactionType,
    page,
    setPage,
    totalPages,
    ITEMS_PER_PAGE,
    employeeCollection,
    employeeFilter,
}) => {

    const collapsible = useCollapsible({ defaultOpen: true });
    const today = new Date();
    const localDate = today.toLocaleDateString('en-CA');

    const transactionTypeCollection = createListCollection({
        items: [
            { label: "Nhập", value: "IMPORT" },
            { label: "Xuất", value: "EXPORT" },
        ],
    })

    const paginatedData = transactions.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <Box p={4}>

            <Flex direction="column" gap={3}>

                <Flex direction="column" gap={4}>
                    <Flex direction="row" justifyContent={"space-between"}>
                        <Button
                            size="lg"
                            variant="subtle"
                            onClick={() => collapsible.setOpen(!collapsible.open)}
                        >
                            {collapsible.open ? "Ẩn" : "Hiện"} lọc báo cáo
                            <Icon>{collapsible.open ? <LuChevronRight /> : <LuChevronDown />}</Icon>
                        </Button>

                        <Button size={"lg"} colorPalette={"green"} onClick={() => exportDailyReportToExcel(transactions, date)}>
                            <FaFileExcel /> Xuất báo cáo
                        </Button>

                    </Flex>
                    <Collapsible.RootProvider value={collapsible}>
                        <Collapsible.Content>
                            <Box padding="4" borderWidth="1px" rounded="l3">
                                <Flex direction="row" gap={3} justifyContent={"flex-start"}>

                                    <Field.Root orientation="vertical">
                                        <Field.Label fontSize="lg">Ngày</Field.Label>
                                        <Input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            max={localDate}
                                            width="200px"
                                        />
                                    </Field.Root>

                                    <Field.Root orientation="vertical">
                                        <Field.Label fontSize="lg">Loại thao tác</Field.Label>
                                        <Select.Root
                                            collection={transactionTypeCollection}
                                            size="sm"
                                            width="320px"
                                            onValueChange={(e) => setTransactionType(e.value[0])}>
                                            <Select.HiddenSelect />
                                            <Select.Control>
                                                <Select.Trigger>
                                                    <Select.ValueText placeholder="Chọn thao tác" />
                                                </Select.Trigger>
                                                <Select.IndicatorGroup>
                                                    <Select.ClearTrigger />
                                                    <Select.Indicator />
                                                </Select.IndicatorGroup>
                                            </Select.Control>
                                            <Portal>
                                                <Select.Positioner>
                                                    <Select.Content>
                                                        {transactionTypeCollection.items.map((transactionType) => (
                                                            <Select.Item item={transactionType} key={transactionType.value}>
                                                                {transactionType.label}
                                                                <Select.ItemIndicator />
                                                            </Select.Item>
                                                        ))}
                                                    </Select.Content>
                                                </Select.Positioner>
                                            </Portal>
                                        </Select.Root>
                                    </Field.Root>

                                    <Field.Root orientation="vertical">
                                        <Field.Label fontSize="lg">Nhân viên</Field.Label>
                                        <Combobox.Root
                                            collection={employeeCollection}
                                            onInputValueChange={(e) => {
                                                employeeFilter(e.inputValue);
                                            }}
                                            onValueChange={(details) => setEmployeeId(details.value[0])}
                                            width="250px"
                                            placeholder="Chọn hoặc tìm nhân viên"
                                        >
                                            <Combobox.Control>
                                                <Combobox.Input placeholder="Tìm nhân viên..." />
                                                <Combobox.IndicatorGroup>
                                                    <Combobox.ClearTrigger />
                                                    <Combobox.Trigger />
                                                </Combobox.IndicatorGroup>
                                            </Combobox.Control>
                                            <Portal>
                                                <Combobox.Positioner>
                                                    <Combobox.Content minW="sm">
                                                        <Combobox.Empty>Không có nhân viên phù hợp</Combobox.Empty>
                                                        {employeeCollection.items.map((item, index) => (
                                                            <Combobox.Item key={index} item={item}>
                                                                {item.label}
                                                                <Combobox.ItemIndicator />
                                                            </Combobox.Item>
                                                        ))}
                                                    </Combobox.Content>
                                                </Combobox.Positioner>
                                            </Portal>
                                        </Combobox.Root>
                                    </Field.Root>
                                </Flex>
                            </Box>
                        </Collapsible.Content>
                    </Collapsible.RootProvider>
                </Flex>

                <Flex mb={4} justify="center" align="center">
                    <Box fontSize="lg" fontWeight="bold">
                        BÁO CÁO NGÀY {new Date(date).toLocaleDateString('vi-VN')}
                    </Box>
                </Flex>

                <TableScrollArea borderWidth="1px" rounded="md" mt={5}>
                    <Table.Root size="lg" showColumnBorder stickyHeader interactive colorPalette="orange" tableLayout="auto" w="100%">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader w="1%" textAlign="center">STT</Table.ColumnHeader>
                                <Table.ColumnHeader>Thời gian</Table.ColumnHeader>
                                <Table.ColumnHeader>Thao tác</Table.ColumnHeader>
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
                                        <Table.Cell>{tx.semiFinishedGood?.manufacturingOrder?.code ?? "-"}</Table.Cell>
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

                <Pagination.Root
                    count={totalPages * ITEMS_PER_PAGE}
                    pageSize={ITEMS_PER_PAGE}
                    page={page}
                    onPageChange={(e) => setPage(e.page)}
                >
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
            </Flex>
        </Box>
    );
};
