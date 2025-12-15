import {
  systemCreatePrivileges,
  systemGetPrivileges,
  systemAdminPrivileges,
  systemUpdatePrivileges,
} from "@/app-access-privileges";
import { WarehouseModuleAccessPrivilege } from "@/config/access-privileges-list";

export const warehouseGetPrivileges = [
  ...systemGetPrivileges,
  WarehouseModuleAccessPrivilege.Admin,
  WarehouseModuleAccessPrivilege.Read,
];
export const warehouseCreatePrivileges = [
  ...systemCreatePrivileges,
  WarehouseModuleAccessPrivilege.Admin,
  WarehouseModuleAccessPrivilege.ReadWrite,
];
export const warehouseUpdatePrivileges = [
  ...systemUpdatePrivileges,
  WarehouseModuleAccessPrivilege.Admin,
  WarehouseModuleAccessPrivilege.ReadWrite,
];
export const warehouseAdminPrivileges = [
  ...systemAdminPrivileges,
  WarehouseModuleAccessPrivilege.Admin,
];
