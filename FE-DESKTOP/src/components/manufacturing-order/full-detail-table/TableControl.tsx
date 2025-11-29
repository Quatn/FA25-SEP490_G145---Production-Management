"use client";

import { ManufacturingOrderTableReducerStore } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { Checkbox } from "@chakra-ui/react";

export default function ManufacturingOrderTableControl() {
  const { useDispatch, useSelector } = ManufacturingOrderTableReducerStore;
  const dispatch = useDispatch();
  const allowEdit = useSelector(s => s.allowEdit)

  return (
    <Checkbox.Root checked={allowEdit == true || allowEdit === "checked"} onCheckedChange={(v) => dispatch({ type: "SET_ALLOW_EDIT", payload: v.checked })} colorPalette={"blue"}>
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label>Cho phép chỉnh sửa trên bảng</Checkbox.Label>
    </Checkbox.Root>
  );
}
