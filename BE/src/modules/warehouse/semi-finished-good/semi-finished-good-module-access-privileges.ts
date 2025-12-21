import {
    systemCreatePrivileges,
    systemGetPrivileges,
    systemAdminPrivileges,
    systemUpdatePrivileges,
} from "@/app-access-privileges";
import { SemiFinishedGoodModuleAccessPrivilege } from "@/config/access-privileges-list";

export const semiFinishedGoodGetPrivileges = [
    ...systemGetPrivileges,
    SemiFinishedGoodModuleAccessPrivilege.Read,
];
export const semiFinishedGoodCreatePrivileges = [
    ...systemCreatePrivileges,
    SemiFinishedGoodModuleAccessPrivilege.ReadWrite,
];
export const semiFinishedGoodUpdatePrivileges = [
    ...systemUpdatePrivileges,
    SemiFinishedGoodModuleAccessPrivilege.ReadWrite,
];
export const semiFinishedGoodAdminPrivileges = [
    ...systemAdminPrivileges,
    SemiFinishedGoodModuleAccessPrivilege.Admin,
];
