import { Employee } from "@/types/Employee";
import check from "check-types";

export function deserializeEmployee(serializedEmpl: Serialized<Employee>): Employee {
  return {
    ...serializedEmpl,
    role: (check.string(serializedEmpl.role)) ? serializedEmpl.role : {
      ...serializedEmpl.role,
      createdAt: new Date(serializedEmpl.role.createdAt),
      updatedAt: new Date(serializedEmpl.role.updatedAt),
    },
    user: (check.undefined(serializedEmpl.user) || check.null(serializedEmpl.user)) ? serializedEmpl.user : {
      ...(serializedEmpl.user),
      createdAt: new Date(serializedEmpl.user.createdAt),
      updatedAt: new Date(serializedEmpl.user.updatedAt),
    },
    createdAt: new Date(serializedEmpl.createdAt),
    updatedAt: new Date(serializedEmpl.updatedAt)
  }
}
