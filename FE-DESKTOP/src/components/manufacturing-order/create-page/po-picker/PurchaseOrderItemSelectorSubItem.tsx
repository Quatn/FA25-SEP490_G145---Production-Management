"use client";

import {
  ManufacturingOrderCreatePageReducerStore,
  ManufacturingOrderCreatePageTreeNode,
} from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import { QueryOrdersWithUnmanufacturedItemsDto_SubPurchaseOrder } from "@/types/DTO/purchase-order/query-orders-with-unmanufactured-items";
import { formatDateToDDMMYYYY } from "@/utils/dateUtils";
import {
  Box,
  Button,
  CheckboxCard,
  Collapsible,
  HStack,
  Text,
} from "@chakra-ui/react";
import { LuChevronDown } from "react-icons/lu";
import PurchaseOrderItemPickerTable from "./PurchaseOrderItemTable";

export type PurchaseOrderItemSelectorSubItemProps = {
  subpo: Serialized<QueryOrdersWithUnmanufacturedItemsDto_SubPurchaseOrder>;
  tree: ManufacturingOrderCreatePageTreeNode[];
};

export default function PurchaseOrderItemSelectorSubItem(
  props: PurchaseOrderItemSelectorSubItemProps,
) {
  const { useSelector, useDispatch } = ManufacturingOrderCreatePageReducerStore;
  const dispatch = useDispatch();
  const checkedOrderNodes = useSelector(s => s.checkedOrderNodes);
  const indeterminateOrderNodes = useSelector(s => s.indeterminateOrderNodes);

  const orderId = props.subpo.subPurchaseOrder._id;
  const checked = checkedOrderNodes[orderId] || false;
  const indeterminate = indeterminateOrderNodes[orderId] ||
    false;

  const handleToggle = () => {
    dispatch({
      type: "TOGGLE_ORDER_TREE_NODE",
      payload: { id: orderId, tree: props.tree },
    });
  }

  const poiCount = props.subpo.purchaseOrderItems.length;

  return (
    <CheckboxCard.Root
      checked={props.subpo.unmanufacturedItemCount < 1 ? true : (indeterminate ? "indeterminate" : checked)}
      onCheckedChange={() => handleToggle()}
      colorPalette={props.subpo.unmanufacturedItemCount < 1 ? "green" : "yellow"}
      bgColor={"colorPalette.subtle"}
      disabled={props.subpo.unmanufacturedItemCount < 1}
    >
      <CheckboxCard.HiddenInput />
      <CheckboxCard.Control>
        <CheckboxCard.Content
          flexDir={"row"}
          justifyContent={"space-between"}
          gap={3}
        >
          <Text>
            {`Mã PO con: ${props.subpo.subPurchaseOrder.code}`}
          </Text>
          <Text>
            {`Ngày giao: ${formatDateToDDMMYYYY(props.subpo.subPurchaseOrder.deliveryDate)
              }`}
          </Text>
          <Box flexGrow={1} />
          <Text>
            {`${poiCount} PO item`}
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
              <Button variant="outline" size="sm" flexGrow={1} colorPalette={"gray"} bg={"colorPalette.contrast"}>
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
            <PurchaseOrderItemPickerTable
              items={props.subpo.purchaseOrderItems}
              tree={props.tree}
            />
          </Collapsible.Content>
        </Collapsible.Root>
      </CheckboxCard.Addon>
    </CheckboxCard.Root>
  );
}
