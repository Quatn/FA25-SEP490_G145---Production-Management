"use client";

import {
  useManufacturingTableDispatch,
  useManufacturingTableState,
} from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { Checkbox } from "@chakra-ui/react";

export default function ManufacturingOrderTableControl() {
  const { allowEdit } = useManufacturingTableState();
  const dispatch = useManufacturingTableDispatch();

  return (
    <Checkbox.Root checked={allowEdit == true || allowEdit === "checked"} onCheckedChange={(v) => dispatch({ type: "SET_ALLOW_EDIT", payload: v.checked })} colorPalette={"blue"}>
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label>Cho phép chỉnh sửa trên bảng</Checkbox.Label>
    </Checkbox.Root>
  );
}
