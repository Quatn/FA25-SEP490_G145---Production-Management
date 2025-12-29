import {
    systemCreatePrivileges,
    systemGetPrivileges,
    systemAdminPrivileges,
    systemUpdatePrivileges,
} from "@/app-access-privileges";
import { CustomerModuleAccessPrivilege } from "@/config/access-privileges-list";

export const customerGetPrivileges = [
    ...systemGetPrivileges,
    CustomerModuleAccessPrivilege.Read,
];
export const customerCreatePrivileges = [
    ...systemCreatePrivileges,
    CustomerModuleAccessPrivilege.ReadWrite,
];
export const customerUpdatePrivileges = [
    ...systemUpdatePrivileges,
    CustomerModuleAccessPrivilege.ReadWrite,
];
export const customerAdminPrivileges = [
    ...systemAdminPrivileges,
    CustomerModuleAccessPrivilege.Admin,
];
