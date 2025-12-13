import { Role } from "./Role";
import { User } from "./User";

export interface Employee extends BaseSchema {
  code: string;
  name: string;
  address: string | null;
  email: string | null;
  contactNumber: string | null;
  role: string | Role;
  note: string;

  user?: User | null;
};
