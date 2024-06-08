import express, { Response } from 'express';
import dbService from '../service/db.service';
import jwtService from '../service/jwt.service';
import {
  blockOnAccessToken,
  CustomRequest,
  verifyRefreshToken,
} from '../middleware/auth.middleware';
import responseService from '../service/response.service';

const authRouter = express.Router();

async function updateToken(username: string, res: Response) {
  const jwtObject = { username };
  const accessToken = jwtService.generateAccessToken(jwtObject);
  const refreshToken = jwtService.generateRefreshToken(jwtObject);
  await dbService.updateRefreshToken(username, refreshToken);
  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).send(
    responseService.createSuccessResponse({
      data: { accessToken: accessToken },
    }),
  );
}

authRouter.post('/login', blockOnAccessToken, async (req, res) => {
  const { username, password } = req.body;
  try {
    const r = await dbService.verifyUser(username, password);
    if (!r.success || !r.user || !r.user.username) {
      return res.status(400).send(
        responseService.createErrorResponse({
          message: 'User not found ❌',
        }),
      );
    }
    await updateToken(r.user.username, res);
  } catch (err: any) {
    return res.status(400).send(
      responseService.createErrorResponse({
        message: err.message,
      }),
    );
  }
});

authRouter.post('/signup', blockOnAccessToken, async (req, res, next) => {
  const { username, password } = req.body;
  try {
    await dbService.createUser(username, password);
  } catch (err: any) {
    return res.status(400).send(
      responseService.createErrorResponse({
        message: err.errno === 19 ? 'User already exist ❌' : err.message,
      }),
    );
  }
  await updateToken(username, res);
});

authRouter.post(
  '/logout',
  verifyRefreshToken,
  async (req: CustomRequest, res, next) => {
    try {
      if (req.user && req.user.username) {
        await dbService.updateRefreshToken(req.user.username, null);
        res.clearCookie('jwt');
        res.status(200).send(responseService.createSuccessResponse());
      } else {
        return res.status(400).send(
          responseService.createErrorResponse({
            message: 'User not found ❌',
          }),
        );
      }
    } catch (err: any) {
      return res.status(400).send(
        responseService.createErrorResponse({
          message: 'User not found ❌',
        }),
      );
    }
  },
);

authRouter.get(
  '/accessToken',
  verifyRefreshToken,
  async (req: CustomRequest, res: Response) => {
    try {
      const jwtObject = { username: req.user!.username };
      const accessToken = jwtService.generateAccessToken(jwtObject);
      res.status(200).send(
        responseService.createSuccessResponse({
          data: { accessToken: accessToken },
        }),
      );
    } catch (err: any) {
      return res.status(400).send(
        responseService.createErrorResponse({
          message: err.message,
        }),
      );
    }
  },
);

export default authRouter;
