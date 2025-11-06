import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) { }

  async validateUser(username: string, password: string): Promise<any> {
    // Replace this with real user check (e.g., from MongoDB)
    if (username === 'admin' && password === 'password123') {
      return { userId: 1, username: 'admin', role: 'admin' };
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.userId,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
