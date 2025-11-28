"use client";
import React, { createContext, Dispatch, useContext, useReducer } from "react";

interface PageState {
  page: number;
  limit: number;
  totalItems: number;
  search: string;
  preparedSubmitFunction?: () => void;
  preparedSubmitAskText: string;
}

type PageAction =
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_LIMIT"; payload: number }
  | { type: "SET_TOTAL_ITEMS"; payload: number }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_PREPARED_SUBMIT_FUNCTION"; payload: (() => void) | undefined }
  | { type: "SET_PREPARED_SUBMIT_ASK_TEXT"; payload: string }
  | { type: "RESET" };

const initialState: PageState = {
  page: 1,
  limit: 20,
  totalItems: 0,
  search: "",
  preparedSubmitAskText: "",
};

function pageReducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "SET_LIMIT":
      return { ...state, limit: action.payload };
    case "SET_TOTAL_ITEMS":
      return { ...state, totalItems: action.payload };
    case "SET_SEARCH":
      return { ...state, search: action.payload };
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

const PageStateContext = createContext<PageState | undefined>(undefined);
const PageDispatchContext = createContext<Dispatch<PageAction> | undefined>(
  undefined,
);

export function UserManagementPageProvider(
  { children }: { children: React.ReactNode },
) {
  const [state, dispatch] = useReducer(pageReducer, initialState);
  return (
    <PageStateContext.Provider value={state}>
      <PageDispatchContext.Provider value={dispatch}>
        {children}
      </PageDispatchContext.Provider>
    </PageStateContext.Provider>
  );
}

export function useUserManagementPageState() {
  const context = useContext(PageStateContext);
  if (context === undefined) {
    throw new Error(
      "usePageState must be used within UserManagementPageProvider",
    );
  }
  return context;
}

export function useUserManagementPageDispatch() {
  const context = useContext(PageDispatchContext);
  if (context === undefined) {
    throw new Error(
      "usePageDispatch must be used within UserManagementPageProvider",
    );
  }
  return context;
}
