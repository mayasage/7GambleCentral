import {createAsyncThunk, createSlice, PayloadAction,} from "@reduxjs/toolkit";

type Bet = "7u" | "7d" | "7" | "";
type Stake = 100 | 200 | 500 | -1;
type DiceNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type DiceRoll = [] | [DiceNumber, DiceNumber];

interface IntitialState {
  chips: number;
  stake: Stake;
  bet: Bet;
  diceRoll: DiceRoll;
  loading: boolean,
  error: object | null | string,
}

const initialState: IntitialState = {
  chips: 5000,
  stake: -1,
  bet: "",
  diceRoll: [],
  loading: false,
  error: null,
};

export const fetchDiceRoll = createAsyncThunk(
  'game/fetchDiceRoll',
  async (_, {rejectWithValue}) => {
    try {
      const response = await fetch('http://localhost:3000/api/game/roll_die');
      if (!response.ok) {
        throw new Error('Failed to fetch dice roll');
      }
      const data: DiceRoll = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const slice = createSlice({
  name: 'gameSlice',
  initialState,
  reducers: {
    rollDice(state, action: PayloadAction<[DiceNumber, DiceNumber]>) {
      state.diceRoll = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiceRoll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiceRoll.fulfilled, (state, action: PayloadAction<DiceRoll>) => {
        state.loading = false;
        state.diceRoll = action.payload;
      })
      .addCase(fetchDiceRoll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {rollDice} = slice.actions;
export default slice.reducer;
