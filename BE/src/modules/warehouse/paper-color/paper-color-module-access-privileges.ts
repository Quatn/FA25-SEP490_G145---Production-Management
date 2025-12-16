import {
    systemCreatePrivileges,
    systemGetPrivileges,
    systemAdminPrivileges,
    systemUpdatePrivileges,
} from "@/app-access-privileges";
import { PaperColorModuleAccessPrivilege } from "@/config/access-privileges-list";

export const paperColorGetPrivileges = [
    ...systemGetPrivileges,
    PaperColorModuleAccessPrivilege.Read,
];
export const paperColorCreatePrivileges = [
    ...systemCreatePrivileges,
    PaperColorModuleAccessPrivilege.ReadWrite,
];
export const paperColorUpdatePrivileges = [
    ...systemUpdatePrivileges,
    PaperColorModuleAccessPrivilege.ReadWrite,
];
export const paperColorAdminPrivileges = [
    ...systemAdminPrivileges,
    PaperColorModuleAccessPrivilege.Admin,
];
