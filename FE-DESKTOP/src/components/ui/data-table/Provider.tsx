"use client";
import { Store, useStore } from "@tanstack/react-store";
import React, { createContext, useContext } from "react";

interface TableState {
  allowEdit: boolean;
  hoveredRowId: string | null;
  query: string;
}

type TableAction =
  | { type: "SET_ALLOW_EDIT"; payload: boolean }
  | { type: "SET_HOVERED_ROW_ID"; payload: string | null }
  | { type: "SET_QUERY"; payload: string }
  | { type: "RESET" };

const defaultInitialState: TableState = {
  hoveredRowId: null,
  allowEdit: false,
  query: "",
};

function tableReducer(state: TableState, action: TableAction): TableState {
  switch (action.type) {
    case "SET_ALLOW_EDIT":
      return { ...state, allowEdit: action.payload };
    case "SET_HOVERED_ROW_ID":
      return { ...state, hoveredRowId: action.payload };
    case "SET_QUERY":
      return { ...state, query: action.payload };
    case "RESET":
      return defaultInitialState;
    default:
      return state;
  }
}

export const DataTableStoreContext = createContext<Store<TableState> | null>(null);

export function DataTableProvider(
  { children, initialState }: { children: React.ReactNode, initialState?: Partial<TableState> },
) {
  const storeRef = React.useRef(new Store<TableState>({
    ...defaultInitialState,
    ...initialState,
  }));

  return (
    <DataTableStoreContext.Provider value={storeRef.current}>
      {children}
    </DataTableStoreContext.Provider>
  );
}

// Internal hook to get the store
function useStoreInstance() {
  const store = useContext(DataTableStoreContext);
  if (!store) throw new Error("Must be used inside ManufacturingOrderTableProvider");
  return store;
}

// Select slices of state
export function useDataTableSelector<T>(selector: (state: TableState) => T): T {
  const store = useStoreInstance();
  return useStore(store, selector);
}

// Full state (rarely used)
export function useDataTableState() {
  const store = useStoreInstance();
  return useStore(store);
}

export function useDataTableDispatch() {
  const store = useStoreInstance();
  return (action: TableAction) => {
    store.setState((prev) => tableReducer(prev, action));
  };
}
