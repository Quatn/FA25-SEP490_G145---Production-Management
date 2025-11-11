"use client";
import React, { createContext, Dispatch, useContext, useReducer } from "react";

type TabType =
  | "selectedOrderDetails"
  | "materialRequirementSummary"
  | "excessWareInventorySummary";

type GroupType =
  | "PO"
  | "POI";

interface PageState {
  page: number;
  limit: number;
  totalItems: number;
  search: string;
  groupType: GroupType;
  tab: TabType;
}

type PageAction =
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_LIMIT"; payload: number }
  | { type: "SET_TOTAL_ITEMS"; payload: number }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_GROUP_TYPE"; payload: GroupType }
  | { type: "SET_TAB"; payload: TabType }
  | { type: "RESET" };

const initialState: PageState = {
  page: 1,
  limit: 20,
  totalItems: 0,
  search: "",
  groupType: "PO",
  tab: "selectedOrderDetails",
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
    case "SET_GROUP_TYPE":
      return { ...state, groupType: action.payload };
    case "SET_TAB":
      return { ...state, tab: action.payload };
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

export function ManufacturingOrderCreatePageProvider(
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

export function useManufacturingPageState() {
  const context = useContext(PageStateContext);
  if (context === undefined) {
    throw new Error(
      "usePageState must be used within ManufacturingOrderCreatePageProvider",
    );
  }
  return context;
}

export function useManufacturingPageDispatch() {
  const context = useContext(PageDispatchContext);
  if (context === undefined) {
    throw new Error(
      "usePageDispatch must be used within ManufacturingOrderCreatePageProvider",
    );
  }
  return context;
}

export type ManufacturingPageTabType = TabType;
