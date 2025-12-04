import React from "react";
import { Table} from "@chakra-ui/react";
import { OrderFinishingProcess } from "@/types/OrderFinishingProcess";


interface Props {
    page: number;
    limit: number;
    items: OrderFinishingProcess[];
    search: string;
}

const OrderFinishingProcessTable: React.FC<Props> = ({ page, limit, items, search }) => {

    return (
        <Table.ScrollArea borderWidth="1px" width={"100%"} rounded="md" mt={5}>
            <Table.Root
                size="lg"
                stickyHeader
                interactive
                showColumnBorder
                colorPalette="orange"
                tableLayout="auto"
                w="100%"
                border={"1px solid black"}
                css={{
                    "& td, & th": {
                        border: "1px solid black"
                    },
                }}>
                <Table.Header>

                    <Table.Row>
                        <Table.ColumnHeader rowSpan={2} w="1%" textAlign="center">
                            STT
                        </Table.ColumnHeader>

                        <Table.ColumnHeader rowSpan={2}>
                            Mã gia công
                        </Table.ColumnHeader>

                        <Table.ColumnHeader rowSpan={2}>
                            Loại gia công
                        </Table.ColumnHeader>

                        <Table.ColumnHeader rowSpan={2}>
                            Lệnh
                        </Table.ColumnHeader>

                        <Table.ColumnHeader rowSpan={2}>
                            Đơn hàng
                        </Table.ColumnHeader>

                        <Table.ColumnHeader rowSpan={2}>
                            Khách hàng
                        </Table.ColumnHeader>

                        <Table.ColumnHeader rowSpan={2}>
                            Mã hàng
                        </Table.ColumnHeader>

                        <Table.ColumnHeader rowSpan={2}>Số lớp</Table.ColumnHeader>
                        <Table.ColumnHeader colSpan={3} textAlign="center">
                            Kích thước (mm)
                        </Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Tổng số lượng cần sản xuất</Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Tổng số lượng đã sản xuất</Table.ColumnHeader>
                        <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} rowSpan={2}>Trạng thái</Table.ColumnHeader>
                        <Table.ColumnHeader rowSpan={2} textAlign={"center"}>Thao tác</Table.ColumnHeader>

                    </Table.Row>
                    <Table.Row >
                        <Table.ColumnHeader colSpan={1}>Dài</Table.ColumnHeader>
                        <Table.ColumnHeader colSpan={1}>Rộng</Table.ColumnHeader>
                        <Table.ColumnHeader colSpan={1}> Cao</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>

                <Table.Body>

                </Table.Body>
            </Table.Root>
        </Table.ScrollArea>
    );
};

export default OrderFinishingProcessTable;
