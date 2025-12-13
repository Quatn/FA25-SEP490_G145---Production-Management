"use client";

import { ManufacturingOrderCreatePageReducerStore } from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import { Button, Group, HStack } from "@chakra-ui/react";

export default function PurchaseOrderItemListGroupTypeControl() {
  const { useSelector, useDispatch } = ManufacturingOrderCreatePageReducerStore;
  const dispatch = useDispatch();
  const groupType = useSelector(s => s.groupType);

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
          Gộp theo PO
        </Button>
        <Button
          colorPalette={"teal"}
          variant={groupType === "POI" ? "solid" : "outline"}
          onClick={() => dispatch({ type: "SET_GROUP_TYPE", payload: "POI" })}
        >
          Không gộp
        </Button>
      </Group>
    </HStack>
  );
}
