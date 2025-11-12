"use client";

import {
  useManufacturingPageDispatch,
  useManufacturingPageState,
} from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import { QueryOrdersWithUnmanufacturedItemsDto } from "@/types/DTO/purchase-order/query-orders-with-unmanufactured-items";
import { formatDateToDDMMYYYY } from "@/utils/dateUtils";
import {
  Accordion,
  Badge,
  Box,
  Button,
  CheckboxCard,
  Collapsible,
  Group,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuChevronRight } from "react-icons/lu";

export type PurchaseOrderItemSelectorItemProps = {
  po: Serialized<QueryOrdersWithUnmanufacturedItemsDto>;
};

export default function PurchaseOrderItemSelectorItem(
  props: PurchaseOrderItemSelectorItemProps,
) {
  const { groupType } = useManufacturingPageState();
  const dispatch = useManufacturingPageDispatch();

  const dates = props.po.subPurchaseOrders.map((subpo) =>
    new Date(subpo.subPurchaseOrder.deliveryDate)
  );
  const maxDate = formatDateToDDMMYYYY(dates.reduce((a, b) => {
    return a < b ? a : b;
  }));
  const minDate = formatDateToDDMMYYYY(dates.reduce((a, b) => {
    return a > b ? a : b;
  }));

  const subpoCount = props.po.subPurchaseOrders.length;
  const poiCount = props.po.subPurchaseOrders.map((subpo) =>
    subpo.purchaseOrderItems.length
  ).reduce((acc, i) => acc + i);

  return (
    <CheckboxCard.Root>
      <CheckboxCard.HiddenInput />
      <CheckboxCard.Control>
        <CheckboxCard.Content>
          <CheckboxCard.Label>
            Đơn Hàng: {props.po.purchaseOrder.code}, Khách Hàng:{" "}
            {props.po.purchaseOrder.customer?.code}
          </CheckboxCard.Label>
          <CheckboxCard.Description>
            <HStack>
              <Text>
                Ngày Đặt:{" "}
                {formatDateToDDMMYYYY(props.po.purchaseOrder.orderDate)}
              </Text>
              <Text>
                Ngày Giao:{" "}
                {(minDate === maxDate) ? minDate : `${minDate} đến ${maxDate}`}
              </Text>
            </HStack>
          </CheckboxCard.Description>

          <Text>
            {`${subpoCount} PO con, ${poiCount} PO item`}
          </Text>
        </CheckboxCard.Content>
        <CheckboxCard.Indicator />
      </CheckboxCard.Control>
      <CheckboxCard.Addon>
        <Collapsible.Root>
          <Collapsible.Trigger
            paddingY="3"
            display="flex"
            gap="2"
            alignItems="center"
          >
            <HStack>
              <Box transition="transform 0.2s">
                <LuChevronRight />
              </Box>
            </HStack>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <Stack padding="4" borderWidth="1px">
            </Stack>
          </Collapsible.Content>
        </Collapsible.Root>
      </CheckboxCard.Addon>
    </CheckboxCard.Root>
  );

  return (
    <Box border="md" backgroundColor={"gray.50"}>
      <Collapsible.Root>
        <Collapsible.Trigger
          paddingY="3"
          display="flex"
          gap="2"
          alignItems="center"
        >
          <HStack>
            <Text>Đơn Hàng: {props.po.purchaseOrder.code}</Text>
            <Text>Khách Hàng: {props.po.purchaseOrder.customer?.code}</Text>
            <Text>
              Ngày Đặt: {formatDateToDDMMYYYY(props.po.purchaseOrder.orderDate)}
            </Text>
            <Text>
              Ngày Giao:{" "}
              {(minDate === maxDate) ? minDate : `${minDate} đến ${maxDate}`}
            </Text>
            <Text>
              {`${subpoCount} PO con, ${poiCount} PO item`}
            </Text>
            <Box transition="transform 0.2s">
              <LuChevronRight />
            </Box>
          </HStack>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <Stack padding="4" borderWidth="1px">
          </Stack>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
}
