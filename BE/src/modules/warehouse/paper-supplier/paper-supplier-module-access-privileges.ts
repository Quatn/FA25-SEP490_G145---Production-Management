import {
    systemCreatePrivileges,
    systemGetPrivileges,
    systemAdminPrivileges,
    systemUpdatePrivileges,
} from "@/app-access-privileges";
import { PaperSupplierModuleAccessPrivilege } from "@/config/access-privileges-list";

export const paperSupplierGetPrivileges = [
    ...systemGetPrivileges,
    PaperSupplierModuleAccessPrivilege.Read,
];
export const paperSupplierCreatePrivileges = [
    ...systemCreatePrivileges,
    PaperSupplierModuleAccessPrivilege.ReadWrite,
];
export const paperSupplierUpdatePrivileges = [
    ...systemUpdatePrivileges,
    PaperSupplierModuleAccessPrivilege.ReadWrite,
];
export const paperSupplierAdminPrivileges = [
    ...systemAdminPrivileges,
    PaperSupplierModuleAccessPrivilege.Admin,
];
