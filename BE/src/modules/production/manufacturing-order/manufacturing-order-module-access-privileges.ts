import {
  productionCreatePrivileges,
  productionGetPrivileges,
  productionHardDeletePrivileges,
  productionUpdatePrivileges,
} from "../production-module-access-privileges";

// extend later idk
export const manufacturingOrderGetPrivileges = [...productionGetPrivileges];
export const manufacturingOrderCreatePrivileges = [
  ...productionCreatePrivileges,
];
export const manufacturingOrderUpdatePrivileges = [
  ...productionUpdatePrivileges,
];
export const manufacturingOrderHardDeletePrivileges = [
  ...productionHardDeletePrivileges,
];
