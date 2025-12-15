import { ManufacturingOrderModuleAccessPrivilege } from "@/config/access-privileges-list";
import {
  productionCreatePrivileges,
  productionGetPrivileges,
  productionAdminPrivileges,
  productionUpdatePrivileges,
} from "../production-module-access-privileges";

export const manufacturingOrderGetPrivileges = [
  ...productionGetPrivileges,
  ManufacturingOrderModuleAccessPrivilege.Read,
];
export const manufacturingOrderCreatePrivileges = [
  ...productionCreatePrivileges,
  ManufacturingOrderModuleAccessPrivilege.ReadWrite,
];
export const manufacturingOrderUpdatePrivileges = [
  ...productionUpdatePrivileges,
  ManufacturingOrderModuleAccessPrivilege.ReadWrite,
];
export const manufacturingOrderAdminPrivileges = [
  ...productionAdminPrivileges,
  ManufacturingOrderModuleAccessPrivilege.Admin,
];
