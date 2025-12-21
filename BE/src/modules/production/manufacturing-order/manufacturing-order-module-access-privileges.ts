import { ManufacturingOrderModuleAccessPrivilege } from "@/config/access-privileges-list";
import {
  productionCreatePrivileges,
  productionGetPrivileges,
  productionAdminPrivileges,
  productionUpdatePrivileges,
} from "../production-module-access-privileges";

export const manufacturingOrderGetPrivileges = [
  ...productionGetPrivileges,
  ManufacturingOrderModuleAccessPrivilege.Admin,
  ManufacturingOrderModuleAccessPrivilege.Read,
  ManufacturingOrderModuleAccessPrivilege.ReadWrite,
];
export const manufacturingOrderCreatePrivileges = [
  ...productionCreatePrivileges,
  ManufacturingOrderModuleAccessPrivilege.Admin,
  ManufacturingOrderModuleAccessPrivilege.ReadWrite,
];
export const manufacturingOrderUpdatePrivileges = [
  ...productionUpdatePrivileges,
  ManufacturingOrderModuleAccessPrivilege.Admin,
  ManufacturingOrderModuleAccessPrivilege.ReadWrite,
];
export const manufacturingOrderAdminPrivileges = [
  ...productionAdminPrivileges,
  ManufacturingOrderModuleAccessPrivilege.Admin,
];
