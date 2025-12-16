import {
    systemCreatePrivileges,
    systemGetPrivileges,
    systemAdminPrivileges,
    systemUpdatePrivileges,
} from "@/app-access-privileges";
import { PaperTypeModuleAccessPrivilege } from "@/config/access-privileges-list";

export const paperTypeGetPrivileges = [
    ...systemGetPrivileges,
    PaperTypeModuleAccessPrivilege.Read,
];
export const paperTypeCreatePrivileges = [
    ...systemCreatePrivileges,
    PaperTypeModuleAccessPrivilege.ReadWrite,
];
export const paperTypeUpdatePrivileges = [
    ...systemUpdatePrivileges,
    PaperTypeModuleAccessPrivilege.ReadWrite,
];
export const paperTypeAdminPrivileges = [
    ...systemAdminPrivileges,
    PaperTypeModuleAccessPrivilege.Admin,
];
