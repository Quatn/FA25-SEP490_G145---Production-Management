import { AnyAccessPrivileges } from "@/config/access-privileges-list";
import { ApiProperty } from "@nestjs/swagger";

export class UserState {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  employeeCode: string;

  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string | null;

  @ApiProperty()
  email: string | null;

  @ApiProperty()
  contactNumber: string | null;

  @ApiProperty()
  role: string;

  @ApiProperty()
  roleName: string;

  @ApiProperty()
  accessPrivileges: AnyAccessPrivileges[];
}
