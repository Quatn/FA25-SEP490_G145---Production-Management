import {
    systemCreatePrivileges,
    systemGetPrivileges,
    systemAdminPrivileges,
    systemUpdatePrivileges,
} from "@/app-access-privileges";
import { WareManufacturingProcessTypeModuleAccessPrivilege } from "@/config/access-privileges-list";

export const wareManufacturingProcessTypeGetPrivileges = [
    ...systemGetPrivileges,
    WareManufacturingProcessTypeModuleAccessPrivilege.Read,
];
export const wareManufacturingProcessTypeCreatePrivileges = [
    ...systemCreatePrivileges,
    WareManufacturingProcessTypeModuleAccessPrivilege.ReadWrite,
];
export const wareManufacturingProcessTypeUpdatePrivileges = [
    ...systemUpdatePrivileges,
    WareManufacturingProcessTypeModuleAccessPrivilege.ReadWrite,
];
export const wareManufacturingProcessTypeAdminPrivileges = [
    ...systemAdminPrivileges,
    WareManufacturingProcessTypeModuleAccessPrivilege.Admin,
];
