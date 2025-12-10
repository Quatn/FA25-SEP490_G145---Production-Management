import { Table, Group, Button, Icon, Text } from "@chakra-ui/react";
import { FaEye } from "react-icons/fa";
import { PrintColor } from "@/types/PrintColor";
import { TbRestore } from "react-icons/tb";
import React from "react";
import { Tooltip } from "@/components/ui/tooltip";

interface Props {
    page: number;
    limit: number;
    items: PrintColor[];
    onRestore: (item: PrintColor) => void;
    onDetail: (item: PrintColor) => void;
}

const PrintColorRestoreTable: React.FC<Props> = ({ page, limit, items, onRestore, onDetail }) => {
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
                        <Table.ColumnHeader>Mã Màu In</Table.ColumnHeader>
                        <Table.ColumnHeader>Mô Tả</Table.ColumnHeader>
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
                            <Table.Cell>
                                <Tooltip content={item.description} showArrow>
                                    <Text
                                        overflow="hidden"
                                        textOverflow="ellipsis"
                                        maxLines={1}
                                        maxW="300px"
                                    >
                                        {item.description}
                                    </Text>
                                </Tooltip>
                            </Table.Cell>
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

export default PrintColorRestoreTable;