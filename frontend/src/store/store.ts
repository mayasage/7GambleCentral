import { combineReducers, configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice.ts';
import authReducer from './authSlice.ts';

const rootReducer = combineReducers({
  game: gameReducer,
  auth: authReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
