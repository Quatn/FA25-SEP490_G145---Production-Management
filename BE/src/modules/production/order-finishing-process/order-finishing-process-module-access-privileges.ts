import {
    systemCreatePrivileges,
    systemGetPrivileges,
    systemAdminPrivileges,
    systemUpdatePrivileges,
} from "@/app-access-privileges";
import { OrderFinishingProcessModuleAccessPrivilege } from "@/config/access-privileges-list";

export const orderFinishingProcessGetPrivileges = [
    ...systemGetPrivileges,
    OrderFinishingProcessModuleAccessPrivilege.Read,
];
export const orderFinishingProcessCreatePrivileges = [
    ...systemCreatePrivileges,
    OrderFinishingProcessModuleAccessPrivilege.ReadWrite,
];
export const orderFinishingProcessUpdatePrivileges = [
    ...systemUpdatePrivileges,
    OrderFinishingProcessModuleAccessPrivilege.ReadWrite,
];
export const orderFinishingProcessAdminPrivileges = [
    ...systemAdminPrivileges,
    OrderFinishingProcessModuleAccessPrivilege.Admin,
];
