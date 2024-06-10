import axios from 'axios';
import store from '../store/store.ts';
import { authThunk } from '../store/authSlice.ts';

export interface ApiResponse {
  success: boolean;
  message: string;
  data: object;
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = store.getState().auth;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    throw error;
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      await store.dispatch(authThunk.refreshAccessToken());
      return axiosInstance(error.config);
    }
    throw error;
  },
);

export default axiosInstance;
