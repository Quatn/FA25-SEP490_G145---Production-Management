"use client";

import {
  ManufacturingOrderCreatePageTreeNode,
  useManufacturingOrderCreatePageDispatch,
  useManufacturingOrderCreatePageState,
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
  Highlight,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";
import PurchaseOrderItemSelectorSubItem from "./PurchaseOrderItemSelectorSubItem";
import check from "check-types";
import { useMemo } from "react";

export type PurchaseOrderItemSelectorItemProps = {
  po: Serialized<QueryOrdersWithUnmanufacturedItemsDto>;
  tree: ManufacturingOrderCreatePageTreeNode[];
};

export default function PurchaseOrderItemSelectorItem(
  props: PurchaseOrderItemSelectorItemProps,
) {
  const { groupType, search, checkedOrderNodes, indeterminateOrderNodes } =
    useManufacturingOrderCreatePageState();
  const dispatch = useManufacturingOrderCreatePageDispatch();

  const orderId = props.po.purchaseOrder._id;
  const checked = checkedOrderNodes[orderId] || false;
  const indeterminate = indeterminateOrderNodes[orderId] ||
    false;

  const handleToggle = () => {
    dispatch({
      type: "TOGGLE_ORDER_TREE_NODE",
      payload: { id: orderId, tree: props.tree },
    });
  }

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

  const sorted = useMemo(() => {
    return props.po.subPurchaseOrders.toSorted((a, b) => b.unmanufacturedItemCount - a.unmanufacturedItemCount)
  }, [props.po.subPurchaseOrders])

  return (
    <CheckboxCard.Root
      checked={indeterminate ? "indeterminate" : checked}
      onCheckedChange={() => handleToggle()}
      colorPalette={"orange"}
      bgColor={"colorPalette.subtle"}
    >
      <CheckboxCard.HiddenInput />
      <CheckboxCard.Control>
        <CheckboxCard.Content
          flexDir={"row"}
          justifyContent={"space-between"}
          gap={3}
        >
          <Box>
            <CheckboxCard.Label>
              <Text>
                Đơn Hàng:{"  "}
                <Highlight
                  ignoreCase
                  matchAll
                  query={search}
                  styles={{
                    bg: "yellow.subtle",
                    color: "orange.fg",
                  }}
                >
                  {props.po.purchaseOrder.code}
                </Highlight>
              </Text>
              <Text>
                , Khách Hàng:{"  "}
                <Highlight
                  ignoreCase
                  matchAll
                  query={search}
                  styles={{ bg: "yellow.subtle", color: "orange.fg" }}
                >
                  {check.assigned(props.po.purchaseOrder.customer)
                    ? props.po.purchaseOrder.customer!.code
                    : ""}
                </Highlight>
              </Text>
            </CheckboxCard.Label>
            <CheckboxCard.Description>
              <HStack>
                <Text>
                  Ngày Đặt:{" "}
                  {formatDateToDDMMYYYY(props.po.purchaseOrder.orderDate)}
                </Text>
                <Text>
                  Ngày Giao:{" "}
                  {(minDate === maxDate)
                    ? minDate
                    : `${minDate} đến ${maxDate}`}
                </Text>
              </HStack>
            </CheckboxCard.Description>
          </Box>
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
            asChild
          >
            <HStack>
              <Button variant="outline" size="sm" flexGrow={1} bg={"colorPalette.contrast"}>
                <Collapsible.Context>
                  {(api) => (api.open ? "Đóng" : "Mở rộng")}
                </Collapsible.Context>
                <Collapsible.Indicator
                  transition="transform 0.2s"
                  _open={{ transform: "rotate(180deg)" }}
                >
                  <LuChevronDown />
                </Collapsible.Indicator>
              </Button>
            </HStack>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <Stack padding="4" borderWidth="1px">
              {sorted.map((subpo) => (
                <PurchaseOrderItemSelectorSubItem
                  key={subpo.subPurchaseOrder.code}
                  subpo={subpo}
                  tree={props.tree}
                />
              ))}
            </Stack>
          </Collapsible.Content>
        </Collapsible.Root>
      </CheckboxCard.Addon>
    </CheckboxCard.Root>
  );
}
