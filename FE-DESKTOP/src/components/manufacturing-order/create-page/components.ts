import PurchaseOrderItemListGroupTypeControl from "./po-picker/GroupTypeControl";
import PurchaseOrderItemSelector from "./po-picker/PurchaseOrderItemSelector";
import PurchaseOrderItemSelectorItem from "./po-picker/PurchaseOrderItemSelectorItem";
import PurchaseOrderItemSearchBar from "./po-picker/SearchBar";

export const ManufacturingOrderCreatePageComponents = {
  SearchBar: PurchaseOrderItemSearchBar,
  GroupTypeControl: PurchaseOrderItemListGroupTypeControl,
  ItemSelector: PurchaseOrderItemSelector,
  ItemSelectorItem: PurchaseOrderItemSelectorItem,
};
