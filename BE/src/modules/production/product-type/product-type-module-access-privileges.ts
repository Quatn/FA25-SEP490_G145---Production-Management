import {
    systemCreatePrivileges,
    systemGetPrivileges,
    systemAdminPrivileges,
    systemUpdatePrivileges,
} from "@/app-access-privileges";
import { ProductTypeModuleAccessPrivilege } from "@/config/access-privileges-list";

export const productTypeGetPrivileges = [
    ...systemGetPrivileges,
    ProductTypeModuleAccessPrivilege.Read,
];
export const productTypeCreatePrivileges = [
    ...systemCreatePrivileges,
    ProductTypeModuleAccessPrivilege.ReadWrite,
];
export const productTypeUpdatePrivileges = [
    ...systemUpdatePrivileges,
    ProductTypeModuleAccessPrivilege.ReadWrite,
];
export const productTypeAdminPrivileges = [
    ...systemAdminPrivileges,
    ProductTypeModuleAccessPrivilege.Admin,
];
