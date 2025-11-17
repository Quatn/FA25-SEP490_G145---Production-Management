"use client";

import {
  useManufacturingOrderCreatePageDispatch,
  useManufacturingOrderCreatePageState,
} from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import { Button, Group, HStack, Tabs } from "@chakra-ui/react";
import { LuFolder, LuSquareCheck, LuUser } from "react-icons/lu";
import CreatePageManufacturingOrderTable from "./details-table-tab/Table";
import MaterialRequirementContainer from "./material-requirement-summary-tab/Container";
import { useGetDraftFullDetailManufacturingOrdersByPoiIdsQuery } from "@/service/api/manufacturingOrderApiSlice";
import { FullDetailManufacturingOrderDTO } from "@/types/DTO/FullDetailManufactureOrder";
import React, { createContext, Dispatch, useContext, useEffect, useReducer } from "react";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";

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
  // const { groupType, selectedPOIsIds } = useManufacturingOrderCreatePageState();
  // const dispatch = useManufacturingOrderCreatePageDispatch();

  // const {
  //   data: fullDetailMOsResponse,
  //   error: fetchError,
  //   isLoading: isFetchingList,
  // } = useGetDraftFullDetailManufacturingOrdersByPoiIdsQuery({
  //   ids: selectedPOIsIds,
  // });

  // const moPaginatedList = fullDetailMOsResponse?.data;

  // const [state, selectedOrdersDispatch] = useReducer(reducer, initialState);

  // useEffect(() => {
  // selectedOrdersDispatch({ type: "SET_ORDERS", payload: moPaginatedList })
  // }, [moPaginatedList])
  // 
  // <OrdersStateContext.Provider value={{ selectedManufacturingOrders: moPaginatedList }}>
  // <OrdersDispatchContext.Provider value={selectedOrdersDispatch}>


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
      <Tabs.Content value="projects">{/*<MaterialRequirementContainer />*/}</Tabs.Content>
      <Tabs.Content value="tasks">
      </Tabs.Content>
    </Tabs.Root>
  );
}
