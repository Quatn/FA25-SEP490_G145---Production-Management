"use client";

import { useDataTableDispatch, useDataTableSelector } from "@/components/ui/data-table/Provider";
import { Checkbox, HStack, Stack } from "@chakra-ui/react";
import ManufacturingOrderFullDetailTableSortMenu from "./SortMenu";
import { useAppSelector } from "@/service/hooks";
import { UserState } from "@/types/UserState";
import DataLoading from "@/components/common/DataLoading";
import check from "check-types";
import { AnyAccessPrivileges } from "@/types/AccessPrivileges";

// Also consider putting these privilege arrays in another file to reuse them or smt
const EDIT_PRIVS: AnyAccessPrivileges[] = ["system-admin", "system-readWrite", "production-admin", "production-readWrite"]

export default function ManufacturingOrderTableControl() {
  // const { useDispatch, useSelector } = ManufacturingOrderTableReducerStore;
  const dispatch = useDataTableDispatch();
  const allowEdit = useDataTableSelector(s => s.allowEdit)

  const hydrating: boolean = useAppSelector((state) =>
    state.auth.hydrating
  );
  const userState: UserState | null = useAppSelector((state) =>
    state.auth.userState
  );

  // render the common spinner element while system is fetching (put in just in case since the main layout already display the spinner while checking user state)
  if (hydrating) {
    return <DataLoading />
  }

  // if userState.accessPrivileges is not an non-empty array of access privileges AND userState.accessPrivileges does not contain at least one privilege listed
  // in EDIT_PRIVS, enable the checkbox
  const disabled = !(check.nonEmptyArray(userState?.accessPrivileges) && EDIT_PRIVS.find(priv => userState!.accessPrivileges.includes(priv)))

  return (
    <Stack>
      <HStack>
        <Checkbox.Root disabled={disabled} checked={allowEdit == true} onCheckedChange={(v) => dispatch({ type: "SET_ALLOW_EDIT", payload: !!v.checked })} colorPalette={"blue"}>
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>Cho phép chỉnh sửa trên bảng</Checkbox.Label>
        </Checkbox.Root>
      </HStack>
      <HStack>
        <ManufacturingOrderFullDetailTableSortMenu />
      </HStack>
    </Stack>
  );
}
