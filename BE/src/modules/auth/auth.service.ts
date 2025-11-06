import { JwtPayload } from "@/common/interfaces/jwt-payload.interface";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User, UserRole } from "../user/schemas/user.schema";
import { Types } from "mongoose";
import { UserService } from "../user/user.service";
import check from "check-types";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) { }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userService.findByUsername(username);
    if (!check.null(user)) {
      if (user.password === password) return user;
      throw new UnauthorizedException("Invalid credentials");
    }
    throw new UnauthorizedException("User not found");
  }

  async login(user: User): Promise<{ access_token?: string }> {
    const payload: JwtPayload = {
      id: (user._id as Types.ObjectId).toString(),
      username: user.username,
      role: user.role,
    };

    // Yes, this could have been a sync sign, I just wanted to keep this function async without ts-server screaming at me
    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
    };
  }
}
