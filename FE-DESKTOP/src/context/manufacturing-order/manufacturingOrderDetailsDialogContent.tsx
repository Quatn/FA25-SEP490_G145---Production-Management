"use client";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { UseDisclosureProps } from "@chakra-ui/react";
import React, { createContext, Dispatch, useContext, useReducer } from "react";

interface DialogState extends UseDisclosureProps {
  order: Serialized<ManufacturingOrder> | null;
}

type DialogAction =
  | { type: "SET_OPEN"; payload: boolean }
  | { type: "OPEN_DIALOG" }
  | { type: "CLOSE_DIALOG" }
  | {
    type: "OPEN_DIALOG_WITH_ORDER";
    payload: Serialized<ManufacturingOrder>;
  }
  | { type: "SET_ORDER"; payload: Serialized<ManufacturingOrder> }
  | { type: "RESET" };

const DialogStateContext = createContext<DialogState | undefined>(undefined);
const DialogDispatchContext = createContext<Dispatch<DialogAction> | undefined>(
  undefined,
);

const initialState: DialogState = {
  open: false,
  order: null,
};

function dialogReducer(state: DialogState, action: DialogAction): DialogState {
  switch (action.type) {
    case "SET_OPEN":
      return { ...state, open: action.payload };
    case "OPEN_DIALOG":
      return { ...state, open: true };
    case "OPEN_DIALOG_WITH_ORDER":
      return { ...state, open: true, order: action.payload };
    case "SET_ORDER":
      return { ...state, order: action.payload };
    case "CLOSE_DIALOG":
      return { ...state, open: false };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export function ManufacturingOrderDialogProvider(
  { children }: { children: React.ReactNode },
) {
  const [state, dispatch] = useReducer(dialogReducer, initialState);
  return (
    <DialogStateContext.Provider value={state}>
      <DialogDispatchContext.Provider value={dispatch}>
        {children}
      </DialogDispatchContext.Provider>
    </DialogStateContext.Provider>
  );
}

export function useManufacturingDialogState() {
  const context = useContext(DialogStateContext);
  if (context === undefined) {
    throw new Error(
      "useDialogState must be used within ManufacturingOrderDialogProvider",
    );
  }
  return context;
}

export function useManufacturingDialogDispatch() {
  const context = useContext(DialogDispatchContext);
  if (context === undefined) {
    throw new Error(
      "useDialogDispatch must be used within ManufacturingOrderDialogProvider",
    );
  }
  return context;
}

export function useOptionalManufacturingDialogState() {
  return useContext(DialogStateContext);
}

export function useOptionalManufacturingDialogDispatch() {
  return useContext(DialogDispatchContext);
}
