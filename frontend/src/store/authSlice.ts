import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance, { ApiResponse } from '../service/axios.service.ts';
import { AxiosError } from 'axios';

type ApiName = 'login' | 'logout' | 'signup' | 'refreshToken';
type ApiStatus = 'idle' | 'pending' | 'fulfilled' | 'rejected';

interface ApiState {
  status: ApiStatus;
  error: AxiosError | null;
}

interface State {
  accessToken: string;
  apiState: {
    login: ApiState;
    logout: ApiState;
    signup: ApiState;
    refreshToken: ApiState;
  };
  userCredentialsInput: {
    username: string;
    password: string;
  };
  isAuthenticated: boolean;
}

export interface User {
  username: string;
  password: string;
}

const initialState: State = {
  accessToken: '',
  apiState: {
    login: {
      status: 'idle',
      error: null,
    },
    logout: {
      status: 'idle',
      error: null,
    },
    signup: {
      status: 'idle',
      error: null,
    },
    refreshToken: {
      status: 'idle',
      error: null,
    },
  },
  userCredentialsInput: {
    username: '',
    password: '',
  },
  isAuthenticated: false,
};

export interface clearApiError {
  api: ApiName;
}

export const authThunk = {
  login: createAsyncThunk(
    'auth/login',
    async (credentials: User, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.post(
          '/api/auth/login',
          credentials,
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
  logout: createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post('/api/auth/logout');
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
  signup: createAsyncThunk(
    'auth/signup',
    async (credentials: User, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.post(
          '/api/auth/signup',
          credentials,
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
  refreshAccessToken: createAsyncThunk(
    'auth/accessToken',
    async (_, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.get('/api/auth/accessToken');
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
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearApiError: (state, action: PayloadAction<clearApiError>) => {
      const { api } = action.payload;
      state.apiState[api].error = null;
      state.apiState[api].status = 'idle';
    },
    setUsernameInCredentials: (state, action) => {
      state.userCredentialsInput.username = action.payload;
    },
    setPasswordInCredentials: (state, action) => {
      state.userCredentialsInput.password = action.payload;
    },
    clearCredentials: (state) => {
      state.userCredentialsInput.username = '';
      state.userCredentialsInput.password = '';
    },
  },
  extraReducers: (builder) => {
    // Reducer for handling login request
    builder.addCase(authThunk.login.pending, (state) => {
      state.apiState.login.status = 'pending';
    });
    builder.addCase(authThunk.login.fulfilled, (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.apiState.login.status = 'fulfilled';
    });
    builder.addCase(authThunk.login.rejected, (state, action) => {
      state.apiState.login.status = 'rejected';
      state.apiState.login.error = action.payload as AxiosError;
    });
    // Reducer for handling logout request
    builder.addCase(authThunk.logout.pending, (state) => {
      state.apiState.logout.status = 'pending';
    });
    builder.addCase(authThunk.logout.fulfilled, (state) => {
      state.accessToken = '';
      state.isAuthenticated = false;
      state.apiState.logout.status = 'fulfilled';
      // clear jwt from cookies if needed
    });
    builder.addCase(authThunk.logout.rejected, (state, action) => {
      state.isAuthenticated = false;
      state.accessToken = '';
      state.apiState.logout.status = 'rejected';
      state.apiState.login.error = action.payload as AxiosError;
    });
    // Reducer for handling refresh token request
    builder.addCase(authThunk.refreshAccessToken.pending, (state) => {
      state.apiState.refreshToken.status = 'pending';
    });
    builder.addCase(authThunk.refreshAccessToken.fulfilled, (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.apiState.refreshToken.status = 'fulfilled';
    });
    builder.addCase(authThunk.refreshAccessToken.rejected, (state, action) => {
      state.apiState.refreshToken.status = 'rejected';
      state.apiState.login.error = action.payload as AxiosError;
    });
    // Reducer for handling signup request
    builder.addCase(authThunk.signup.pending, (state) => {
      state.apiState.signup.status = 'pending';
    });
    builder.addCase(authThunk.signup.fulfilled, (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.apiState.signup.status = 'fulfilled';
    });
    builder.addCase(authThunk.signup.rejected, (state, action) => {
      state.apiState.signup.status = 'rejected';
      state.apiState.signup.error = action.payload as AxiosError;
    });
  },
});

export const authAction = {
  clearApiError: authSlice.actions.clearApiError,
  setUsernameInCredentials: authSlice.actions.setUsernameInCredentials,
  setPasswordInCredentials: authSlice.actions.setPasswordInCredentials,
  clearCredentials: authSlice.actions.clearCredentials,
};
export default authSlice.reducer;
