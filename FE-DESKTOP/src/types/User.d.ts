import { AnyAccessPrivileges } from "./AccessPrivileges";

export interface User extends BaseSchema {
  code: string;
  password?: string;
  employee: string;
  accessPrivileges: AnyAccessPrivileges[];
};
