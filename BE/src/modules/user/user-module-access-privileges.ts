import {
  systemCreatePrivileges,
  systemGetPrivileges,
  systemAdminPrivileges,
  systemUpdatePrivileges,
} from "@/app-access-privileges";
import { UserModuleAccessPrivilege } from "@/config/access-privileges-list";

export const userGetPrivileges = [
  ...(systemGetPrivileges as string[]),
  UserModuleAccessPrivilege.Admin,
  UserModuleAccessPrivilege.Read,
];
export const userCreatePrivileges = [
  ...systemCreatePrivileges,
  UserModuleAccessPrivilege.Admin,
  UserModuleAccessPrivilege.ReadWrite,
];
export const userUpdatePrivileges = [
  ...systemUpdatePrivileges,
  UserModuleAccessPrivilege.Admin,
  UserModuleAccessPrivilege.ReadWrite,
];
export const userAdminPrivileges = [
  ...systemAdminPrivileges,
  UserModuleAccessPrivilege.Admin,
];
