import ManufacturingOrderDetailsDialog from "../order-details-dialog/Dialog";
import ManufacturingOrderFullDetailTableConfirmDialog from "./ConfirmDialog";
import ManufacturingOrderPagination from "./Pagination";
import ManufacturingOrderPaginationControl from "./PaginationControl";
import ManufacturingOrderSearchBar from "./SearchBar";
import ManufacturingOrderSearchFilterControl from "./SearchFilterControl";
import ManufacturingOrderTable from "./Table";
import ManufacturingOrderTableControl from "./TableControl";

export const ManufacturingOrderTableComponents = {
  ConfirmDialog: ManufacturingOrderFullDetailTableConfirmDialog,
  Pagination: ManufacturingOrderPagination,
  PaginationControl: ManufacturingOrderPaginationControl,
  SearchBar: ManufacturingOrderSearchBar,
  SearchFilterControl: ManufacturingOrderSearchFilterControl,
  Table: ManufacturingOrderTable,
  TableControl: ManufacturingOrderTableControl,
  DetailsDialog: ManufacturingOrderDetailsDialog,
};
