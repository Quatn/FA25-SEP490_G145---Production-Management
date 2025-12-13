import React from "react";
import { Button, ButtonGroup, Flex, Highlight, Icon, IconButton, Input, InputGroup, Pagination, Table } from "@chakra-ui/react";
import { OrderFinishingProcess } from "@/types/OrderFinishingProcess";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { formatDate } from "@/utils/dateUtils";
import { safeGet } from "@/utils/storagesUtils";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { FaEdit } from "react-icons/fa";
import { OrderFinishingProcessStatus } from "@/types/enums/OrderFinishingProcessStatus";
import { VscDebugStart, VscRunCoverage } from "react-icons/vsc";
import { ManufacturingOrderDetailsDialogReducerStore } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";


interface Props {
    tableStatus: OrderFinishingProcessStatus;
    page: number;
    limit: number;
    items: OrderFinishingProcess[];
    totalPages: number;
    handlePagination: (page: number) => void;
    handleUpdate: (status: OrderFinishingProcessStatus, ofp: OrderFinishingProcess) => void;
}

const OrderFinishingProcessTable: React.FC<Props> = ({
    tableStatus, page, limit, items, totalPages, handlePagination, handleUpdate
}) => {

  const dialogDispatch = ManufacturingOrderDetailsDialogReducerStore.useDispatch();

    return (
        <>

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

                        <Table.Row background={'blue.100'}>
                            <Table.ColumnHeader w="1%" textAlign="center">
                                STT
                            </Table.ColumnHeader>

                            <Table.ColumnHeader >
                                Lệnh
                            </Table.ColumnHeader>

                            <Table.ColumnHeader >
                                Mã kế hoạch
                            </Table.ColumnHeader>

                            <Table.ColumnHeader >
                                Loại gia công
                            </Table.ColumnHeader>

                            <Table.ColumnHeader >
                                Lịch gia công
                            </Table.ColumnHeader>

                            <Table.ColumnHeader >
                                Đơn hàng
                            </Table.ColumnHeader>

                            <Table.ColumnHeader >
                                Khách hàng
                            </Table.ColumnHeader>

                            <Table.ColumnHeader >
                                Mã hàng
                            </Table.ColumnHeader>

                            <Table.ColumnHeader whiteSpace={"normal"} >Yêu cầu</Table.ColumnHeader>
                            <Table.ColumnHeader whiteSpace={"normal"} >Sản lượng</Table.ColumnHeader>
                            <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} >Trạng thái</Table.ColumnHeader>
                            <Table.ColumnHeader whiteSpace={"normal"} w={"1%"} >Ghi chú</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign={"center"}>Thao tác</Table.ColumnHeader>

                        </Table.Row>
                    </Table.Header>

                    <Table.Body>

                        {items.map((item, index) => {
                            const mo = item.manufacturingOrder as ManufacturingOrder;
                            const poItem = mo?.purchaseOrderItem as PurchaseOrderItem;
                            return (
                                <Table.Row key={item._id ?? index}>
                                    <Table.Cell textAlign="center">
                                        {(page - 1) * limit + index + 1}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {mo?.code ?? "-"}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {item?.code ?? "-"}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {item?.wareFinishingProcessType.name ?? "-"}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {formatDate(mo?.manufacturingDate)}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {safeGet(poItem, "subPurchaseOrder.purchaseOrder.code")}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {safeGet(poItem, "subPurchaseOrder.purchaseOrder.customer.code")}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {safeGet(poItem, "ware.code")}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {item.requiredAmount}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {item.completedAmount}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {item.status == 'SCHEDULED' ?
                                            'Đang chờ' : item.status == 'INPRODUCTION' ?
                                                'Đang chạy' : 'Hoàn thành'}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {item.note}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {tableStatus != OrderFinishingProcessStatus.FinishedProduction &&
                                            <Button
                                                variant="surface"
                                                colorPalette={tableStatus == OrderFinishingProcessStatus.Scheduled ? 'blue' : 'green'}
                                                onClick={() => handleUpdate(tableStatus, item)}
                                            >
                                                <Icon>
                                                    {tableStatus == OrderFinishingProcessStatus.Scheduled ? <VscDebugStart /> : <FaEdit />}

                                                </Icon>
                                                {tableStatus == OrderFinishingProcessStatus.Scheduled ? 'Chạy kế hoạch' : 'Hoàn thành'}
                                            </Button>
                                        }
                                        
                                            <Button
                                                variant="surface"
                                                colorPalette={"gray"}
                                                ms={2}
                                                onClick={() => dialogDispatch({type: "OPEN_DIALOG_WITH_ORDER", payload: { order: item.manufacturingOrder as unknown as Serialized<ManufacturingOrder> }})}
                                            >
                                                Chi tiết lệnh
                                            </Button>

                                    </Table.Cell>
                                </Table.Row>
                            );
                        })
                        }
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>

            <Pagination.Root
                count={totalPages * limit}
                pageSize={limit}
                page={page}
                siblingCount={2}
                onPageChange={(e) => handlePagination(e.page)}
            >
                <ButtonGroup variant="ghost" size="sm" mt={4} justifyContent="center">
                    <Pagination.PrevTrigger asChild>
                        <IconButton aria-label="Previous page">
                            <HiChevronLeft />
                        </IconButton>
                    </Pagination.PrevTrigger>

                    <Pagination.Items render={(pageItem) => (
                        <IconButton
                            key={pageItem.value}
                            variant={{ base: 'ghost', _selected: 'outline' }}
                            onClick={() => handlePagination(pageItem.value)}>
                            {pageItem.value}
                        </IconButton>
                    )} />

                    <Pagination.NextTrigger asChild>
                        <IconButton aria-label="Next page">
                            <HiChevronRight />
                        </IconButton>
                    </Pagination.NextTrigger>
                </ButtonGroup>
            </Pagination.Root>
        </>
    );
};

export default OrderFinishingProcessTable;
