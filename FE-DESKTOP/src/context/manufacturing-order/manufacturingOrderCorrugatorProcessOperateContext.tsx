"use client";
import { CorrugatorLine } from "@/types/enums/CorrugatorLine";
import { Store, useStore } from "@tanstack/react-store";
import React, { createContext, useContext } from "react";

interface StoreState {
  corrugatorLine: CorrugatorLine;
  preparedSubmitFunction?: () => void;
  preparedSubmitAskText: string;
}

type StoreAction =
  | { type: "SET_SELECTED_CORRUGATOR_LINE"; payload: CorrugatorLine }
  | { type: "SET_PREPARED_SUBMIT_FUNCTION"; payload: (() => void) | undefined }
  | { type: "SET_PREPARED_SUBMIT_ASK_TEXT"; payload: string }
  | { type: "RESET" };

const initialState: StoreState = {
  corrugatorLine: CorrugatorLine.L5,
  preparedSubmitAskText: "",
};

function reducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case "SET_SELECTED_CORRUGATOR_LINE":
      return { ...state, corrugatorLine: action.payload };
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

export function ManufacturingOrderCorrugatorProcessOperateProvider(
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
  if (!store) throw new Error("Must be used inside ManufacturingOrderCorrugatorProcessOperateProvider");
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

export const ManufacturingOrderCorrugatorProcessOperateReducerStore = {
  context: StoreContext,
  useStoreInstance,
  useSelector: useSelector,
  useState: useState,
  useDispatch: useDispatch,
}
