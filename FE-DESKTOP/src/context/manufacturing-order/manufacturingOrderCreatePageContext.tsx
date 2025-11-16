"use client";
import React, { createContext, Dispatch, useContext, useReducer } from "react";

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

export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  isPOI?: boolean;
}

interface PageState {
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
  state: PageState,
): PageState {
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

type PageAction =
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
  | { type: "RESET" };

const initialState: PageState = {
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
      const newState: PageState = {
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

export function useManufacturingOrderCreatePageState() {
  const context = useContext(PageStateContext);
  if (context === undefined) {
    throw new Error(
      "usePageState must be used within ManufacturingOrderCreatePageProvider",
    );
  }
  return context;
}

export function useManufacturingOrderCreatePageDispatch() {
  const context = useContext(PageDispatchContext);
  if (context === undefined) {
    throw new Error(
      "usePageDispatch must be used within ManufacturingOrderCreatePageProvider",
    );
  }
  return context;
}

export type ManufacturingCreatePageTabType = TabType;
export type PurchaseOrderItemPickerTabType = TableTabType;
export type ManufacturingCreatePagePOTreeActionPayload = POTreeActionPayload;
export type ManufacturingCreatePagekPOTreeActionPayload = SPOTreeActionPayload;
export type ManufacturingOrderCreatePageTreeNode = TreeNode;
