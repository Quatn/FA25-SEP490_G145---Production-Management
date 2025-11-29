import { SystemAccessPrivilege } from "./config/access-privileges-list";

export const systemGetPrivileges = [
  SystemAccessPrivilege.Admin,
  SystemAccessPrivilege.Read,
];
export const systemCreatePrivileges = [
  SystemAccessPrivilege.Admin,
  SystemAccessPrivilege.ReadWrite,
];
export const systemUpdatePrivileges = [
  SystemAccessPrivilege.Admin,
  SystemAccessPrivilege.ReadWrite,
];
export const systemHardDeletePrivileges = [SystemAccessPrivilege.Admin];
