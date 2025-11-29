import { FinishedGoodTransactionHistory } from "@/types/FinishedGoodTransaction";
import { formatDate } from "@/utils/dateUtils";
import { Table } from "@chakra-ui/react";

interface FGTTableProps {
    items: FinishedGoodTransactionHistory[];
    poiAmount: number;
}
export const FinishedTransactionHistoryTable: React.FC<FGTTableProps> = ({ items, poiAmount }) => {

    return (
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
    );
}