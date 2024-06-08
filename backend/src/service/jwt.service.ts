import 'dotenv/config';
import jwt from 'jsonwebtoken';

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!;

export default {
  generateAccessToken(
    payload: object,
    expiresIn: string | number = '15m',
  ): string {
    return jwt.sign(payload, accessTokenSecret, { expiresIn });
  },

  generateRefreshToken(
    payload: object,
    expiresIn: string | number = '7d',
  ): string {
    return jwt.sign(payload, refreshTokenSecret, { expiresIn });
  },

  verifyAccessToken(token: string): Promise<{ username: string }> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, accessTokenSecret, (err, decoded: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });
  },

  verifyRefreshToken(token: string): Promise<{ username: string }> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, refreshTokenSecret, (err, decoded: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });
  },
};
