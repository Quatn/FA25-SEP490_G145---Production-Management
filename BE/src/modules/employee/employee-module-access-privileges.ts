import {
  systemCreatePrivileges,
  systemGetPrivileges,
  systemHardDeletePrivileges,
  systemUpdatePrivileges,
} from "@/app-access-privileges";
import { EmployeeModuleAccessPrivilege } from "@/config/access-privileges-list";

export const employeeGetPrivileges = [
  ...systemGetPrivileges,
  EmployeeModuleAccessPrivilege.Admin,
  EmployeeModuleAccessPrivilege.Read,
];
export const employeeCreatePrivileges = [
  ...systemCreatePrivileges,
  EmployeeModuleAccessPrivilege.Admin,
  EmployeeModuleAccessPrivilege.ReadWrite,
];
export const employeeUpdatePrivileges = [
  ...systemUpdatePrivileges,
  EmployeeModuleAccessPrivilege.Admin,
  EmployeeModuleAccessPrivilege.ReadWrite,
];
export const employeeHardDeletePrivileges = [
  ...systemHardDeletePrivileges,
  EmployeeModuleAccessPrivilege.Admin,
];
