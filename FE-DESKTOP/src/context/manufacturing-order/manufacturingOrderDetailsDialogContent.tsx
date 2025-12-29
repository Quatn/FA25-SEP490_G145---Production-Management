"use client";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { UseDisclosureProps } from "@chakra-ui/react";
import { Store, useStore } from "@tanstack/react-store";
import React, { createContext, useContext } from "react";

type TabType =
  | "order"
  | "processes";

interface StoreState extends UseDisclosureProps {
  tab: TabType;
  allowValueEdit: boolean;
  /** @deprecated No longer do anything, please set orderId as setting the whole order is much more unreliable and doesn't sync with mo update changes */
  order: Serialized<ManufacturingOrder> | null;
  orderId: string | null,
  preparedSubmitFunction?: () => void;
  preparedSubmitAskText: string;
}

type StoreAction =
  | { type: "SET_OPEN"; payload: boolean }
  | { type: "SET_TAB"; payload: TabType }
  | { type: "OPEN_DIALOG" }
  | { type: "CLOSE_DIALOG" }
  /** @deprecated No longer do anything, please set orderId as setting the whole order is much more unreliable and doesn't sync with mo update changes */
  | {
    type: "OPEN_DIALOG_WITH_ORDER";
    payload: { order: Serialized<ManufacturingOrder> };
  }
  /** @deprecated No longer do anything, please set orderId as setting the whole order is much more unreliable and doesn't sync with mo update changes */
  | { type: "SET_ORDER"; payload: { order: Serialized<ManufacturingOrder> } }

  | { type: "SET_ORDER_ID"; payload: string | null }
  | { type: "OPEN_DIALOG_WITH_ORDER_ID"; payload: string }
  | { type: "SET_PREPARED_SUBMIT_FUNCTION"; payload: (() => void) | undefined }
  | { type: "SET_PREPARED_SUBMIT_ASK_TEXT"; payload: string }
  | { type: "RESET" };

const initialState: StoreState = {
  tab: "order",
  allowValueEdit: true,
  open: false,
  orderId: null,
  order: null,
  preparedSubmitAskText: "",
};

function reducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case "SET_OPEN":
      return { ...state, open: action.payload };
    case "SET_TAB":
      return { ...state, tab: action.payload };
    case "OPEN_DIALOG":
      return { ...state, open: true };
    case "OPEN_DIALOG_WITH_ORDER":
      return { ...state, open: true, order: action.payload.order };
    case "SET_ORDER":
      return { ...state, order: action.payload.order };
    case "SET_ORDER_ID":
      return { ...state, orderId: action.payload };
    case "OPEN_DIALOG_WITH_ORDER_ID":
      return { ...state, open: true, orderId: action.payload };
    case "CLOSE_DIALOG":
      return { ...state, open: false };
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

const StoreContext = createContext<Store<StoreState> | null>(null);

export function ManufacturingOrderDialogProvider(
  { children, initialState: init }: { children: React.ReactNode, initialState?: Partial<StoreState> },
) {
  const storeRef = React.useRef(new Store<StoreState>({ ...initialState, ...init }));

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

export const ManufacturingOrderDetailsDialogReducerStore = {
  context: StoreContext,
  useStoreInstance,
  useSelector: useSelector,
  useState: useState,
  useDispatch: useDispatch,
}

export type ManufacturingOrderDetailsDialogTabType = TabType
