import { Table, Group, Button, Icon, Text } from "@chakra-ui/react";
import { FaEdit, FaEye } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import { PrintColor } from "@/types/PrintColor";
import { Tooltip } from "@/components/ui/tooltip"

interface PrintColorTableProps {
    page: number;
    limit: number;
    items: PrintColor[];
    onEdit: (c: PrintColor) => void;
    onDetail: (c: PrintColor) => void;
    onDelete: (c: PrintColor) => void;
}

const PrintColorTable = ({ page, limit, items, onEdit, onDetail, onDelete }: PrintColorTableProps) => {
    return (
        <Table.ScrollArea borderWidth="1px" rounded="md" mt={5}>
            <Table.Root size="lg" showColumnBorder stickyHeader interactive colorPalette="orange" tableLayout="auto" w="100%">
                <Table.Header>
                    <Table.Row background={'blue.100'}>
                        <Table.ColumnHeader w="1%" textAlign="center">STT</Table.ColumnHeader>
                        <Table.ColumnHeader>Mã Màu In</Table.ColumnHeader>
                        <Table.ColumnHeader>Mô tả</Table.ColumnHeader>
                        <Table.ColumnHeader w="1%" textAlign="center">Thao tác</Table.ColumnHeader>
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
                                    <Button variant="surface" colorPalette="blue" onClick={() => onDetail(item)}>
                                        <Icon><FaEye /></Icon> Chi tiết
                                    </Button>
                                    <Button variant="surface" colorPalette="yellow" onClick={() => onEdit(item)}>
                                        <Icon><FaEdit /></Icon> Sửa
                                    </Button>
                                    <Button variant="surface" colorPalette="red" onClick={() => onDelete(item)}>
                                        <Icon><FaTrashCan /></Icon> Xóa
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

export default PrintColorTable;
