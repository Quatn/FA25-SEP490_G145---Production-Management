"use client";

import {
  useManufacturingPageDispatch,
  useManufacturingPageState,
} from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import { Button, Group, HStack } from "@chakra-ui/react";

export default function PurchaseOrderItemSelectorSubItem() {
  const { groupType } = useManufacturingPageState();
  const dispatch = useManufacturingPageDispatch();

  return (
    <HStack>
      <Group attached>
        <Button
          colorPalette={"teal"}
          variant={groupType === "PO" ? "solid" : "outline"}
          onClick={() =>
            dispatch({
              type: "SET_GROUP_TYPE",
              payload: "PO",
            })}
        >
          Theo trang
        </Button>
        <Button
          colorPalette={"teal"}
          variant={groupType === "POI" ? "solid" : "outline"}
          onClick={() => dispatch({ type: "SET_GROUP_TYPE", payload: "POI" })}
        >
          Không phân trang
        </Button>
      </Group>
    </HStack>
  );
}
