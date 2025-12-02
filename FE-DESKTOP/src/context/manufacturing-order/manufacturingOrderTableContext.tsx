"use client";
import { Store, useStore } from "@tanstack/react-store";
import React, { createContext, useContext } from "react";

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

interface StoreState {
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
  useFullTable: boolean,
}

type StoreAction =
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
  | { type: "SET_USE_FULL_TABLE"; payload: boolean }
  | { type: "RESET" };

const initialState: StoreState = {
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
  useFullTable: false,
};

function reducer(state: StoreState, action: StoreAction): StoreState {
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
    case "SET_USE_FULL_TABLE":
      return { ...state, useFullTable: action.payload }
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const StoreContext = createContext<Store<StoreState> | null>(null);

export function ManufacturingOrderTableProvider(
  { children }: { children: React.ReactNode },
) {
  const storeRef = React.useRef(new Store<StoreState>(initialState));

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
}

// Internal hook to get the store
function useStoreInstance() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("Must be used inside ManufacturingOrderTableProvider");
  return store;
}

// Select slices of state
function useSelector<T>(selector: (state: StoreState) => T): T {
  const store = useStoreInstance();
  return useStore(store, selector);
}

// Full state (avoid using)
function useState() {
  const store = useStoreInstance();
  return useStore(store);
}

// Dispatch reducer actions
function useDispatch() {
  const store = useStoreInstance();
  return (action: StoreAction) => {
    store.setState((prev) => reducer(prev, action));
  };
}

export const ManufacturingOrderTableReducerStore = {
  context: StoreContext,
  useStoreInstance,
  useSelector: useSelector,
  useState: useState,
  useDispatch: useDispatch,
}
export type ManufacturingTableTabType = TabType;
