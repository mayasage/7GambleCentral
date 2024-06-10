import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance, { ApiResponse } from '../service/axios.service.ts';
import { AxiosError } from 'axios';
import { RootState } from './store.ts';

type Bet = '7u' | '7d' | '7';
type Stake = 100 | 200 | 500;
type DiceNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type WinRate = 0 | 2 | 5;
type DiceRoll = [DiceNumber, DiceNumber];

type ApiName = 'start' | 'rollDie';
type ApiStatus = 'idle' | 'pending' | 'fulfilled' | 'rejected';

export interface clearApiError {
  api: ApiName;
}

interface ApiState {
  status: ApiStatus;
  error: AxiosError | null;
}

interface GameState {
  chips: number;
  stake: Stake | -1;
  bet: Bet | '';
  diceRoll: DiceRoll | [];
  winRate: WinRate | -1;
  delta: number;
}

type GameHistory = GameState[];

interface GameApiState {
  start: ApiState;
  rollDie: ApiState;
  clearSession: ApiState;
}

interface State {
  gameState: GameState;
  apiState: GameApiState;
  history: GameHistory;
  sessionId: string;
}

const initialGameState: GameState = {
  chips: 5000,
  stake: -1,
  bet: '',
  diceRoll: [],
  winRate: -1,
  delta: -1,
};

const initialHistoryState: GameHistory = [
  {
    chips: 5000,
    stake: -1,
    bet: '',
    diceRoll: [],
    winRate: -1,
    delta: -1,
  },
];

const initialGameApiState: GameApiState = {
  start: {
    status: 'idle',
    error: null,
  },
  rollDie: {
    status: 'idle',
    error: null,
  },
  clearSession: {
    status: 'idle',
    error: null,
  },
};

const initialState: State = {
  gameState: structuredClone(initialGameState),
  apiState: structuredClone(initialGameApiState),
  history: structuredClone(initialHistoryState),
  sessionId: '',
};

export const gameThunk = {
  start: createAsyncThunk('game/start', async (_, { rejectWithValue }) => {
    try {
      const data = structuredClone(initialState);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      delete data.sessionId;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      delete data.apiState;
      const response = await axiosInstance.post('/api/game/start', data);
      return response.data;
    } catch (err) {
      const e: ApiResponse = {
        success: false,
        message: err instanceof Error ? err.message : 'Some Error Occurred ❌',
        data: {},
      };
      if (err instanceof AxiosError) {
        e.message = err?.response?.data?.message || 'Some Error Occurred ❌';
      }
      return rejectWithValue(e);
    }
  }),
  rollDie: createAsyncThunk<any, undefined, { state: RootState }>(
    'game/rollDie',
    async (_, { getState, rejectWithValue }) => {
      try {
        const state: RootState = getState();
        const data = {
          bet: state.game.gameState.bet,
          stake: state.game.gameState.stake,
        };
        const response = await axiosInstance.post(
          `/api/game/roll_die/${state.game.sessionId}`,
          data,
        );
        return response.data.data;
      } catch (err) {
        const e: ApiResponse = {
          success: false,
          message:
            err instanceof Error ? err.message : 'Some Error Occurred ❌',
          data: {},
        };
        if (err instanceof AxiosError) {
          e.message = err?.response?.data?.message || 'Some Error Occurred ❌';
        }
        return rejectWithValue(e);
      }
    },
  ),
  clearSession: createAsyncThunk<any, undefined, { state: RootState }>(
    'game/clearSession',
    async (_, { getState, rejectWithValue }) => {
      try {
        const state: RootState = getState();
        const response = await axiosInstance.delete(
          `/api/game/session/${state.game.sessionId}`,
        );
        return response.data.success;
      } catch (err) {
        const e: ApiResponse = {
          success: false,
          message:
            err instanceof Error ? err.message : 'Some Error Occurred ❌',
          data: {},
        };
        if (err instanceof AxiosError) {
          e.message = err?.response?.data?.message || 'Some Error Occurred ❌';
        }
        return rejectWithValue(e);
      }
    },
  ),
};

const gameSlice = createSlice({
  name: 'game',
  initialState: structuredClone(initialState),
  reducers: {
    setStake(state, action: PayloadAction<Stake>) {
      state.gameState.stake = action.payload;
    },
    setBet(state, action: PayloadAction<Bet>) {
      state.gameState.bet = action.payload;
    },
    clearApiError: (state, action: PayloadAction<clearApiError>) => {
      const { api } = action.payload;
      state.apiState[api].error = null;
      state.apiState[api].status = 'idle';
    },
  },
  extraReducers: (builder) => {
    // Start API state
    builder.addCase(gameThunk.start.pending, (state) => {
      state.apiState.start.status = 'pending';
    });
    builder.addCase(gameThunk.start.fulfilled, (state, action) => {
      state.apiState.start.status = 'fulfilled';
      state.sessionId = action.payload.data.sessionId;
    });
    builder.addCase(gameThunk.start.rejected, (state, action) => {
      state.apiState.start.status = 'rejected';
      state.apiState.start.error = action.payload as AxiosError;
    });
    // Die Roll API state
    builder.addCase(gameThunk.rollDie.pending, (state) => {
      state.apiState.rollDie.status = 'pending';
    });
    builder.addCase(gameThunk.rollDie.fulfilled, (state, action) => {
      state.apiState.rollDie.status = 'fulfilled';
      state.history = action.payload.history;
      state.gameState = action.payload.gameState;
      state.apiState.rollDie.error = null;
    });
    builder.addCase(gameThunk.rollDie.rejected, (state, action) => {
      state.apiState.rollDie.status = 'rejected';
      state.apiState.rollDie.error = action.payload as AxiosError;
    });
    // Clear Session API state
    builder.addCase(gameThunk.clearSession.pending, (state) => {
      state.apiState.clearSession.status = 'pending';
    });
    builder.addCase(gameThunk.clearSession.fulfilled, (state) => {
      state.apiState.clearSession.status = 'fulfilled';
      state.sessionId = '';
      state.gameState = structuredClone(initialGameState);
      state.history = structuredClone(initialHistoryState);
    });
    builder.addCase(gameThunk.clearSession.rejected, (state, action) => {
      state.apiState.clearSession.status = 'rejected';
      state.apiState.clearSession.error = action.payload as AxiosError;
    });
  },
});

export const gameAction = {
  setBet: gameSlice.actions.setBet,
  setStake: gameSlice.actions.setStake,
  clearApiError: gameSlice.actions.clearApiError,
};
export default gameSlice.reducer;
