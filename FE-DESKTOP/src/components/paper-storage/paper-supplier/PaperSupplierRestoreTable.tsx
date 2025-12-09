import { Table, Group, Button, Icon, Text } from "@chakra-ui/react";
import { FaEye } from "react-icons/fa";
import { Tooltip } from "@/components/ui/tooltip"
import { PaperSupplier } from "@/types/PaperSupplier";
import { TbRestore } from "react-icons/tb";
import React from "react";

interface Props {
    page: number;
    limit: number;
    items: PaperSupplier[];
    onRestore: (item: PaperSupplier) => void;
    onDetail: (item: PaperSupplier) => void;
}

const PaperSupplierRestoreTable: React.FC<Props> = ({ page, limit, items, onRestore, onDetail }) => {
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
                    <Table.Row>
                        <Table.ColumnHeader w="1%" textAlign="center">
                            STT
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>Mã Nhà Giấy</Table.ColumnHeader>
                        <Table.ColumnHeader>Tên Nhà Giấy</Table.ColumnHeader>
                        <Table.ColumnHeader>Địa chỉ</Table.ColumnHeader>
                        <Table.ColumnHeader>Số điện thoại</Table.ColumnHeader>
                        <Table.ColumnHeader>Email</Table.ColumnHeader>
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
                            <Table.Cell>{item.name}</Table.Cell>

                            <Table.Cell>
                                <Tooltip content={item.address} showArrow>
                                    <Text
                                        overflow="hidden"
                                        textOverflow="ellipsis"
                                        maxLines={1}
                                        maxW="300px"
                                    >
                                        {item.address}
                                    </Text>
                                </Tooltip>
                            </Table.Cell>

                            <Table.Cell>{item.phone}</Table.Cell>
                            <Table.Cell>{item.email}</Table.Cell>
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

export default PaperSupplierRestoreTable;