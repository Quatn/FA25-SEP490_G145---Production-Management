import { Table, Group, Button, Icon } from "@chakra-ui/react";
import { FaEye } from "react-icons/fa";
import { FluteCombination } from "@/types/FluteCombination";
import { TbRestore } from "react-icons/tb";
import React from "react";

interface Props {
    page: number;
    limit: number;
    items: FluteCombination[];
    onRestore: (item: FluteCombination) => void;
    onDetail: (item: FluteCombination) => void;
}

const FluteCombinationRestoreTable: React.FC<Props> = ({ page, limit, items, onRestore, onDetail }) => {
    return (
        <Table.ScrollArea
            borderWidth="1px"
            rounded="md"
            mt={5}
        >
            <Table.Root
                size="lg"
                showColumnBorder
                stickyHeader
                interactive
                colorPalette="orange"
                tableLayout="auto"
                w="100%"
            >
                <Table.Header>
                    <Table.Row background={'blue.100'}>
                        <Table.ColumnHeader w="1%" textAlign="center">
                            STT
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>Mã</Table.ColumnHeader>
                        <Table.ColumnHeader>Mô tả</Table.ColumnHeader>
                        <Table.ColumnHeader w="1%" textAlign="center">
                            Thao tác
                        </Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {items.map((item, index) => (
                        <Table.Row key={item._id ?? index}>
                            <Table.Cell textAlign="center">{(page - 1) * limit + index + 1}</Table.Cell>
                            <Table.Cell>{item.code}</Table.Cell>
                            <Table.Cell>{item.description}</Table.Cell>
                            <Table.Cell>
                                <Group gap={5}>
                                    <Button
                                        variant="surface"
                                        colorPalette="blue"
                                        onClick={() => onDetail(item)}
                                    >
                                        <Icon>
                                            <FaEye />
                                        </Icon>
                                        Chi tiết
                                    </Button>
                                    <Button
                                        variant="surface"
                                        colorPalette="green"
                                        onClick={() => onRestore(item)}
                                    >
                                        <Icon>
                                            <TbRestore />
                                        </Icon>
                                        Khôi phục
                                    </Button>
                                </Group>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Table.ScrollArea>
    );
};

export default FluteCombinationRestoreTable;