"use client";
import { Store, useStore } from "@tanstack/react-store";
import React, { createContext, useContext } from "react";

type TabType =
  | "selectedOrderDetails"
  | "materialRequirementSummary"
  | "excessWareInventorySummary";

type TableTabType =
  | "all"
  | "ware"
  | "manufacture"
  | "layers"
  | "notes"
  | "weight"
  | "processes";

type GroupType =
  | "PO"
  | "POI";

interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  isPOI?: boolean;
}

interface StoreState {
  page: number;
  limit: number;
  totalItems: number;
  search: string;
  groupType: GroupType;
  tab: TabType;
  selectedIdsTree: Record<string, Record<string, string[]>>;
  checkedOrderNodes: Record<string, boolean>;
  indeterminateOrderNodes: Record<string, boolean>;
  selectedPOIsIds: string[];
  hasUnsavedChanges: boolean;
  displayUnsavedChangeWarning: boolean;
  preparedSubmitFunction?: () => void;
  preparedSubmitAskText: string;
  insufficientPaperTypes?: { type: string, missingAmount: number }[];
  insufficientOrderBufferTimes?: { code: string, date: Date }[];
}

type POTreeActionPayload = {
  poId: string;
  spoTree: Record<string, string[]>;
};

type SPOTreeActionPayload = {
  spoId: string;
  poiIds: string[];
};

const getNodeById = (tree: TreeNode[], id: string): TreeNode | undefined => {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = getNodeById(node.children, id);
      if (found) return found;
    }
  }
};

const getAllDescendants = (node: TreeNode): string[] => {
  if (!node.children) return [node.id];
  return [node.id, ...node.children.flatMap(getAllDescendants)];
};

const getLeafNodes = (node: TreeNode): string[] => {
  if (!node.children) return [node.id];
  return node.children.flatMap(getLeafNodes);
};

const findParentId = (
  tree: TreeNode[],
  childId: string,
  parentId: string | null = null,
): string | null => {
  for (const node of tree) {
    if (node.id === childId) return parentId;
    if (node.children) {
      const found = findParentId(node.children, childId, node.id);
      if (found) return found;
    }
  }
  return null;
};

function updateAncestors(
  tree: TreeNode[],
  id: string,
  state: StoreState,
): StoreState {
  const parentId = findParentId(tree, id);
  if (!parentId) return state;

  const parent = getNodeById(tree, parentId);
  if (!parent || !parent.children) return state;

  const childrenIds = parent.children.map((c) => c.id);
  const allChecked = childrenIds.every((cid) => state.checkedOrderNodes[cid]);
  const someChecked = childrenIds.some((cid) =>
    state.checkedOrderNodes[cid] || state.indeterminateOrderNodes[cid]
  );

  state.checkedOrderNodes[parentId] = allChecked;
  state.indeterminateOrderNodes[parentId] = !allChecked && someChecked;

  return updateAncestors(tree, parentId, state);
}

type StoreAction =
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_LIMIT"; payload: number }
  | { type: "SET_TOTAL_ITEMS"; payload: number }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_GROUP_TYPE"; payload: GroupType }
  | { type: "SET_TAB"; payload: TabType }
  | { type: "SET_DISPLAY_UNSAVED_CHANGE_WARNING"; payload: boolean }
  | {
    type: "TOGGLE_ORDER_TREE_NODE";
    payload: { id: string; tree: TreeNode[] };
  }
  | { type: "RESET_TREE_STATE" }
  | { type: "SET_PREPARED_SUBMIT_FUNCTION"; payload: (() => void) | undefined }
  | { type: "SET_PREPARED_SUBMIT_ASK_TEXT"; payload: string }
  | { type: "SET_INSUFFICIENT_PAPER_TYPES"; payload: { type: string, missingAmount: number }[] }
  | { type: "SET_INSUFFICIENT_ORDER_BUFFER_TIMES"; payload: { code: string, date: Date }[] }
  | { type: "RESET" };

const initialState: StoreState = {
  page: 1,
  limit: 20,
  totalItems: 0,
  search: "",
  groupType: "PO",
  tab: "selectedOrderDetails",
  selectedIdsTree: {},
  checkedOrderNodes: {},
  indeterminateOrderNodes: {},
  selectedPOIsIds: [],
  hasUnsavedChanges: false,
  displayUnsavedChangeWarning: false,
  preparedSubmitAskText: "",
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
    case "SET_GROUP_TYPE":
      return { ...state, groupType: action.payload };
    case "SET_TAB":
      return { ...state, tab: action.payload };
    case "SET_DISPLAY_UNSAVED_CHANGE_WARNING":
      return { ...state, displayUnsavedChangeWarning: action.payload };
    case "TOGGLE_ORDER_TREE_NODE":
      if (state.hasUnsavedChanges) {
        return { ...state, displayUnsavedChangeWarning: true }
      }

      const { id, tree } = action.payload;
      const node = getNodeById(tree, id);
      if (!node) return state;

      const isChecked = !state.checkedOrderNodes[id];
      const newState: StoreState = {
        ...state,
        checkedOrderNodes: { ...state.checkedOrderNodes },
        indeterminateOrderNodes: { ...state.indeterminateOrderNodes },
        selectedPOIsIds: [...state.selectedPOIsIds],
      };

      // If parent or grandparent
      if (node.children && node.children.length > 0) {
        const descendantIds = getAllDescendants(node);
        descendantIds.forEach((descId) => {
          newState.checkedOrderNodes[descId] = isChecked;
          newState.indeterminateOrderNodes[descId] = false;
        });

        const leafIds = getLeafNodes(node);
        if (isChecked) {
          newState.selectedPOIsIds = Array.from(
            new Set([...newState.selectedPOIsIds, ...leafIds]),
          );
        } else {
          newState.selectedPOIsIds = newState.selectedPOIsIds.filter((id) =>
            !leafIds.includes(id)
          );
        }
      } else {
        // It's a child
        newState.checkedOrderNodes[id] = isChecked;
        if (node.isPOI) {
          if (isChecked) newState.selectedPOIsIds.push(id);
          else {
            newState.selectedPOIsIds = newState.selectedPOIsIds.filter((
              c,
            ) => c !== id);
          }
        }
      }
      // Update ancestors recursively
      return updateAncestors(tree, id, newState);
    case "RESET_TREE_STATE":
      return {
        ...state,
        selectedIdsTree: {},
        checkedOrderNodes: {},
        indeterminateOrderNodes: {},
        selectedPOIsIds: [],
        hasUnsavedChanges: false,
      };
    case "SET_PREPARED_SUBMIT_FUNCTION":
      return { ...state, preparedSubmitFunction: action.payload }
    case "SET_PREPARED_SUBMIT_ASK_TEXT":
      return { ...state, preparedSubmitAskText: action.payload }
    case "SET_INSUFFICIENT_PAPER_TYPES":
      return { ...state, insufficientPaperTypes: action.payload }
    case "SET_INSUFFICIENT_ORDER_BUFFER_TIMES":
      return { ...state, insufficientOrderBufferTimes: action.payload }
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const StoreContext = createContext<Store<StoreState> | null>(null);

export function ManufacturingOrderCreatePageProvider(
  { children }: { children: React.ReactNode },
) {
  const storeRef = React.useRef(new Store<StoreState>(initialState));

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  )
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

export const ManufacturingOrderCreatePageReducerStore = {
  context: StoreContext,
  useStoreInstance,
  useSelector: useSelector,
  useState: useState,
  useDispatch: useDispatch,
}
export type ManufacturingCreatePageTabType = TabType;
export type PurchaseOrderItemPickerTabType = TableTabType;
export type ManufacturingCreatePagePOTreeActionPayload = POTreeActionPayload;
export type ManufacturingCreatePagekPOTreeActionPayload = SPOTreeActionPayload;
export type ManufacturingOrderCreatePageTreeNode = TreeNode;
