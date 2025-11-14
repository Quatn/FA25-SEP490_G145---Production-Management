import { Table, Text, Group, Button, Icon } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip"
import { FaEdit } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import { WareManufacturingProcessType } from "@/types/WareManufacturingProcessType";
import WareManufacturingProcessTypeDetailDialog from "./WareManufacturingProcessTypeDetailDialog";

interface Props {
    page: number;
    limit: number;
    items: WareManufacturingProcessType[];
    onEdit: (item: WareManufacturingProcessType) => void;
    onDelete: (item: WareManufacturingProcessType) => void;
}

const WareManufacturingProcessTypeTable = ({ page, limit, items, onEdit, onDelete }: Props) => {
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
                        <Table.ColumnHeader>Mã</Table.ColumnHeader>
                        <Table.ColumnHeader>Tên</Table.ColumnHeader>
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
                                <Group gap={5}>
                                    <WareManufacturingProcessTypeDetailDialog
                                        item={item}
                                    />
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

export default WareManufacturingProcessTypeTable;