import { Request, Response, NextFunction } from 'express';
import jwtService from '../service/jwt.service';
import responseService from '../service/response.service';
import dbService from '../service/db.service';

export interface CustomRequest extends Request {
  user?: { username: string };
}

export async function verifyAccessToken(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    console.error(new Error('token not found in authHeader'));
    return res.status(400).send(
      responseService.createErrorResponse({
        message: 'Token not found ❌',
      }),
    );
  }
  const accessToken = authHeader.split(' ')[1];
  try {
    const r: {
      username: string;
    } = await jwtService.verifyAccessToken(accessToken);
    if (!('username' in r)) {
      console.error(new Error('username not found in access token'));
      return res.status(403).send(
        responseService.createErrorResponse({
          message: 'Invalid token received ❌',
        }),
      );
    }
    req.user = { username: r.username };
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).send(
      responseService.createErrorResponse({
        message: 'Internal Server Error ❌',
      }),
    );
  }
}

export async function verifyRefreshToken(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) {
  const refreshToken = req.cookies.jwt;
  if (!refreshToken) {
    console.error(new Error('refresh token not found'));
    return res.status(400).send(
      responseService.createErrorResponse({
        message: `Token not received ❌`,
      }),
    );
  }
  try {
    const r: {
      username: string;
    } = await jwtService.verifyRefreshToken(refreshToken);
    if (!('username' in r)) {
      console.error(new Error('username not found in refresh token'));
      return res.status(403).send(
        responseService.createErrorResponse({
          message: 'Invalid token received ❌',
        }),
      );
    }
    const { username } = r;
    try {
      await dbService.compareRefreshToken(username, refreshToken);
    } catch (err) {
      console.error(err);
      return res.status(403).send(
        responseService.createErrorResponse({
          message: 'Invalid token received ❌',
        }),
      );
    }
    req.user = { username: username };
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).send(
      responseService.createErrorResponse({
        message: 'Internal Server Error ❌',
      }),
    );
  }
}

export function blockOnAccessToken(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    console.error(new Error('token not found in authHeader'));
    return res.status(400).send(
      responseService.createErrorResponse({
        message: `User can't perform this operation while logged in ❌`,
      }),
    );
  }
  next();
}
