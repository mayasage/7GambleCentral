import 'dotenv/config';

const sqlite3 = require('sqlite3').verbose();
import bcryptService from './bcrypt.service';

const db = new sqlite3.Database(process.env.DB_PATH);

const dbm = new sqlite3.Database(':memory:');
dbm.run(
  `
    CREATE TABLE sessions (
      sessionId TEXT PRIMARY KEY,
      gameState JSON NOT NULL,
      gameHistory JSON NOT NULL
    );
  `,
  (err: { message: any }) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Sessions table created in memory.');
    }
  },
);

interface User {
  id: number;
  username: string;
  password: string;
  refresh_token?: string;
}

export interface GameState {
  chips: number;
  stake: 100 | 200 | 500;
  bet: '7d' | '7' | '7u';
  diceRoll: number[];
  winRate: -1 | 0 | 2 | 5;
  delta: number;
}

interface Session {
  sessionId: string;
  gameState: GameState;
  gameHistory: GameState[];
}

export default {
  async createUser(username: string, password: string): Promise<unknown> {
    const hashedPwd = await bcryptService.hashPwd(password);
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPwd],
        (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        },
      );
    });
  },

  fetchUser(username: string): Promise<{
    id: number;
    username: string;
    password: string;
  } | null> {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err: { message: any }, row: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        },
      );
    });
  },

  async verifyUser(username: string, password: string) {
    const user = await this.fetchUser(username);
    if (!user) {
      return { success: false, user: null };
    }
    const success = await bcryptService.comparePwd(password, user.password);
    return { success, user };
  },

  updateRefreshToken(username: string, refreshToken: string | null) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET refresh_token = ? WHERE username = ?',
        [refreshToken, username],
        function (err: any) {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        },
      );
    });
  },

  async compareRefreshToken(username: string, refreshToken: string | null) {
    const user: User | null = await this.fetchUser(username);
    if (!user) {
      return false;
    }
    return user.refresh_token === refreshToken;
  },

  createSession(
    sessionId: string,
    gameState: GameState,
    gameHistory: GameState[],
  ) {
    return new Promise((resolve, reject) => {
      dbm.run(
        'INSERT INTO sessions (sessionId, gameState, gameHistory) VALUES (?,' +
          ' ?, ?)',
        [sessionId, JSON.stringify(gameState), JSON.stringify(gameHistory)],
        (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        },
      );
    });
  },

  fetchSession(sessionId: string): Promise<Session | null> {
    return new Promise((resolve, reject) => {
      dbm.get(
        'SELECT * FROM sessions WHERE sessionId = ?',
        [sessionId],
        (
          err: any,
          row:
            | Session
            | {
                sessionId: string;
                gameState: string;
                gameHistory: string;
              }
            | null,
        ) => {
          if (err) {
            reject(err);
          } else {
            let parsedSession: Session | null = null;
            if (row) {
              if (typeof row.gameState === 'string') {
                row.gameState = JSON.parse(row.gameState);
              }
              if (typeof row.gameHistory === 'string') {
                row.gameHistory = JSON.parse(row.gameHistory);
              }
              parsedSession = {
                sessionId,
                gameState: row.gameState as GameState,
                gameHistory: row.gameHistory as GameState[] | [],
              };
            }
            resolve(parsedSession);
          }
        },
      );
    });
  },

  fetchAllSessions(): Promise<Session[]> {
    return new Promise((resolve, reject) => {
      dbm.all('SELECT * FROM sessions', [], (err: any, row: Session[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(
            row.map(
              (
                r:
                  | Session
                  | {
                      sessionId: string;
                      gameState: string;
                      gameHistory: string;
                    }
                  | null,
              ) => {
                let parsedSession: Session | null = null;
                if (r) {
                  if (typeof r.gameState === 'string') {
                    r.gameState = JSON.parse(r.gameState);
                  }
                  if (typeof r.gameHistory === 'string') {
                    r.gameHistory = JSON.parse(r.gameHistory);
                  }
                  parsedSession = {
                    sessionId: r.sessionId,
                    gameState: r.gameState as GameState,
                    gameHistory: r.gameHistory as GameState[] | [],
                  };
                }
                return parsedSession;
              },
            ) as Session[],
          );
        }
      });
    });
  },

  async updateSession(
    sessionId: string,
    gameState: GameState,
    gameHistory: GameState[],
  ) {
    return new Promise((resolve, reject) => {
      dbm.run(
        'UPDATE sessions SET gameState = ?, gameHistory = ? WHERE sessionId' +
          ' = ?',
        [JSON.stringify(gameState), JSON.stringify(gameHistory), sessionId],
        (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        },
      );
    });
  },

  clearSession(sessionId: string) {
    return new Promise((resolve, reject) => {
      dbm.run(
        'DELETE FROM sessions WHERE sessionId = ?',
        [sessionId],
        (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        },
      );
    });
  },

  clearAllSessions() {
    return new Promise((resolve, reject) => {
      dbm.run('DELETE FROM sessions', [], (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  },
};
