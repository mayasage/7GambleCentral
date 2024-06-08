import express from 'express';
import gameRouter from './routes/game.router';
import authRouter from './routes/auth.router';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
);
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api/game', gameRouter);
app.use('/api/auth', authRouter);
const server = app.listen(3000, () => `Listening on port 3000`);
export default server;
