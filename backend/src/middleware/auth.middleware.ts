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
    return res.status(403).send(
      responseService.createErrorResponse({
        message: 'Invalid token received ❌',
      }),
    );
  }
  const accessToken = authHeader.split(' ')[1];
  try {
    const r: {
      username: string;
    } = await jwtService.verifyAccessToken(accessToken);
    if (!('username' in r)) {
      return res.status(403).send(
        responseService.createErrorResponse({
          message: 'Invalid token received ❌',
        }),
      );
    }
    req.user = { username: r.username };
    next();
  } catch (err) {
    return res.status(403).send(
      responseService.createErrorResponse({
        message: 'Invalid token received ❌',
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
    return res.status(403).send(
      responseService.createErrorResponse({
        message: `Invalid token received ❌`,
      }),
    );
  }
  try {
    const r: {
      username: string;
    } = await jwtService.verifyRefreshToken(refreshToken);
    if (!('username' in r)) {
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
      return res.status(403).send(
        responseService.createErrorResponse({
          message: 'Invalid token received ❌',
        }),
      );
    }
    req.user = { username: username };
    next();
  } catch (err) {
    return res.status(403).send(
      responseService.createErrorResponse({
        message: 'Invalid token received ❌',
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
    return res.status(403).send(
      responseService.createErrorResponse({
        message: `User can't perform this operation while logged in ❌`,
      }),
    );
  }
  next();
}
