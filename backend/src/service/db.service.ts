import 'dotenv/config';

const sqlite3 = require('sqlite3').verbose();
import bcryptService from './bcrypt.service';

const db = new sqlite3.Database(process.env.DB_PATH);

const dbm = new sqlite3.Database(':memory:');
dbm.run(
  `
    CREATE TABLE sessions (
      sessionId TEXT PRIMARY KEY,
      state JSON NOT NULL,
      history JSON NOT NULL
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
  state: GameState;
  history: GameState[];
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

  createSession(sessionId: string, state: GameState, history: GameState[]) {
    return new Promise((resolve, reject) => {
      dbm.run(
        'INSERT INTO sessions (sessionId, state, history) VALUES (?, ?, ?)',
        [sessionId, JSON.stringify(state), JSON.stringify(history)],
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
                state: string;
                history: string;
              }
            | null,
        ) => {
          if (err) {
            reject(err);
          } else {
            let parsedSession: Session | null = null;
            if (row) {
              if (typeof row.state === 'string') {
                row.state = JSON.parse(row.state);
              }
              if (typeof row.history === 'string') {
                row.history = JSON.parse(row.history);
              }
              parsedSession = {
                sessionId,
                state: row.state as GameState,
                history: row.history as GameState[] | [],
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
                      state: string;
                      history: string;
                    }
                  | null,
              ) => {
                let parsedSession: Session | null = null;
                if (r) {
                  if (typeof r.state === 'string') {
                    r.state = JSON.parse(r.state);
                  }
                  if (typeof r.history === 'string') {
                    r.history = JSON.parse(r.history);
                  }
                  parsedSession = {
                    sessionId: r.sessionId,
                    state: r.state as GameState,
                    history: r.history as GameState[] | [],
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
    state: GameState,
    history: GameState[],
  ) {
    return new Promise((resolve, reject) => {
      dbm.run(
        'UPDATE sessions SET state = ?, history = ? WHERE sessionId = ?',
        [JSON.stringify(state), JSON.stringify(history), sessionId],
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
      dbm.run('DELETE FROM sessions', [], (err: any, res: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  },
};
