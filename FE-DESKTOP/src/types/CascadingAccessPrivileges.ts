import { CustomerModuleAccessPrivilege, EmployeeModuleAccessPrivilege, FinishedGoodModuleAccessPrivilege, FinishedGoodTransactionModuleAccessPrivilege, FluteCombinationModuleAccessPrivilege, ManufacturingOrderModuleAccessPrivilege, OrderFinishingProcessModuleAccessPrivilege, PaperColorModuleAccessPrivilege, PaperRollModuleAccessPrivilege, PaperSupplierModuleAccessPrivilege, PaperTypeModuleAccessPrivilege, PrintColorModuleAccessPrivilege, ProductionModuleAccessPrivilege, ProductModuleAccessPrivilege, ProductTypeModuleAccessPrivilege, PurchaseOrderModuleAccessPrivilege, SemiFinishedGoodModuleAccessPrivilege, SemiFinishedGoodTransactionModuleAccessPrivilege, SystemAccessPrivilege, UserModuleAccessPrivilege, WareFinishingProcessTypeModuleAccessPrivilege, WarehouseModuleAccessPrivilege, WareManufacturingProcessTypeModuleAccessPrivilege, WareModuleAccessPrivilege } from "./AccessPrivileges";

/* =========================
   SYSTEM
========================= */

export const systemGetPrivileges = [
  SystemAccessPrivilege.Admin,
  SystemAccessPrivilege.Read,
  SystemAccessPrivilege.ReadWrite,
];

export const systemReadWritePrivileges = [
  SystemAccessPrivilege.Admin,
  SystemAccessPrivilege.ReadWrite,
];

export const systemAdminPrivileges = [
  SystemAccessPrivilege.Admin,
];

/* =========================
   MAIN MODULES
========================= */

export const productionGetPrivileges = [
  ...systemGetPrivileges,
  ProductionModuleAccessPrivilege.Admin,
  ProductionModuleAccessPrivilege.Read,
  ProductionModuleAccessPrivilege.ReadWrite,
];

export const productionReadWritePrivileges = [
  ...systemReadWritePrivileges,
  ProductionModuleAccessPrivilege.Admin,
  ProductionModuleAccessPrivilege.ReadWrite,
];

export const productionAdminPrivileges = [
  ...systemAdminPrivileges,
  ProductionModuleAccessPrivilege.Admin,
];

export const warehouseGetPrivileges = [
  ...systemGetPrivileges,
  WarehouseModuleAccessPrivilege.Admin,
  WarehouseModuleAccessPrivilege.Read,
  WarehouseModuleAccessPrivilege.ReadWrite,
];

export const warehouseReadWritePrivileges = [
  ...systemReadWritePrivileges,
  WarehouseModuleAccessPrivilege.Admin,
  WarehouseModuleAccessPrivilege.ReadWrite,
];

export const warehouseAdminPrivileges = [
  ...systemAdminPrivileges,
  WarehouseModuleAccessPrivilege.Admin,
];

export const employeeGetPrivileges = [
  ...systemGetPrivileges,
  EmployeeModuleAccessPrivilege.Admin,
  EmployeeModuleAccessPrivilege.Read,
  EmployeeModuleAccessPrivilege.ReadWrite,
];

export const employeeReadWritePrivileges = [
  ...systemReadWritePrivileges,
  EmployeeModuleAccessPrivilege.Admin,
  EmployeeModuleAccessPrivilege.ReadWrite,
];

export const employeeAdminPrivileges = [
  ...systemAdminPrivileges,
  EmployeeModuleAccessPrivilege.Admin,
];

export const userGetPrivileges = [
  ...systemGetPrivileges,
  UserModuleAccessPrivilege.Admin,
  UserModuleAccessPrivilege.Read,
  UserModuleAccessPrivilege.ReadWrite,
];

export const userReadWritePrivileges = [
  ...systemReadWritePrivileges,
  UserModuleAccessPrivilege.Admin,
  UserModuleAccessPrivilege.ReadWrite,
];

export const userAdminPrivileges = [
  ...systemAdminPrivileges,
  UserModuleAccessPrivilege.Admin,
];

/* =========================
   PRODUCTION SUBMODULES
========================= */

export const manufacturingOrderGetPrivileges = [
  ...productionGetPrivileges,
  ManufacturingOrderModuleAccessPrivilege.Admin,
  ManufacturingOrderModuleAccessPrivilege.Read,
  ManufacturingOrderModuleAccessPrivilege.ReadWrite,
];

export const manufacturingOrderReadWritePrivileges = [
  ...productionReadWritePrivileges,
  ManufacturingOrderModuleAccessPrivilege.Admin,
  ManufacturingOrderModuleAccessPrivilege.ReadWrite,
];

export const manufacturingOrderAdminPrivileges = [
  ...productionAdminPrivileges,
  ManufacturingOrderModuleAccessPrivilege.Admin,
];

export const customerGetPrivileges = [
  ...productionGetPrivileges,
  CustomerModuleAccessPrivilege.Admin,
  CustomerModuleAccessPrivilege.Read,
  CustomerModuleAccessPrivilege.ReadWrite,
];

export const customerReadWritePrivileges = [
  ...productionReadWritePrivileges,
  CustomerModuleAccessPrivilege.Admin,
  CustomerModuleAccessPrivilege.ReadWrite,
];

export const customerAdminPrivileges = [
  ...productionAdminPrivileges,
  CustomerModuleAccessPrivilege.Admin,
];

export const printColorGetPrivileges = [
  ...productionGetPrivileges,
  PrintColorModuleAccessPrivilege.Admin,
  PrintColorModuleAccessPrivilege.Read,
  PrintColorModuleAccessPrivilege.ReadWrite,
];

export const printColorReadWritePrivileges = [
  ...productionReadWritePrivileges,
  PrintColorModuleAccessPrivilege.Admin,
  PrintColorModuleAccessPrivilege.ReadWrite,
];

export const printColorAdminPrivileges = [
  ...productionAdminPrivileges,
  PrintColorModuleAccessPrivilege.Admin,
];

export const fluteCombinationGetPrivileges = [
  ...productionGetPrivileges,
  FluteCombinationModuleAccessPrivilege.Admin,
  FluteCombinationModuleAccessPrivilege.Read,
  FluteCombinationModuleAccessPrivilege.ReadWrite,
];

export const fluteCombinationReadWritePrivileges = [
  ...productionReadWritePrivileges,
  FluteCombinationModuleAccessPrivilege.Admin,
  FluteCombinationModuleAccessPrivilege.ReadWrite,
];

export const fluteCombinationAdminPrivileges = [
  ...productionAdminPrivileges,
  FluteCombinationModuleAccessPrivilege.Admin,
];

export const orderFinishingProcessGetPrivileges = [
  ...productionGetPrivileges,
  OrderFinishingProcessModuleAccessPrivilege.Admin,
  OrderFinishingProcessModuleAccessPrivilege.Read,
  OrderFinishingProcessModuleAccessPrivilege.ReadWrite,
];

export const orderFinishingProcessReadWritePrivileges = [
  ...productionReadWritePrivileges,
  OrderFinishingProcessModuleAccessPrivilege.Admin,
  OrderFinishingProcessModuleAccessPrivilege.ReadWrite,
];

export const orderFinishingProcessAdminPrivileges = [
  ...productionAdminPrivileges,
  OrderFinishingProcessModuleAccessPrivilege.Admin,
];

export const productTypeGetPrivileges = [
  ...productionGetPrivileges,
  ProductTypeModuleAccessPrivilege.Admin,
  ProductTypeModuleAccessPrivilege.Read,
  ProductTypeModuleAccessPrivilege.ReadWrite,
];

export const productTypeReadWritePrivileges = [
  ...productionReadWritePrivileges,
  ProductTypeModuleAccessPrivilege.Admin,
  ProductTypeModuleAccessPrivilege.ReadWrite,
];

export const productTypeAdminPrivileges = [
  ...productionAdminPrivileges,
  ProductTypeModuleAccessPrivilege.Admin,
];

export const wareManufacturingProcessTypeGetPrivileges = [
  ...productionGetPrivileges,
  WareManufacturingProcessTypeModuleAccessPrivilege.Admin,
  WareManufacturingProcessTypeModuleAccessPrivilege.Read,
  WareManufacturingProcessTypeModuleAccessPrivilege.ReadWrite,
];

export const wareManufacturingProcessTypeReadWritePrivileges = [
  ...productionReadWritePrivileges,
  WareManufacturingProcessTypeModuleAccessPrivilege.Admin,
  WareManufacturingProcessTypeModuleAccessPrivilege.ReadWrite,
];

export const wareManufacturingProcessTypeAdminPrivileges = [
  ...productionAdminPrivileges,
  WareManufacturingProcessTypeModuleAccessPrivilege.Admin,
];

export const productGetPrivileges = [
  ...productionGetPrivileges,
  ProductModuleAccessPrivilege.Admin,
  ProductModuleAccessPrivilege.Read,
  ProductModuleAccessPrivilege.ReadWrite,
];

export const productReadWritePrivileges = [
  ...productionReadWritePrivileges,
  ProductModuleAccessPrivilege.Admin,
  ProductModuleAccessPrivilege.ReadWrite,
];

export const productAdminPrivileges = [
  ...productionAdminPrivileges,
  ProductModuleAccessPrivilege.Admin,
];

/* =========================
   WAREHOUSE SUBMODULES
========================= */

export const finishedGoodGetPrivileges = [
  ...warehouseGetPrivileges,
  FinishedGoodModuleAccessPrivilege.Admin,
  FinishedGoodModuleAccessPrivilege.Read,
  FinishedGoodModuleAccessPrivilege.ReadWrite,
];

export const finishedGoodReadWritePrivileges = [
  ...warehouseReadWritePrivileges,
  FinishedGoodModuleAccessPrivilege.Admin,
  FinishedGoodModuleAccessPrivilege.ReadWrite,
];

export const finishedGoodAdminPrivileges = [
  ...warehouseAdminPrivileges,
  FinishedGoodModuleAccessPrivilege.Admin,
];

export const finishedGoodTransactionGetPrivileges = [
  ...warehouseGetPrivileges,
  FinishedGoodTransactionModuleAccessPrivilege.Admin,
  FinishedGoodTransactionModuleAccessPrivilege.Read,
  FinishedGoodTransactionModuleAccessPrivilege.ReadWrite,
];

export const finishedGoodTransactionReadWritePrivileges = [
  ...warehouseReadWritePrivileges,
  FinishedGoodTransactionModuleAccessPrivilege.Admin,
  FinishedGoodTransactionModuleAccessPrivilege.ReadWrite,
];

export const finishedGoodTransactionAdminPrivileges = [
  ...warehouseAdminPrivileges,
  FinishedGoodTransactionModuleAccessPrivilege.Admin,
];

export const paperColorGetPrivileges = [
  ...warehouseGetPrivileges,
  PaperColorModuleAccessPrivilege.Admin,
  PaperColorModuleAccessPrivilege.Read,
  PaperColorModuleAccessPrivilege.ReadWrite,
];

export const paperColorReadWritePrivileges = [
  ...warehouseReadWritePrivileges,
  PaperColorModuleAccessPrivilege.Admin,
  PaperColorModuleAccessPrivilege.ReadWrite,
];

export const paperColorAdminPrivileges = [
  ...warehouseAdminPrivileges,
  PaperColorModuleAccessPrivilege.Admin,
];

export const paperSupplierGetPrivileges = [
  ...warehouseGetPrivileges,
  PaperSupplierModuleAccessPrivilege.Admin,
  PaperSupplierModuleAccessPrivilege.Read,
  PaperSupplierModuleAccessPrivilege.ReadWrite,
];

export const paperSupplierReadWritePrivileges = [
  ...warehouseReadWritePrivileges,
  PaperSupplierModuleAccessPrivilege.Admin,
  PaperSupplierModuleAccessPrivilege.ReadWrite,
];

export const paperSupplierAdminPrivileges = [
  ...warehouseAdminPrivileges,
  PaperSupplierModuleAccessPrivilege.Admin,
];

export const paperTypeGetPrivileges = [
  ...warehouseGetPrivileges,
  PaperTypeModuleAccessPrivilege.Admin,
  PaperTypeModuleAccessPrivilege.Read,
  PaperTypeModuleAccessPrivilege.ReadWrite,
];

export const paperTypeReadWritePrivileges = [
  ...warehouseReadWritePrivileges,
  PaperTypeModuleAccessPrivilege.Admin,
  PaperTypeModuleAccessPrivilege.ReadWrite,
];

export const paperTypeAdminPrivileges = [
  ...warehouseAdminPrivileges,
  PaperTypeModuleAccessPrivilege.Admin,
];

export const paperRollGetPrivileges = [
  ...warehouseGetPrivileges,
  PaperRollModuleAccessPrivilege.Admin,
  PaperRollModuleAccessPrivilege.Read,
  PaperRollModuleAccessPrivilege.ReadWrite,
];

export const paperRollReadWritePrivileges = [
  ...warehouseReadWritePrivileges,
  PaperRollModuleAccessPrivilege.Admin,
  PaperRollModuleAccessPrivilege.ReadWrite,
];

export const paperRollAdminPrivileges = [
  ...warehouseAdminPrivileges,
  PaperRollModuleAccessPrivilege.Admin,
];

export const semiFinishedGoodGetPrivileges = [
  ...warehouseGetPrivileges,
  SemiFinishedGoodModuleAccessPrivilege.Admin,
  SemiFinishedGoodModuleAccessPrivilege.Read,
  SemiFinishedGoodModuleAccessPrivilege.ReadWrite,
];

export const semiFinishedGoodReadWritePrivileges = [
  ...warehouseReadWritePrivileges,
  SemiFinishedGoodModuleAccessPrivilege.Admin,
  SemiFinishedGoodModuleAccessPrivilege.ReadWrite,
];

export const semiFinishedGoodAdminPrivileges = [
  ...warehouseAdminPrivileges,
  SemiFinishedGoodModuleAccessPrivilege.Admin,
];

export const semiFinishedGoodTransactionGetPrivileges = [
  ...warehouseGetPrivileges,
  SemiFinishedGoodTransactionModuleAccessPrivilege.Admin,
  SemiFinishedGoodTransactionModuleAccessPrivilege.Read,
  SemiFinishedGoodTransactionModuleAccessPrivilege.ReadWrite,
];

export const semiFinishedGoodTransactionReadWritePrivileges = [
  ...warehouseReadWritePrivileges,
  SemiFinishedGoodTransactionModuleAccessPrivilege.Admin,
  SemiFinishedGoodTransactionModuleAccessPrivilege.ReadWrite,
];

export const semiFinishedGoodTransactionAdminPrivileges = [
  ...warehouseAdminPrivileges,
  SemiFinishedGoodTransactionModuleAccessPrivilege.Admin,
];

export const purchaseOrderGetPrivileges = [
  ...warehouseGetPrivileges,
  PurchaseOrderModuleAccessPrivilege.Admin,
  PurchaseOrderModuleAccessPrivilege.Read,
  PurchaseOrderModuleAccessPrivilege.ReadWrite,
];

export const purchaseOrderReadWritePrivileges = [
  ...warehouseReadWritePrivileges,
  PurchaseOrderModuleAccessPrivilege.Admin,
  PurchaseOrderModuleAccessPrivilege.ReadWrite,
];

export const purchaseOrderAdminPrivileges = [
  ...warehouseAdminPrivileges,
  PurchaseOrderModuleAccessPrivilege.Admin,
];

export const wareGetPrivileges = [
  ...warehouseGetPrivileges,
  WareModuleAccessPrivilege.Admin,
  WareModuleAccessPrivilege.Read,
  WareModuleAccessPrivilege.ReadWrite,
];

export const wareReadWritePrivileges = [
  ...warehouseReadWritePrivileges,
  WareModuleAccessPrivilege.Admin,
  WareModuleAccessPrivilege.ReadWrite,
];

export const wareAdminPrivileges = [
  ...warehouseAdminPrivileges,
  WareModuleAccessPrivilege.Admin,
];

export const wareFinishingProcessTypeGetPrivileges = [
  ...warehouseGetPrivileges,
  WareFinishingProcessTypeModuleAccessPrivilege.Admin,
  WareFinishingProcessTypeModuleAccessPrivilege.Read,
  WareFinishingProcessTypeModuleAccessPrivilege.ReadWrite,
];

export const wareFinishingProcessTypeReadWritePrivileges = [
  ...warehouseReadWritePrivileges,
  WareFinishingProcessTypeModuleAccessPrivilege.Admin,
  WareFinishingProcessTypeModuleAccessPrivilege.ReadWrite,
];

export const wareFinishingProcessTypeAdminPrivileges = [
  ...warehouseAdminPrivileges,
  WareFinishingProcessTypeModuleAccessPrivilege.Admin,
];
