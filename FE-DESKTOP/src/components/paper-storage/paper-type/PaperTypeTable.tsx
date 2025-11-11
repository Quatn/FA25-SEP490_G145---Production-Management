import { Table, Text, Group, Button, Icon } from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import { PaperType } from "@/types/PaperType";
import PaperTypeDetailDialog from "./PaperTypeDetailDialog";

interface PaperTypeTableProps {
    page: number;
    limit: number;
    types: PaperType[];
    onEdit: (color: PaperType) => void;
    onDelete: (color: PaperType) => void;
}

const PaperTypeTable = ({
    page,
    limit,
    types,
    onEdit,
    onDelete,
}: PaperTypeTableProps) => {
    return (
        <Table.ScrollArea
            borderWidth="1px"
            rounded="md"
            height="701px"
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
                        <Table.ColumnHeader>Định lượng</Table.ColumnHeader>
                        <Table.ColumnHeader w="1%" textAlign="center">
                            Thao tác
                        </Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {types.map((type, index) => (
                        <Table.Row key={type._id ?? index}>
                            <Table.Cell textAlign="center">{(page - 1) * limit + index + 1}</Table.Cell>
                            <Table.Cell>{type.paperColor.code}/{type.width}/{type.grammage}</Table.Cell>
                            <Table.Cell>{type.paperColor.title}</Table.Cell>
                            <Table.Cell>{type.width}</Table.Cell>
                            <Table.Cell>{type.grammage}</Table.Cell>
                            <Table.Cell>
                                <Group gap={5}>
                                    <PaperTypeDetailDialog
                                        type={type}
                                    />
                                    <Button
                                        variant="surface"
                                        colorPalette="yellow"
                                        onClick={() => onEdit(type)}
                                    >
                                        <Icon>
                                            <FaEdit />
                                        </Icon>
                                        Sửa
                                    </Button>
                                    <Button
                                        variant="surface"
                                        colorPalette="red"
                                        onClick={() => onDelete(type)}
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

export default PaperTypeTable;
