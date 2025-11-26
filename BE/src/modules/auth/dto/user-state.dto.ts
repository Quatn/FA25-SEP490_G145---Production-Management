import { AnyAccessPrivileges } from "@/config/access-privileges-list";
import { ApiProperty } from "@nestjs/swagger";

export class UserState {
  @ApiProperty()
  code: string;

  @ApiProperty()
  employeeCode: string;

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
  accessPrivileges: AnyAccessPrivileges[];
}
