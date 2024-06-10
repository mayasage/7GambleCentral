import express = require('express');
import randService from '../service/rand.service';
import { validateSchema } from '../middleware/validator.middleware';
import { verifyAccessToken } from '../middleware/auth.middleware';
import responseService from '../service/response.service';
import dbService from '../service/db.service';

const gameRouter = express.Router();

gameRouter.use(verifyAccessToken);

const startSchema = {
  type: 'object',
  properties: {
    gameState: {
      type: 'object',
      properties: {
        chips: { type: 'number', default: 5000 },
        stake: { type: 'number', default: -1 },
        bet: { type: 'string', default: '' },
        diceRoll: {
          type: 'array',
          items: { type: 'number', minimum: 1, maximum: 7 },
          anyOf: [{ maxItems: 0 }, { minItems: 2, maxItems: 2 }],
          default: [],
        },
        winRate: { type: 'number', default: -1 },
        delta: { type: 'number', default: -1 },
      },
      required: ['chips', 'stake', 'bet', 'diceRoll', 'winRate', 'delta'],
      additionalProperties: false,
    },
    history: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          chips: { type: 'number', default: 5000 },
          stake: { type: 'number', default: -1 },
          bet: { type: 'string', default: '' },
          diceRoll: {
            type: 'array',
            items: { type: 'number', minimum: 1, maximum: 7 },
            anyOf: [{ maxItems: 0 }, { minItems: 2, maxItems: 2 }],
            default: [],
          },
          winRate: { type: 'number', default: -1 },
          delta: { type: 'number', default: -1 },
        },
        required: ['chips', 'stake', 'bet', 'diceRoll', 'winRate', 'delta'],
        additionalProperties: false,
      },
      minItems: 1,
    },
  },
  required: ['gameState', 'history'],
  additionalProperties: false,
};
gameRouter.post('/start', validateSchema(startSchema), async (req, res) => {
  const sessionId = randService.uuid();
  try {
    await dbService.createSession(
      sessionId,
      req.body.gameState,
      req.body.history,
    );
  } catch (err) {
    console.error(err);
    return res.status(403).send(
      responseService.createErrorResponse({
        message: 'Error creating Session ❌',
      }),
    );
  }
  res.status(200).send(
    responseService.createSuccessResponse({
      data: { sessionId },
    }),
  );
});

gameRouter.get('/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  let session;
  try {
    session = await dbService.fetchSession(sessionId);
  } catch (err) {
    console.error(err);
    return res.status(403).send(
      responseService.createErrorResponse({
        message: 'Session not found ❌',
      }),
    );
  }
  res.status(200).send(
    responseService.createSuccessResponse({
      data: { session },
    }),
  );
});

gameRouter.delete('/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  let session;
  try {
    session = await dbService.clearSession(sessionId);
  } catch (err) {
    console.error(err);
    return res.status(403).send(
      responseService.createErrorResponse({
        message: 'Could not clear Session ❌',
      }),
    );
  }
  res.status(200).send(
    responseService.createSuccessResponse({
      data: { session },
    }),
  );
});

gameRouter.get('/session', async (_, res) => {
  let sessions;
  try {
    sessions = await dbService.fetchAllSessions();
  } catch (err) {
    console.error(err);
    return res.status(403).send(
      responseService.createErrorResponse({
        message: 'Session not found ❌',
      }),
    );
  }
  res.status(200).send(
    responseService.createSuccessResponse({
      data: { sessions },
    }),
  );
});

gameRouter.delete('/session', async (_, res) => {
  let sessions;
  try {
    sessions = await dbService.clearAllSessions();
  } catch (err) {
    console.error(err);
    return res.status(403).send(
      responseService.createErrorResponse({
        message: 'Failed to clear Sessions ❌',
      }),
    );
  }
  res.status(200).send(
    responseService.createSuccessResponse({
      data: { sessions },
    }),
  );
});

const rollSchema = {
  type: 'object',
  properties: {
    bet: { type: 'string', enum: ['7u', '7', '7d'] },
    stake: { type: 'number', enum: [100, 200, 500] },
  },
  required: ['bet', 'stake'],
  additionalProperties: false,
};
gameRouter.post(
  '/roll_die/:sessionId',
  validateSchema(rollSchema),
  async (req, res) => {
    const {
      bet,
      stake,
    }: {
      bet: '7u' | '7' | '7d';
      stake: 100 | 200 | 500;
    } = req.body;
    const { sessionId } = req.params;
    let session;
    try {
      session = await dbService.fetchSession(sessionId);
    } catch (err: any) {
      console.error(err);
      return res.status(500).send(
        responseService.createErrorResponse({
          message: 'Error fetching Session ❌',
        }),
      );
    }
    if (!session) {
      return res.status(400).send(
        responseService.createErrorResponse({
          message: 'Session not found ❌',
        }),
      );
    }
    const { gameState } = session;
    if (stake > gameState.chips && gameState.chips >= 100) {
      return res.status(500).send(
        responseService.createErrorResponse({
          message: 'Bet Lower ❗',
        }),
      );
    }
    if (gameState.chips <= 0 || stake > gameState.chips) {
      return res.status(500).send(
        responseService.createErrorResponse({
          message: 'Game over ❌',
        }),
      );
    }
    gameState.bet = bet;
    gameState.stake = stake;
    gameState.chips -= stake;
    gameState.delta = -stake;
    const diceRoll = [randService.int(1, 7), randService.int(1, 7)];
    gameState.diceRoll = diceRoll;
    const score = diceRoll[0] + diceRoll[1];
    let winRate: 0 | -1 | 2 | 5 = 0;
    if ((bet === '7u' && score > 7) || (bet === '7d' && score < 7)) {
      winRate = 2;
    }
    if (bet === '7' && score === 7) {
      winRate = 5;
    }
    gameState.winRate = winRate;
    if (winRate > 0) {
      gameState.delta = winRate * stake;
      gameState.chips += gameState.delta;
    }
    session.gameHistory.push(gameState);
    try {
      await dbService.updateSession(sessionId, gameState, session.gameHistory);
    } catch (err) {
      console.error(err);
      return res.status(500).send(
        responseService.createErrorResponse({
          message: 'Error updating state ❌',
        }),
      );
    }
    res.status(200).send(
      responseService.createSuccessResponse({
        data: { gameState, history: session.gameHistory },
      }),
    );
  },
);

export default gameRouter;
