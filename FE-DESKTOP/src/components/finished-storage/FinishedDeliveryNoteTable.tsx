import { DeliveryNoteItem } from "@/types/DeliveryNote";
import { FinishedGood } from "@/types/FinishedGood";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";
import { Badge, Button, NumberInput, Table } from "@chakra-ui/react";
import { useState } from "react";

interface Props {
    poitems: DeliveryNoteItem[];
    finishedGoods: FinishedGood[];
}

function getCurrentQuantityByPOI(
    poitems: DeliveryNoteItem[],
    finishedGoods: FinishedGood[]
) {
    const map: Record<string, number> = {};

    finishedGoods.forEach(finishedGood => {
        const poi = finishedGood.manufacturingOrder?.purchaseOrderItem as PurchaseOrderItem;
        const poiId = poi._id;
        map[poiId] = (map[poiId] || 0) + finishedGood.currentQuantity;
    });

    return poitems.map(item => ({
        item,
        currentQuantity: map[item.poitem._id] || 0
    }));
}

const FinishedDeliveryNoteTable: React.FC<Props> = ({ poitems, finishedGoods }) => {

    const [allocations, setAllocations] = useState<Record<string, number>>({});

    const data = getCurrentQuantityByPOI(poitems, finishedGoods);

    const isValid = data.every(d => {
        const allocated = allocations[d.item.poitem._id] || 0;
        return allocated <= d.currentQuantity && allocated === d.item.deliveredAmount;
    });
    return (
        <><Table.ScrollArea borderWidth="1px" rounded="md" mt={5}>
            <Table.Root size="lg" showColumnBorder stickyHeader interactive colorPalette="orange" tableLayout="auto" w="100%">
                <Table.Header>
                    <Table.Row background={'blue.100'}>
                        <Table.ColumnHeader w="1%" textAlign="center">STT</Table.ColumnHeader>
                        <Table.ColumnHeader>Mã mục hàng</Table.ColumnHeader>
                        <Table.ColumnHeader>Khách hàng</Table.ColumnHeader>
                        <Table.ColumnHeader>Mã đơn hàng</Table.ColumnHeader>
                        <Table.ColumnHeader>Mã hàng</Table.ColumnHeader>
                        <Table.ColumnHeader>Tồn kho</Table.ColumnHeader>
                        <Table.ColumnHeader>Số lượng xuất</Table.ColumnHeader>
                        <Table.ColumnHeader>Trạng thái</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {data.map((value, index) => {
                        const allocated = allocations[value.item.poitem._id] || 0;
                        const enough = allocated <= value.currentQuantity && allocated === value.item.deliveredAmount;
                        return (

                            <Table.Row key={value.item.poitem._id ?? index}>
                                <Table.Cell textAlign="center">{index + 1}</Table.Cell>
                                <Table.Cell>{value.item.poitem.code}</Table.Cell>
                                <Table.Cell>{value.item.poitem.subPurchaseOrder?.purchaseOrder?.customer?.code}</Table.Cell>
                                <Table.Cell>{value.item.poitem.subPurchaseOrder?.purchaseOrder?.code}</Table.Cell>
                                <Table.Cell>{value.item.poitem.ware?.code}</Table.Cell>
                                <Table.Cell>{value.currentQuantity}</Table.Cell>
                                <Table.Cell>
                                    <NumberInput.Root
                                        size="lg"
                                        width="200px"
                                        step={100}
                                        value={String(allocated)}
                                        onValueChange={(details) => {
                                            let inputValue = details.valueAsNumber;

                                            if (inputValue == null || isNaN(inputValue) || inputValue < 0) {
                                                inputValue = 0;
                                            }
                                            setAllocations(prev => ({
                                                ...prev,
                                                [value.item.poitem._id]: inputValue
                                            }))
                                        }

                                        }
                                    >
                                        <NumberInput.Input
                                            onKeyDown={(e) => {
                                                if (e.key === "-" || e.key === "e") {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onPaste={(e) => {
                                                const text = e.clipboardData.getData("text");
                                                if (text.includes("-")) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />

                                        <NumberInput.Control />
                                    </NumberInput.Root>
                                </Table.Cell>
                                <Table.Cell>
                                    {enough ? (
                                        <Badge colorPalette={'green'}>Đủ</Badge>
                                    ) : (
                                        <Badge colorPalette={'red'}>Thiếu</Badge>
                                    )}
                                </Table.Cell>
                            </Table.Row>
                        )
                    })}
                </Table.Body>

            </Table.Root>
        </Table.ScrollArea>
            <Button
                colorPalette="blue"
                disabled={!isValid}
            >
                Xác nhận xuất kho
            </Button>
        </>

    );
}

export default FinishedDeliveryNoteTable;