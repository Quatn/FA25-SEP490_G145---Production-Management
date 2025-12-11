import { Table, Text, Group, Button, Icon } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip"
import { FaEdit, FaEye } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import { Customer } from "@/types/Customer";

interface CustomerTableProps {
    page: number;
    limit: number;
    customers: Customer[];
    onEdit: (customer: Customer) => void;
    onDetail: (customer: Customer) => void;
    onDelete: (customer: Customer) => void;
}

const CustomerTable = ({
    page,
    limit,
    customers,
    onEdit,
    onDetail,
    onDelete,
}: CustomerTableProps) => {
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
                        <Table.ColumnHeader>Mã khách hàng</Table.ColumnHeader>
                        <Table.ColumnHeader>Tên khách hàng</Table.ColumnHeader>
                        <Table.ColumnHeader>Số điện thoại</Table.ColumnHeader>
                        <Table.ColumnHeader>Email</Table.ColumnHeader>
                        <Table.ColumnHeader>Địa chỉ</Table.ColumnHeader>
                        <Table.ColumnHeader w="1%" textAlign="center">
                            Thao tác
                        </Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {customers.map((customer, index) => (
                        <Table.Row key={customer._id ?? index}>
                            <Table.Cell textAlign="center">{(page - 1) * limit + index + 1}</Table.Cell>
                            <Table.Cell>{customer.code}</Table.Cell>
                            <Table.Cell>
                                <Tooltip content={customer.name} showArrow>
                                    <Text
                                        overflow="hidden"
                                        textOverflow="ellipsis"
                                        maxLines={1}
                                        maxW="300px"
                                    >
                                        {customer.name}
                                    </Text>
                                </Tooltip>
                            </Table.Cell>
                            <Table.Cell>{customer.contactNumber}</Table.Cell>
                            <Table.Cell>{customer.email}</Table.Cell>
                            <Table.Cell>
                                <Tooltip content={customer.address} showArrow>
                                    <Text
                                        overflow="hidden"
                                        textOverflow="ellipsis"
                                        maxLines={1}
                                        maxW="300px"
                                    >
                                        {customer.address}
                                    </Text>
                                </Tooltip>
                            </Table.Cell>
                            <Table.Cell>
                                <Group gap={5}>
                                    <Button
                                        variant="surface"
                                        colorPalette="blue"
                                        onClick={() => onDetail(customer)}
                                    >
                                        <Icon>
                                            <FaEye />
                                        </Icon>
                                        Chi tiết
                                    </Button>
                                    <Button
                                        variant="surface"
                                        colorPalette="yellow"
                                        onClick={() => onEdit(customer)}
                                    >
                                        <Icon>
                                            <FaEdit />
                                        </Icon>
                                        Sửa
                                    </Button>
                                    <Button
                                        variant="surface"
                                        colorPalette="red"
                                        onClick={() => onDelete(customer)}
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

export default CustomerTable;
