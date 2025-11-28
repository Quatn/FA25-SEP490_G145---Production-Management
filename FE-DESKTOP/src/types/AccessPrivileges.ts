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

export type AnyAccessPrivileges =
  | `${SystemAccessPrivilege}`
  | `${ProductionModuleAccessPrivilege}`
  | `${WarehouseModuleAccessPrivilege}`
  | `${UserModuleAccessPrivilege}`
  | `${EmployeeModuleAccessPrivilege}`;

export const ALL_ACCESS_PRIVILEGE_VALUES: string[] = [
  ...Object.values(SystemAccessPrivilege),
  ...Object.values(ProductionModuleAccessPrivilege),
  ...Object.values(WarehouseModuleAccessPrivilege),
  ...Object.values(UserModuleAccessPrivilege),
  ...Object.values(EmployeeModuleAccessPrivilege),
];
