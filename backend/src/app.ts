import express from 'express';
import gameRouter from './routes/game.router';
import authRouter from './routes/auth.router';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';
import path from 'node:path';

const app = express();
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms'),
);
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api/game', gameRouter);
app.use('/api/auth', authRouter);
app.use(
  express.static(path.join(__dirname, './dist'), {
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath);
      if (ext === '.js') {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (ext === '.css') {
        res.setHeader('Content-Type', 'text/css');
      } else if (ext === '.html') {
        res.setHeader('Content-Type', 'text/html');
      }
    },
  }),
);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './dist/index.html'));
});
const server = app.listen(3000, () => `Listening on port 3000`);
export default server;
