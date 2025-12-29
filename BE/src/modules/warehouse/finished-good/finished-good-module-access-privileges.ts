import {
    systemCreatePrivileges,
    systemGetPrivileges,
    systemAdminPrivileges,
    systemUpdatePrivileges,
} from "@/app-access-privileges";
import { FinishedGoodModuleAccessPrivilege } from "@/config/access-privileges-list";

export const finishedGoodGetPrivileges = [
    ...systemGetPrivileges,
    FinishedGoodModuleAccessPrivilege.Read,
];
export const finishedGoodCreatePrivileges = [
    ...systemCreatePrivileges,
    FinishedGoodModuleAccessPrivilege.ReadWrite,
];
export const finishedGoodUpdatePrivileges = [
    ...systemUpdatePrivileges,
    FinishedGoodModuleAccessPrivilege.ReadWrite,
];
export const finishedGoodAdminPrivileges = [
    ...systemAdminPrivileges,
    FinishedGoodModuleAccessPrivilege.Admin,
];
