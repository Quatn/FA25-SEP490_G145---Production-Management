import { Table, Group, Button, Icon } from "@chakra-ui/react";
import { FaEdit, FaEye } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import { PaperType } from "@/types/PaperType";
import PaperTypeDetailDialog from "./PaperTypeDetailDialog";
import { PaperColor } from "@/types/PaperColor";

interface PaperTypeTableProps {
    page: number;
    limit: number;
    types: PaperType[];
    onEdit: (type: PaperType) => void;
    onDetail: (type: PaperType) => void;
    onDelete: (type: PaperType) => void;
}

const PaperTypeTable = ({
    page,
    limit,
    types,
    onEdit,
    onDetail,
    onDelete,
}: PaperTypeTableProps) => {
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
                    {types.map((type, index) => {
                        const color: PaperColor = type.paperColor as PaperColor;
                        return (
                            <Table.Row key={type._id ?? index}>
                                <Table.Cell textAlign="center">{(page - 1) * limit + index + 1}</Table.Cell>
                                <Table.Cell>{color?.code}/{type.width}/{type.grammage}</Table.Cell>
                                <Table.Cell>{color?.title}</Table.Cell>
                                <Table.Cell>{type.width}</Table.Cell>
                                <Table.Cell>{type.grammage}</Table.Cell>
                                <Table.Cell>
                                    <Group gap={5}>
                                        <Button
                                            variant="surface"
                                            colorPalette="blue"
                                            onClick={() => onDetail(type)}
                                        >
                                            <Icon>
                                                <FaEye />
                                            </Icon>
                                            Chi tiết
                                        </Button>
                                        {/* <Button
                                            variant="surface"
                                            colorPalette="yellow"
                                            onClick={() => onEdit(type)}
                                        >
                                            <Icon>
                                                <FaEdit />
                                            </Icon>
                                            Sửa
                                        </Button> */}
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
                        )
                    })}
                </Table.Body>
            </Table.Root>
        </Table.ScrollArea>
    );
};

export default PaperTypeTable;
