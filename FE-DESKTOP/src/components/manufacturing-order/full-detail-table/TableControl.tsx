"use client";

import { useDataTableDispatch, useDataTableSelector } from "@/components/ui/data-table/Provider";
import { Checkbox } from "@chakra-ui/react";

export default function ManufacturingOrderTableControl() {
  // const { useDispatch, useSelector } = ManufacturingOrderTableReducerStore;
  const dispatch = useDataTableDispatch();
  const allowEdit = useDataTableSelector(s => s.allowEdit)

  return (
    <Checkbox.Root checked={allowEdit == true} onCheckedChange={(v) => dispatch({ type: "SET_ALLOW_EDIT", payload: !!v.checked })} colorPalette={"blue"}>
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label>Cho phép chỉnh sửa trên bảng</Checkbox.Label>
    </Checkbox.Root>
  );
}
