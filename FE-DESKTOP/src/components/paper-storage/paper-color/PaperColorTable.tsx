import { Table, Group, Button, Icon } from "@chakra-ui/react";
import { FaEdit, FaEye } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import { PaperColor } from "@/types/PaperColor";

interface PaperColorTableProps {
    page: number;
    limit: number;
    colors: PaperColor[];
    onEdit: (color: PaperColor) => void;
    onDetail: (color: PaperColor) => void;
    onDelete: (color: PaperColor) => void;
}

const PaperColorTable = ({
    page,
    limit,
    colors,
    onEdit,
    onDetail,
    onDelete,
}: PaperColorTableProps) => {
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
                        <Table.ColumnHeader>Mã Màu Giấy</Table.ColumnHeader>
                        <Table.ColumnHeader>Tiêu Đề Màu Giấy</Table.ColumnHeader>
                        <Table.ColumnHeader w="1%" textAlign="center">
                            Thao tác
                        </Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {colors.map((color, index) => (
                        <Table.Row key={color._id ?? index}>
                            <Table.Cell textAlign="center">{(page - 1) * limit + index + 1}</Table.Cell>
                            <Table.Cell>{color.code}</Table.Cell>
                            <Table.Cell>{color.title}</Table.Cell>

                            <Table.Cell>
                                <Group gap={5}>
                                    <Button
                                        variant="surface"
                                        colorPalette="blue"
                                        onClick={() => onDetail(color)}
                                    >
                                        <Icon>
                                            <FaEye />
                                        </Icon>
                                        Chi tiết
                                    </Button>
                                    <Button
                                        variant="surface"
                                        colorPalette="yellow"
                                        onClick={() => onEdit(color)}
                                    >
                                        <Icon>
                                            <FaEdit />
                                        </Icon>
                                        Sửa
                                    </Button>
                                    <Button
                                        variant="surface"
                                        colorPalette="red"
                                        onClick={() => onDelete(color)}
                                    >
                                        <Icon>
                                            <FaTrashCan />
                                        </Icon>
                                        Xóa
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

export default PaperColorTable;
