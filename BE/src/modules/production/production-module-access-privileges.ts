import {
  systemCreatePrivileges,
  systemGetPrivileges,
  systemHardDeletePrivileges,
  systemUpdatePrivileges,
} from "@/app-access-privileges";
import { ProductionModuleAccessPrivilege } from "@/config/access-privileges-list";

export const productionGetPrivileges = [
  ...systemGetPrivileges,
  ProductionModuleAccessPrivilege.Admin,
  ProductionModuleAccessPrivilege.Read,
];
export const productionCreatePrivileges = [
  ...systemCreatePrivileges,
  ProductionModuleAccessPrivilege.Admin,
  ProductionModuleAccessPrivilege.ReadWrite,
];
export const productionUpdatePrivileges = [
  ...systemUpdatePrivileges,
  ProductionModuleAccessPrivilege.Admin,
  ProductionModuleAccessPrivilege.ReadWrite,
];
export const productionHardDeletePrivileges = [
  ...systemHardDeletePrivileges,
  ProductionModuleAccessPrivilege.Admin,
];
