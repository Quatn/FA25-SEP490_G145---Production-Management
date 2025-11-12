"use client";

import {
  useManufacturingPageDispatch,
  useManufacturingPageState,
} from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import { QueryOrdersWithUnmanufacturedItemsDto_SubPurchaseOrder } from "@/types/DTO/purchase-order/query-orders-with-unmanufactured-items";
import { formatDateToDDMMYYYY } from "@/utils/dateUtils";
import {
  Box,
  Button,
  CheckboxCard,
  Collapsible,
  Group,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuChevronDown } from "react-icons/lu";
import PurchaseOrderItemPickerTable from "./PurchaseOrderItemTable";

export type PurchaseOrderItemSelectorSubItemProps = {
  subpo: Serialized<QueryOrdersWithUnmanufacturedItemsDto_SubPurchaseOrder>;
};

export default function PurchaseOrderItemSelectorSubItem(
  props: PurchaseOrderItemSelectorSubItemProps,
) {
  const { groupType } = useManufacturingPageState();
  const dispatch = useManufacturingPageDispatch();

  const poiCount = props.subpo.purchaseOrderItems.length;

  return (
    <CheckboxCard.Root>
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
              <Button variant="outline" size="sm" flexGrow={1}>
                <Collapsible.Context>
                  {(api) => (api.open ? "Show Less" : "Show More")}
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
            />
          </Collapsible.Content>
        </Collapsible.Root>
      </CheckboxCard.Addon>
    </CheckboxCard.Root>
  );
}
