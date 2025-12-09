import { Table, Text, Group, Button, Icon } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip"
import { FaEdit, FaEye } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import { PaperSupplier } from "@/types/PaperSupplier";

interface PaperSupplierTableProps {
    page: number;
    limit: number;
    suppliers: PaperSupplier[];
    onEdit: (supplier: PaperSupplier) => void;
    onDetail: (supplier: PaperSupplier) => void;
    onDelete: (supplier: PaperSupplier) => void;
}

const PaperSupplierTable = ({
    page,
    limit,
    suppliers,
    onEdit,
    onDetail,
    onDelete,
}: PaperSupplierTableProps) => {
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
                    {suppliers.map((supplier, index) => (
                        <Table.Row key={supplier._id ?? index}>
                            <Table.Cell textAlign="center">{(page - 1) * limit + index + 1}</Table.Cell>
                            <Table.Cell>{supplier.code}</Table.Cell>
                            <Table.Cell>{supplier.name}</Table.Cell>

                            <Table.Cell>
                                <Tooltip content={supplier.address} showArrow>
                                    <Text
                                        overflow="hidden"
                                        textOverflow="ellipsis"
                                        maxLines={1}
                                        maxW="300px"
                                    >
                                        {supplier.address}
                                    </Text>
                                </Tooltip>
                            </Table.Cell>

                            <Table.Cell>{supplier.phone}</Table.Cell>
                            <Table.Cell>{supplier.email}</Table.Cell>

                            <Table.Cell>
                                <Group gap={5}>
                                    <Button
                                        variant="surface"
                                        colorPalette="blue"
                                        onClick={() => onDetail(supplier)}
                                    >
                                        <Icon>
                                            <FaEye />
                                        </Icon>
                                        Chi tiết
                                    </Button>
                                    <Button
                                        variant="surface"
                                        colorPalette="yellow"
                                        onClick={() => onEdit(supplier)}
                                    >
                                        <Icon>
                                            <FaEdit />
                                        </Icon>
                                        Sửa
                                    </Button>
                                    <Button
                                        variant="surface"
                                        colorPalette="red"
                                        onClick={() => onDelete(supplier)}
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

export default PaperSupplierTable;
