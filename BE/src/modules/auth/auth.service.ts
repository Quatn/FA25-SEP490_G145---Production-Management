import { JwtPayload } from "@/common/interfaces/jwt-payload.interface";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) { }

  async validateUser(username: string, password: string) {
    // Replace this with real user check (e.g., from MongoDB)
    if (username === "admin" && password === "password123") {
      return { userId: 1, username: "admin", role: "admin" };
    }
    throw new UnauthorizedException("Invalid credentials");
  }

  async login(user: any): Promise<{ access_token?: string }> {
    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
