import {
    systemCreatePrivileges,
    systemGetPrivileges,
    systemAdminPrivileges,
    systemUpdatePrivileges,
} from "@/app-access-privileges";
import { SemiFinishedGoodTransactionModuleAccessPrivilege } from "@/config/access-privileges-list";

export const semiFinishedGoodTransactionGetPrivileges = [
    ...systemGetPrivileges,
    SemiFinishedGoodTransactionModuleAccessPrivilege.Read,
];
export const semiFinishedGoodTransactionCreatePrivileges = [
    ...systemCreatePrivileges,
    SemiFinishedGoodTransactionModuleAccessPrivilege.ReadWrite,
];
export const semiFinishedGoodTransactionUpdatePrivileges = [
    ...systemUpdatePrivileges,
    SemiFinishedGoodTransactionModuleAccessPrivilege.ReadWrite,
];
export const semiFinishedGoodTransactionAdminPrivileges = [
    ...systemAdminPrivileges,
    SemiFinishedGoodTransactionModuleAccessPrivilege.Admin,
];
