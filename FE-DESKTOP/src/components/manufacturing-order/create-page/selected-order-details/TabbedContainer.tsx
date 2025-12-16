"use client";

import { Box, Button, Center, Group, HStack, Stack, Tabs, Text } from "@chakra-ui/react";
import { LuFolder, LuSquareCheck, LuUser } from "react-icons/lu";
import CreatePageManufacturingOrderTable from "./details-table-tab/Table";
import MaterialRequirementContainer from "./material-requirement-summary-tab/Container";
import { useGetDraftFullDetailManufacturingOrdersByPoiIdsQuery } from "@/service/api/manufacturingOrderApiSlice";
import { FullDetailManufacturingOrderDTO } from "@/types/DTO/FullDetailManufactureOrder";
import React, { createContext, Dispatch, useContext, useEffect, useReducer } from "react";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { ManufacturingOrderCreatePageReducerStore } from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import DataLoading from "@/components/common/DataLoading";
import DataFetchError from "@/components/common/DataFetchError";
import check from "check-types";

type SelectedOrdersState = {
  selectedManufacturingOrders: Serialized<ManufacturingOrder>[] | undefined
}

type SelectedOrdersAction =
  | { type: "SET_ORDERS"; payload: Serialized<ManufacturingOrder>[] | undefined }
  | { type: "RESET" };

const initialState: SelectedOrdersState = {
  selectedManufacturingOrders: undefined
};

function reducer(state: SelectedOrdersState, action: SelectedOrdersAction): SelectedOrdersState {
  switch (action.type) {
    case "SET_ORDERS":
      return { ...state, selectedManufacturingOrders: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const OrdersStateContext = createContext<SelectedOrdersState | undefined>(undefined);
const OrdersDispatchContext = createContext<Dispatch<SelectedOrdersAction> | undefined>(
  undefined,
);

export function useSelectedOrdersState() {
  const context = useContext(OrdersStateContext);
  if (context === undefined) {
    throw new Error(
      "useTableState must be used within OrdersStateContext",
    );
  }
  return context;
}

export function useSelectedOrdersDispatch() {
  const context = useContext(OrdersDispatchContext);
  if (context === undefined) {
    throw new Error(
      "useTableDispatch must be used within OrdersDispatchContext",
    );
  }
  return context;
}

export default function ManufacturingOrderCreatePageSelectedOrdersDetails() {
  const { useSelector } = ManufacturingOrderCreatePageReducerStore;
  const selectedPOIsIds = useSelector(s => s.selectedPOIsIds);

  const {
    data: fullDetailMOsResponse,
    error: fetchError,
    isLoading: isFetchingList,
  } = useGetDraftFullDetailManufacturingOrdersByPoiIdsQuery({
    ids: selectedPOIsIds,
  });

  if (isFetchingList) {
    return <DataLoading />
  }

  if (fetchError) {
    return <DataFetchError />
  }

  if (!check.greater(fullDetailMOsResponse?.data?.length as number, 0)) {
    return (
      <Center>
        <Box bgColor={"colorPalette.muted"} my={5} px={3} py={2} rounded={"md"} maxW={"20rem"}>
          <Stack alignItems={"center"}>
            <Text textWrap={"wrap"} textAlign={"center"}>Chọn PO Item bên trên để xem trước các lệnh sẽ được tạo</Text>
          </Stack>
        </Box>
      </Center>
    )
  }

  return (
    <Tabs.Root defaultValue="members">
      <Tabs.List>
        <Tabs.Trigger value="members">
          <LuUser />
          Thông tin các lệnh sẽ tạo
        </Tabs.Trigger>
        <Tabs.Trigger value="projects">
          <LuFolder />
          Kiểm tra nguyên phụ liệu
        </Tabs.Trigger>
        <Tabs.Trigger value="tasks">
          <LuSquareCheck />
          Kiểm tra tồn kho hàng
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="members">
        <CreatePageManufacturingOrderTable />
      </Tabs.Content>
      <Tabs.Content value="projects"><MaterialRequirementContainer /></Tabs.Content>
      <Tabs.Content value="tasks">
      </Tabs.Content>
    </Tabs.Root>
  );
}
