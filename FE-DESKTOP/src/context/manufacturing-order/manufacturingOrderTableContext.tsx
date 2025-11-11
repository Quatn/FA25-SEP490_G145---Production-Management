"use client";
import React, { createContext, Dispatch, useContext, useReducer } from "react";

type TabType =
  | "all"
  | "order"
  | "manufacture"
  | "layers"
  | "notes"
  | "weight"
  | "processes";

type SearchFilterType =
  | "searchAndFilter"
  | "search"
  | "filter";

type PaginationType =
  | "paged"
  | "pageless";

interface TableState {
  page: number;
  limit: number;
  search: string;
  tab: TabType;
  hoveredRowId: string | null;
  selectedOrderId: string | null;
  pinnedOrderIds: string[];
  searchFilterType: SearchFilterType;
  paginationType: PaginationType;
}

type TableAction =
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_LIMIT"; payload: number }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_TAB"; payload: TabType }
  | { type: "SET_HOVERED_ROW_ID"; payload: string | null }
  | { type: "SET_SELECTED_ORDER_ID"; payload: string | null }
  | { type: "SET_PINNED_ORDERS_ID"; payload: string[] }
  | { type: "ADD_PINNED_ORDER_ID"; payload: string }
  | { type: "REMOVE_PINNED_ORDER_ID"; payload: string }
  | { type: "SET_SEARCH_FILTER_TYPE"; payload: SearchFilterType }
  | { type: "SET_PAGINATION_TYPE"; payload: PaginationType }
  | { type: "RESET" };

const initialState: TableState = {
  page: 1,
  limit: 20,
  search: "",
  tab: "order",
  hoveredRowId: null,
  selectedOrderId: null,
  pinnedOrderIds: [],
  searchFilterType: "searchAndFilter",
  paginationType: "paged",
};

function tableReducer(state: TableState, action: TableAction): TableState {
  switch (action.type) {
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "SET_LIMIT":
      return { ...state, limit: action.payload };
    case "SET_SEARCH":
      return { ...state, search: action.payload };
    case "SET_TAB":
      return { ...state, tab: action.payload };
    case "SET_HOVERED_ROW_ID":
      return { ...state, hoveredRowId: action.payload };
    case "SET_SELECTED_ORDER_ID":
      return { ...state, selectedOrderId: action.payload };
    case "SET_PINNED_ORDERS_ID":
      return { ...state, pinnedOrderIds: action.payload };
    case "ADD_PINNED_ORDER_ID":
      return {
        ...state,
        pinnedOrderIds: [...state.pinnedOrderIds, action.payload],
      };
    case "REMOVE_PINNED_ORDER_ID":
      return {
        ...state,
        pinnedOrderIds: state.pinnedOrderIds.filter((id) =>
          id !== action.payload
        ),
      };
    case "SET_SEARCH_FILTER_TYPE":
      return {
        ...state,
        searchFilterType: action.payload,
      };
    case "SET_PAGINATION_TYPE":
      return {
        ...state,
        paginationType: action.payload,
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const TableStateContext = createContext<TableState | undefined>(undefined);
const TableDispatchContext = createContext<Dispatch<TableAction> | undefined>(
  undefined,
);

export function ManufacturingOrderTableProvider(
  { children }: { children: React.ReactNode },
) {
  const [state, dispatch] = useReducer(tableReducer, initialState);
  return (
    <TableStateContext.Provider value={state}>
      <TableDispatchContext.Provider value={dispatch}>
        {children}
      </TableDispatchContext.Provider>
    </TableStateContext.Provider>
  );
}

export function useManufacturingTableState() {
  const context = useContext(TableStateContext);
  if (context === undefined) {
    throw new Error(
      "useTableState must be used within ManufacturingOrderTableProvider",
    );
  }
  return context;
}

export function useManufacturingTableDispatch() {
  const context = useContext(TableDispatchContext);
  if (context === undefined) {
    throw new Error(
      "useTableDispatch must be used within ManufacturingOrderTableProvider",
    );
  }
  return context;
}

export type ManufacturingTableTabType = TabType;
