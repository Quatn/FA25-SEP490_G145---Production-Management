import { Table, Group, Button, Icon, Text } from "@chakra-ui/react";
import { FaEye } from "react-icons/fa";
import { PaperType } from "@/types/PaperType";
import { TbRestore } from "react-icons/tb";
import React from "react";
import { PaperColor } from "@/types/PaperColor";

interface Props {
    page: number;
    limit: number;
    items: PaperType[];
    onRestore: (item: PaperType) => void;
    onDetail: (item: PaperType) => void;
}

const PaperTypeRestoreTable: React.FC<Props> = ({ page, limit, items, onRestore, onDetail }) => {
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
                        <Table.ColumnHeader>Mã Loại Giấy</Table.ColumnHeader>
                        <Table.ColumnHeader>Màu Giấy</Table.ColumnHeader>
                        <Table.ColumnHeader>Khổ Giấy</Table.ColumnHeader>
                        <Table.ColumnHeader>Định Lượng</Table.ColumnHeader>
                        <Table.ColumnHeader w="1%" textAlign="center">
                            Thao tác
                        </Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {items.map((item, index) => {
                        const color: PaperColor = item.paperColor as PaperColor;
                        return (
                            <Table.Row key={item._id ?? index}>
                                <Table.Cell textAlign="center">{(page - 1) * limit + index + 1}</Table.Cell>
                                <Table.Cell>{color?.code}/{item.width}/{item.grammage}</Table.Cell>
                                <Table.Cell>{color?.title}</Table.Cell>
                                <Table.Cell>{item.width}</Table.Cell>
                                <Table.Cell>{item.grammage}</Table.Cell>
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
                        )
                    })}
                </Table.Body>
            </Table.Root>
        </Table.ScrollArea>
    );
};

export default PaperTypeRestoreTable;