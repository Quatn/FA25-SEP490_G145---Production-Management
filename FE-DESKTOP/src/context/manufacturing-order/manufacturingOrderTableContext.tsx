"use client";
import { Store, useStore } from "@tanstack/react-store";
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
  totalItems: number;
  search: string;
  tab: TabType;
  hoveredRowId: string | null;
  selectedOrderId: string | null;
  pinnedOrderIds: string[];
  searchFilterType: SearchFilterType;
  paginationType: PaginationType;
  allowEdit: boolean | string;
  preparedSubmitFunction?: () => void;
  preparedSubmitAskText: string;
}

type TableAction =
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_LIMIT"; payload: number }
  | { type: "SET_TOTAL_ITEMS"; payload: number }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_TAB"; payload: TabType }
  | { type: "SET_HOVERED_ROW_ID"; payload: string | null }
  | { type: "SET_SELECTED_ORDER_ID"; payload: string | null }
  | { type: "SET_PINNED_ORDERS_ID"; payload: string[] }
  | { type: "ADD_PINNED_ORDER_ID"; payload: string }
  | { type: "REMOVE_PINNED_ORDER_ID"; payload: string }
  | { type: "SET_SEARCH_FILTER_TYPE"; payload: SearchFilterType }
  | { type: "SET_PAGINATION_TYPE"; payload: PaginationType }
  | { type: "SET_ALLOW_EDIT"; payload: boolean | string }
  | { type: "SET_PREPARED_SUBMIT_FUNCTION"; payload: (() => void) | undefined }
  | { type: "SET_PREPARED_SUBMIT_ASK_TEXT"; payload: string }
  | { type: "RESET" };

const initialState: TableState = {
  page: 1,
  limit: 20,
  totalItems: 0,
  search: "",
  tab: "all",
  hoveredRowId: null,
  selectedOrderId: null,
  pinnedOrderIds: [],
  searchFilterType: "searchAndFilter",
  paginationType: "paged",
  allowEdit: false,
  preparedSubmitAskText: "",
};

function tableReducer(state: TableState, action: TableAction): TableState {
  switch (action.type) {
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "SET_LIMIT":
      return { ...state, limit: action.payload };
    case "SET_TOTAL_ITEMS":
      return { ...state, totalItems: action.payload };
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
    case "SET_ALLOW_EDIT":
      return { ...state, allowEdit: action.payload };
    case "SET_PREPARED_SUBMIT_FUNCTION":
      return { ...state, preparedSubmitFunction: action.payload }
    case "SET_PREPARED_SUBMIT_ASK_TEXT":
      return { ...state, preparedSubmitAskText: action.payload }
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
export const TableStoreContext = createContext<Store<TableState> | null>(null);

export function ManufacturingOrderTableProvider(
  { children }: { children: React.ReactNode },
) {
  // const [state, dispatch] = useReducer(tableReducer, initialState);
  const storeRef = React.useRef(new Store<TableState>(initialState));

  return (
    <TableStoreContext.Provider value={storeRef.current}>
      {/*<TableStateContext.Provider value={state}>
        <TableDispatchContext.Provider value={dispatch}>*/}
          {children}
        {/*</TableDispatchContext.Provider>
      </TableStateContext.Provider>*/}
    </TableStoreContext.Provider>
  );
}

// export function useManufacturingTableState() {
//   const context = useContext(TableStateContext);
//   if (context === undefined) {
//     throw new Error(
//       "useTableState must be used within ManufacturingOrderTableProvider",
//     );
//   }
//   return context;
// }
// 
// export function useManufacturingTableDispatch() {
//   const context = useContext(TableDispatchContext);
//   if (context === undefined) {
//     throw new Error(
//       "useTableDispatch must be used within ManufacturingOrderTableProvider",
//     );
//   }
//   return context;
// }

export type ManufacturingTableTabType = TabType;

// Internal hook to get the store
function useStoreInstance() {
  const store = useContext(TableStoreContext);
  if (!store) throw new Error("Must be used inside ManufacturingOrderTableProvider");
  return store;
}

// Select slices of state
export function useTableSelector<T>(selector: (state: TableState) => T): T {
  const store = useStoreInstance();
  return useStore(store, selector);
}

// Full state (rarely used)
export function useTableState() {
  const store = useStoreInstance();
  return useStore(store);
}

// Dispatch reducer actions
export function useTableDispatch() {
  const store = useStoreInstance();
  return (action: TableAction) => {
    store.setState((prev) => tableReducer(prev, action));
  };
}
