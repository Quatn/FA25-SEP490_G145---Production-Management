import { AnyAccessPrivileges } from "@/types/AccessPrivileges";

export class CreateUserRequestDto {
  code: string;
  password: string;
  employee: string;
  accessPrivileges: AnyAccessPrivileges[];
}
