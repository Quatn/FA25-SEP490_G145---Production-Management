import { Table, Group, Button, Icon, List } from "@chakra-ui/react";
import { FaEdit, FaEye } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import { FluteCombination } from "@/types/FluteCombination";

interface Props {
    page: number;
    limit: number;
    items: FluteCombination[];
    onEdit: (item: FluteCombination) => void;
    onDelete: (item: FluteCombination) => void;
    onDetail: (item: FluteCombination) => void;
}

const FluteCombinationTable: React.FC<Props> = ({ page, limit, items, onEdit, onDelete, onDetail }) => {
    const fluteLabel = (value: string) => {
        switch (value) {
            case 'EFlute':
                return "Sóng E";
            case 'EBLiner':
                return "Lớp giữa EB";
            case 'BFlute':
                return "Sóng B";
            case 'BACLiner':
                return "Lớp giữa BAC";
            case 'ACFlute':
                return "Sóng AC";
            case 'faceLayer':
                return "Lớp mặt";
            case 'backLayer':
                return "Lớp đáy";
            default:
                return;
        }
    }
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
                        <Table.ColumnHeader>Tổ hợp sóng</Table.ColumnHeader>
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
                                <List.Root>
                                    {item.flutes.map((item, index) => (
                                        <List.Item key={index}>
                                            {fluteLabel(item)}
                                        </List.Item>
                                    ))}
                                </List.Root>
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
                                        colorPalette="yellow"
                                        onClick={() => onEdit(item)}
                                    >
                                        <Icon>
                                            <FaEdit />
                                        </Icon>
                                        Sửa
                                    </Button>
                                    <Button
                                        variant="surface"
                                        colorPalette="red"
                                        onClick={() => onDelete(item)}
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

export default FluteCombinationTable;