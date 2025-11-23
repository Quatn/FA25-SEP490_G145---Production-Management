"use client";

import { useTableDispatch, useTableSelector } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { Checkbox } from "@chakra-ui/react";

export default function ManufacturingOrderTableControl() {
  const allowEdit = useTableSelector(s => s.allowEdit);
  const dispatch = useTableDispatch();

  return (
    <Checkbox.Root checked={allowEdit == true || allowEdit === "checked"} onCheckedChange={(v) => dispatch({ type: "SET_ALLOW_EDIT", payload: v.checked })} colorPalette={"blue"}>
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label>Cho phép chỉnh sửa trên bảng</Checkbox.Label>
    </Checkbox.Root>
  );
}
