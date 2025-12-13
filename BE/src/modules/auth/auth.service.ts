import { JwtPayload } from "@/common/interfaces/jwt-payload.interface";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserDocument } from "../user/schemas/user.schema";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) { }

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
