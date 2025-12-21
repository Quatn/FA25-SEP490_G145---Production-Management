import {
    systemCreatePrivileges,
    systemGetPrivileges,
    systemAdminPrivileges,
    systemUpdatePrivileges,
} from "@/app-access-privileges";
import { WareFinishingProcessTypeModuleAccessPrivilege } from "@/config/access-privileges-list";

export const wareFinishingProcessTypeGetPrivileges = [
    ...systemGetPrivileges,
    WareFinishingProcessTypeModuleAccessPrivilege.Read,
];
export const wareFinishingProcessTypeCreatePrivileges = [
    ...systemCreatePrivileges,
    WareFinishingProcessTypeModuleAccessPrivilege.ReadWrite,
];
export const wareFinishingProcessTypeUpdatePrivileges = [
    ...systemUpdatePrivileges,
    WareFinishingProcessTypeModuleAccessPrivilege.ReadWrite,
];
export const wareFinishingProcessTypeAdminPrivileges = [
    ...systemAdminPrivileges,
    WareFinishingProcessTypeModuleAccessPrivilege.Admin,
];
