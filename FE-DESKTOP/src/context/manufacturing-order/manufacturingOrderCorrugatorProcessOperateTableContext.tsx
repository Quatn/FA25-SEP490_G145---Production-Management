"use client";
import { Store, useStore } from "@tanstack/react-store";
import React, { createContext, useContext } from "react";

interface StoreState {
  page: number;
  limit: number;
  totalItems: number;
  search: string;
  hoveredRowId: string | null;
  selectedOrderId: string | null;
}

type StoreAction =
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_LIMIT"; payload: number }
  | { type: "SET_TOTAL_ITEMS"; payload: number }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_HOVERED_ROW_ID"; payload: string | null }
  | { type: "SET_SELECTED_ORDER_ID"; payload: string | null }
  | { type: "RESET" };

const initialState: StoreState = {
  page: 1,
  limit: 5,
  totalItems: 0,
  search: "",
  hoveredRowId: null,
  selectedOrderId: null,
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
    case "SET_HOVERED_ROW_ID":
      return { ...state, hoveredRowId: action.payload };
    case "SET_SELECTED_ORDER_ID":
      return { ...state, selectedOrderId: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const StoreContext = createContext<Store<StoreState> | null>(null);

export function ManufacturingOrderCorrugatorProcessOperateTableProvider(
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
  if (!store) throw new Error("Must be used inside ManufacturingOrderCorrugatorProcessOperateTableProvider");
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

export const ManufacturingOrderCorrugatorProcessOperateTableReducerStore = {
  context: StoreContext,
  useStoreInstance,
  useSelector: useSelector,
  useState: useState,
  useDispatch: useDispatch,
}
