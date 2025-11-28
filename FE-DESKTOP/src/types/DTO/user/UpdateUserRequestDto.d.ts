import { AnyAccessPrivileges } from "@/types/AccessPrivileges";

export class UpdateUserRequestDto {
  id: string;
  code?: string;
  password?: string;
  accessPrivileges?: AnyAccessPrivileges[];
}
