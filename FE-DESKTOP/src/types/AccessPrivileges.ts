export enum SystemAccessPrivilege {
  Admin = "system-admin",
  Read = "system-read",
  ReadWrite = "system-readWrite",
}

export enum ProductionModuleAccessPrivilege {
  Admin = "production-admin",
  Read = "production-read",
  ReadWrite = "production-readWrite",
}

export enum WarehouseModuleAccessPrivilege {
  Admin = "warehouse-admin",
  Read = "warehouse-read",
  ReadWrite = "warehouse-readWrite",
}

export enum UserModuleAccessPrivilege {
  Admin = "user-admin",
  Read = "user-read",
  ReadWrite = "user-readWrite",
}

export enum EmployeeModuleAccessPrivilege {
  Admin = "employee-admin",
  Read = "employee-read",
  ReadWrite = "employee-readWrite",
}

export enum ManufacturingOrderModuleAccessPrivilege {
  Admin = "manufacturing-order-admin",
  Read = "manufacturing-order-read",
  ReadWrite = "manufacturing-order-readWrite",
}

export enum CustomerModuleAccessPrivilege {
  Admin = "customer-admin",
  Read = "customer-read",
  ReadWrite = "customer-readWrite",
}

export enum PrintColorModuleAccessPrivilege {
  Admin = "print-color-admin",
  Read = "print-color-read",
  ReadWrite = "print-color-readWrite",
}

export enum FluteCombinationModuleAccessPrivilege {
  Admin = "flute-combination-admin",
  Read = "flute-combination-read",
  ReadWrite = "flute-combination-readWrite",
}

export enum OrderFinishingProcessModuleAccessPrivilege {
  Admin = "order-finishing-process-admin",
  Read = "order-finishing-process-read",
  ReadWrite = "order-finishing-process-readWrite",
}

export enum ProductTypeModuleAccessPrivilege {
  Admin = "product-type-admin",
  Read = "product-type-read",
  ReadWrite = "product-type-readWrite",
}

export enum WareFinishingProcessTypeModuleAccessPrivilege {
  Admin = "ware-finishing-process-type-admin",
  Read = "ware-finishing-process-type-read",
  ReadWrite = "ware-finishing-process-type-readWrite",
}

export enum WareManufacturingProcessTypeModuleAccessPrivilege {
  Admin = "ware-manufacturing-process-type-admin",
  Read = "ware-manufacturing-process-type-read",
  ReadWrite = "ware-manufacturing-process-type-readWrite",
}

export enum FinishedGoodModuleAccessPrivilege {
  Admin = "finished-good-admin",
  Read = "finished-good-read",
  ReadWrite = "finished-good-readWrite",
}

export enum FinishedGoodTransactionModuleAccessPrivilege {
  Admin = "finished-good-transaction-admin",
  Read = "finished-good-transaction-read",
  ReadWrite = "finished-good-transaction-readWrite",
}

export enum PaperColorModuleAccessPrivilege {
  Admin = "paper-color-admin",
  Read = "paper-color-read",
  ReadWrite = "paper-color-readWrite",
}

export enum PaperSupplierModuleAccessPrivilege {
  Admin = "paper-supplier-admin",
  Read = "paper-supplier-read",
  ReadWrite = "paper-supplier-readWrite",
}

export enum PaperTypeModuleAccessPrivilege {
  Admin = "paper-type-admin",
  Read = "paper-type-read",
  ReadWrite = "paper-type-readWrite",
}

export enum SemiFinishedGoodModuleAccessPrivilege {
  Admin = "semi-finished-good-admin",
  Read = "semi-finished-good-read",
  ReadWrite = "semi-finished-good-readWrite",
}

export enum SemiFinishedGoodTransactionModuleAccessPrivilege {
  Admin = "semi-finished-good-transaction-admin",
  Read = "semi-finished-good-transaction-read",
  ReadWrite = "semi-finished-good-transaction-readWrite",
}

export enum PaperRollModuleAccessPrivilege {
  Admin = "paper-roll-admin",
  Read = "paper-roll-read",
  ReadWrite = "paper-roll-readWrite",
}

export enum PurchaseOrderModuleAccessPrivilege {
  Admin = "purchase-order-admin",
  Read = "purchase-order-read",
  ReadWrite = "purchase-order-readWrite",
}

export enum ProductModuleAccessPrivilege {
  Admin = "product-admin",
  Read = "product-read",
  ReadWrite = "product-readWrite",
}

export enum WareModuleAccessPrivilege {
  Admin = "ware-admin",
  Read = "ware-read",
  ReadWrite = "ware-readWrite",
}

export type AnyAccessPrivileges =
  | `${SystemAccessPrivilege}`
  | `${ProductionModuleAccessPrivilege}`
  | `${WarehouseModuleAccessPrivilege}`
  | `${UserModuleAccessPrivilege}`
  | `${EmployeeModuleAccessPrivilege}`
  | `${ManufacturingOrderModuleAccessPrivilege}`
  | `${CustomerModuleAccessPrivilege}`
  | `${PrintColorModuleAccessPrivilege}`
  | `${FluteCombinationModuleAccessPrivilege}`
  | `${OrderFinishingProcessModuleAccessPrivilege}`
  | `${ProductTypeModuleAccessPrivilege}`
  | `${WareFinishingProcessTypeModuleAccessPrivilege}`
  | `${WareManufacturingProcessTypeModuleAccessPrivilege}`
  | `${FinishedGoodModuleAccessPrivilege}`
  | `${FinishedGoodTransactionModuleAccessPrivilege}`
  | `${PaperColorModuleAccessPrivilege}`
  | `${PaperSupplierModuleAccessPrivilege}`
  | `${PaperTypeModuleAccessPrivilege}`
  | `${SemiFinishedGoodModuleAccessPrivilege}`
  | `${SemiFinishedGoodTransactionModuleAccessPrivilege}`
  | `${PaperRollModuleAccessPrivilege}`
  | `${PurchaseOrderModuleAccessPrivilege}`
  | `${ProductModuleAccessPrivilege}`
  | `${WareModuleAccessPrivilege}`
  ;

export const ALL_ACCESS_PRIVILEGE_VALUES: string[] = [
  ...Object.values(SystemAccessPrivilege),
  ...Object.values(ProductionModuleAccessPrivilege),
  ...Object.values(WarehouseModuleAccessPrivilege),
  ...Object.values(UserModuleAccessPrivilege),
  ...Object.values(EmployeeModuleAccessPrivilege),
  ...Object.values(ManufacturingOrderModuleAccessPrivilege),
  ...Object.values(CustomerModuleAccessPrivilege),
  ...Object.values(PrintColorModuleAccessPrivilege),
  ...Object.values(FluteCombinationModuleAccessPrivilege),
  ...Object.values(OrderFinishingProcessModuleAccessPrivilege),
  ...Object.values(ProductTypeModuleAccessPrivilege),
  ...Object.values(WareFinishingProcessTypeModuleAccessPrivilege),
  ...Object.values(WareManufacturingProcessTypeModuleAccessPrivilege),
  ...Object.values(FinishedGoodModuleAccessPrivilege),
  ...Object.values(FinishedGoodTransactionModuleAccessPrivilege),
  ...Object.values(PaperColorModuleAccessPrivilege),
  ...Object.values(PaperSupplierModuleAccessPrivilege),
  ...Object.values(PaperTypeModuleAccessPrivilege),
  ...Object.values(SemiFinishedGoodModuleAccessPrivilege),
  ...Object.values(SemiFinishedGoodTransactionModuleAccessPrivilege),
  ...Object.values(PaperRollModuleAccessPrivilege),
  ...Object.values(PurchaseOrderModuleAccessPrivilege),
  ...Object.values(ProductModuleAccessPrivilege),
  ...Object.values(WareModuleAccessPrivilege),
];
