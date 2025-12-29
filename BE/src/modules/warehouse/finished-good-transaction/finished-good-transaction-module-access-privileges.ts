import {
    systemCreatePrivileges,
    systemGetPrivileges,
    systemAdminPrivileges,
    systemUpdatePrivileges,
} from "@/app-access-privileges";
import { FinishedGoodTransactionModuleAccessPrivilege } from "@/config/access-privileges-list";

export const finishedGoodTransactionGetPrivileges = [
    ...systemGetPrivileges,
    FinishedGoodTransactionModuleAccessPrivilege.Read,
];
export const finishedGoodTransactionCreatePrivileges = [
    ...systemCreatePrivileges,
    FinishedGoodTransactionModuleAccessPrivilege.ReadWrite,
];
export const finishedGoodTransactionUpdatePrivileges = [
    ...systemUpdatePrivileges,
    FinishedGoodTransactionModuleAccessPrivilege.ReadWrite,
];
export const finishedGoodTransactionAdminPrivileges = [
    ...systemAdminPrivileges,
    FinishedGoodTransactionModuleAccessPrivilege.Admin,
];
