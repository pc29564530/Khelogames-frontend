import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_URL } from '../constants/ApiConstants';
import { setAuthenticated, logout } from '../redux/actions/actions';
import store from '../redux/store';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    error ? prom.reject(error) : prom.resolve(token);
  });
  failedQueue = [];
};

const logoutFunc = async () => {
  try {
    await AsyncStorage.clear();
    store.dispatch(logout());
    store.dispatch(setAuthenticated(false));
  } catch (err) {
    console.error('Error during logout:', err);
  }
};

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('AccessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('RefreshToken');
        if (!refreshToken) {
          await logoutFunc();
          return Promise.reject();
        }

        const response = await axios.post(`${AUTH_URL}/tokens/renew_access`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = response.data.access_token;
        const expiresAt = response.data.access_token_expires_at;

        await AsyncStorage.setItem('AccessToken', newAccessToken);
        await AsyncStorage.setItem('AccessTokenExpiresAt', expiresAt);

        store.dispatch(setAuthenticated(true));

        axiosInstance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        await logoutFunc();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
