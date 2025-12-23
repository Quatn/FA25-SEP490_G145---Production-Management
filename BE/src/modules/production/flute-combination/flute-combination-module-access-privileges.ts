import {
    systemCreatePrivileges,
    systemGetPrivileges,
    systemAdminPrivileges,
    systemUpdatePrivileges,
} from "@/app-access-privileges";
import { FluteCombinationModuleAccessPrivilege } from "@/config/access-privileges-list";

export const fluteCombinationGetPrivileges = [
    ...systemGetPrivileges,
    FluteCombinationModuleAccessPrivilege.Read,
];
export const fluteCombinationCreatePrivileges = [
    ...systemCreatePrivileges,
    FluteCombinationModuleAccessPrivilege.ReadWrite,
];
export const fluteCombinationUpdatePrivileges = [
    ...systemUpdatePrivileges,
    FluteCombinationModuleAccessPrivilege.ReadWrite,
];
export const fluteCombinationAdminPrivileges = [
    ...systemAdminPrivileges,
    FluteCombinationModuleAccessPrivilege.Admin,
];
