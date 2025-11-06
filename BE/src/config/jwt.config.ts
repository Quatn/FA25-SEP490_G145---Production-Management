import { JwtSignOptions } from '@nestjs/jwt';

// Currently useless as the current authorization strategy is single token
export const refreshTokenSignOptions: JwtSignOptions = {};

export const accessTokenSignOptions: JwtSignOptions = {
  expiresIn: 1000 * 60 * 60 * 24 * 7, // 7 days
};
