import {
    systemCreatePrivileges,
    systemGetPrivileges,
    systemAdminPrivileges,
    systemUpdatePrivileges,
} from "@/app-access-privileges";
import { PrintColorModuleAccessPrivilege } from "@/config/access-privileges-list";

export const printColorGetPrivileges = [
    ...systemGetPrivileges,
    PrintColorModuleAccessPrivilege.Read,
];
export const printColorCreatePrivileges = [
    ...systemCreatePrivileges,
    PrintColorModuleAccessPrivilege.ReadWrite,
];
export const printColorUpdatePrivileges = [
    ...systemUpdatePrivileges,
    PrintColorModuleAccessPrivilege.ReadWrite,
];
export const printColorAdminPrivileges = [
    ...systemAdminPrivileges,
    PrintColorModuleAccessPrivilege.Admin,
];
