"use client";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { OrderFinishingProcess } from "@/types/OrderFinishingProcess";
import { UseDisclosureProps } from "@chakra-ui/react";
import { Store, useStore } from "@tanstack/react-store";
import React, { createContext, useContext } from "react";

interface StoreState extends UseDisclosureProps {
  order: Serialized<ManufacturingOrder> | null;
  preparedSubmitFunction?: () => void;
  preparedSubmitAskText: string;
}

type StoreAction =
  | { type: "SET_OPEN"; payload: boolean }
  | { type: "OPEN_DIALOG" }
  | { type: "CLOSE_DIALOG" }
  | {
    type: "OPEN_DIALOG_WITH_ORDER";
    payload: { order: Serialized<ManufacturingOrder> };
  }
  | { type: "SET_ORDER"; payload: { order: Serialized<ManufacturingOrder> } }
  | { type: "SET_PREPARED_SUBMIT_FUNCTION"; payload: (() => void) | undefined }
  | { type: "SET_PREPARED_SUBMIT_ASK_TEXT"; payload: string }
  | { type: "RESET" };

const initialState: StoreState = {
  open: false,
  order: null,
  preparedSubmitAskText: "",
};

function reducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case "SET_OPEN":
      return { ...state, open: action.payload };
    case "OPEN_DIALOG":
      return { ...state, open: true };
    case "OPEN_DIALOG_WITH_ORDER":
      return { ...state, open: true, order: action.payload.order };
    case "SET_ORDER":
      return { ...state, order: action.payload.order };
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

export const ManufacturingOrderDetailsDialogReducerStore = {
  context: StoreContext,
  useStoreInstance,
  useSelector: useSelector,
  useState: useState,
  useDispatch: useDispatch,
}
