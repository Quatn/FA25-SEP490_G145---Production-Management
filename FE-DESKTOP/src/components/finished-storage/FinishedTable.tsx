import React from "react";
import { Table, Group, Button, Icon } from "@chakra-ui/react";
import { FaEye, FaMinus, FaPlus } from "react-icons/fa";
import { FinishedGood } from "@/types/FinishedGood";


interface Props {
    page: number;
    limit: number;
    items: FinishedGood[];
    onView: (item: FinishedGood) => void;
    onTransaction: (type: "IMPORT" | "EXPORT", item: FinishedGood) => void;
}

const FinishedTable: React.FC<Props> = ({ page, limit, items, onView, onTransaction }) => {
    return (
        <Table.ScrollArea borderWidth="1px" rounded="md" mt={5}>
            <Table.Root size="lg" showColumnBorder stickyHeader interactive colorPalette="orange" tableLayout="auto" w="100%">
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader w="1%" textAlign="center">STT</Table.ColumnHeader>
                        <Table.ColumnHeader>Mã lệnh</Table.ColumnHeader>
                        <Table.ColumnHeader>Số lượng</Table.ColumnHeader>
                        <Table.ColumnHeader>Ghi chú</Table.ColumnHeader>
                        <Table.ColumnHeader w="1%" textAlign="center">Thao tác</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {items.map((item, index) => (
                        <Table.Row key={item._id ?? index}>
                            <Table.Cell textAlign="center">{(page - 1) * limit + index + 1}</Table.Cell>
                            <Table.Cell>{item.manufacturingOrder?.code ?? "-"}</Table.Cell>
                            <Table.Cell>{item.currentQuantity}</Table.Cell>
                            <Table.Cell>{item.note}</Table.Cell>
                            <Table.Cell>
                                <Group gap={3}>
                                    <Button variant="surface" colorPalette="blue" onClick={() => onView(item)}><Icon><FaEye /></Icon>Chi tiết</Button>
                                    <Button variant="surface" colorPalette="green" onClick={() => onTransaction("IMPORT", item)}><Icon><FaPlus /></Icon> Nhập Kho</Button>
                                    <Button variant="surface" colorPalette={item.currentQuantity <= 0 ? "gray" : "red"} disabled={item.currentQuantity <= 0} onClick={() => onTransaction("EXPORT", item)}><Icon><FaMinus /></Icon> Xuất Kho</Button>
                                </Group>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Table.ScrollArea>
    );
};

export default FinishedTable;
