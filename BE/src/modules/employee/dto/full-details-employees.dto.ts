import { ApiProperty } from "@nestjs/swagger";
import { isRefPopulated } from "@/common/utils/populate-check";
import { Role } from "@/modules/employee/schemas/role.schema";
import { Employee } from "@/modules/employee/schemas/employee.schema";
import { User } from "@/modules/user/schemas/user.schema";
import check from "check-types";

export class FullDetailEmployeeDto extends Employee {
  @ApiProperty({
    type: Role,
    description: "Populated role",
  })
  declare role: Role;

  @ApiProperty({
    type: Role,
    description:
      "Populated lookup from user, null if the employee doesn't have an user created from it",
  })
  user: User | null;

  constructor(employee: Employee, user: User | null) {
    if (!isRefPopulated(employee.role)) {
      throw Error(
        "employee.role must be populated in employee to be used in FullDetailEmployeeDto",
      );
    }

    if (check.undefined(user)) {
      throw Error(
        "employee.user must be looked up from the user table and included in employee to be used in FullDetailEmployeeDto (null) if user for the employee doesn't exist",
      );
    }

    super();
    Object.assign(this, employee);
    if (!check.null(user) && !check.undefined(user.password))
      delete user.password;
    this.user = user;
  }
}
