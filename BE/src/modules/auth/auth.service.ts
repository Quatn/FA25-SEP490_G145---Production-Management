import { JwtPayload } from "@/common/interfaces/jwt-payload.interface";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserDocument, UserSchema } from "../user/schemas/user.schema";
import { UserService } from "../user/user.service";
import check from "check-types";
import bcrypt from "bcrypt";
import { EmployeeSchema } from "../employee/schemas/employee.schema";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) { }

  async validateUser(code: string, password: string): Promise<UserDocument> {
    const user = await this.userService.findByCode(code);
    if (!check.null(user) && !check.undefined(user)) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const employeePath = UserSchema.path("employee");
        const rolePath = EmployeeSchema.path("role");
        await user.populate({
          path: employeePath.path,
          populate: rolePath.path,
        });
        return user;
      }
      throw new UnauthorizedException("Invalid credentials");
    }
    throw new UnauthorizedException("User not found");
  }

  async login(user: UserDocument): Promise<{ access_token?: string }> {
    const payload: JwtPayload = {
      id: user._id.toString(),
      code: user.code,
      accessPrivileges: user.accessPrivileges.join(","),
    };

    // Yes, this could have been a sync sign, I just wanted to keep this function async without ts-server screaming at me
    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
    };
  }
}
