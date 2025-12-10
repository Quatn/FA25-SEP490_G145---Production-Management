import { Customer } from "@/types/Customer";
import { DeliveryNoteFinishedGoodResponse } from "@/types/DeliveryNote";
import { formatDate } from "@/utils/dateUtils";
import { AbsoluteCenter, Accordion, Box, Button, Span, Table } from "@chakra-ui/react";
import FinishedDeliveryNoteTable from "./FinishedDeliveryNoteTable";
import { FinishedGood } from "@/types/FinishedGood";

interface Props {
    page: number;
    limit: number;
    items: DeliveryNoteFinishedGoodResponse[];
    finishedGoods: FinishedGood[];
    search: string;
}

const FinishedDeliveryNoteAccordion: React.FC<Props> = ({ page, limit, items, search, finishedGoods }) => {
    return (
        <>
            <Accordion.Root spaceY="4" variant="plain" multiple collapsible>
                {items.map((item, index) => (
                    <Accordion.Item key={index} value={String(item.code)}>
                        <Box position="relative">
                            <Accordion.ItemTrigger background={'yellow.100'} _open={{ bg: "green" }}>
                                <Span flex="1">Phiếu số {item.code} - KH {(item.customer as Customer).code} - Ngày {formatDate(item.createdAt)}</Span>
                                <Accordion.ItemIndicator />
                            </Accordion.ItemTrigger>
                            <AbsoluteCenter axis="vertical" insetEnd="0">
                                <Button variant="subtle" colorPalette="blue">
                                    Xuất phiếu
                                </Button>
                            </AbsoluteCenter>
                        </Box>
                        <Accordion.ItemContent>
                            <Accordion.ItemBody>
                                <FinishedDeliveryNoteTable poitems={item.poitems} finishedGoods={finishedGoods} />
                            </Accordion.ItemBody>
                        </Accordion.ItemContent>
                    </Accordion.Item>
                ))}
            </Accordion.Root>
        </>
    );
}

export default FinishedDeliveryNoteAccordion;