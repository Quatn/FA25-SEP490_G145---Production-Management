import { AnyAccessPrivileges } from "./AccessPrivileges";

export interface UserState {
  id: string;
  code: string;
  employeeCode: string;
  name: string;
  address: string | null;
  email: string | null;
  contactNumber: string | null;
  role: string;
  accessPrivileges: AnyAccessPrivileges[];
}
