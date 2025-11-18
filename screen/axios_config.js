import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_URL } from '../constants/ApiConstants';
import { setAuthenticated, logout } from '../redux/actions/actions';
import { store } from '../redux/store';
import { navigationRef } from '../navigation/NavigationService';

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
    // Clear AsyncStorage (access tokens, user data, etc.)
    await AsyncStorage.clear();
    store.dispatch(logout());
    store.dispatch(setAuthenticated(false));
    if (navigationRef.isReady()) {
      navigationRef.navigate('SignIn');
    }
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
        const refreshTokenExpiresAt = await AsyncStorage.getItem("RefreshTokenExpiresAt")
        // Check if refresh token exists
        if (!refreshToken) {
          console.log('❌ No refresh token found in Keystore - logging out');
          processQueue(new Error('No refresh token'), null);
          await logoutFunc();
          return Promise.reject(new Error('No refresh token'));
        }

        // Check if refresh token is expired
        if (refreshTokenExpiresAt) {
          const currentTime = new Date().getTime();
          const expiresAt = new Date(refreshTokenExpiresAt).getTime();
          
          if (currentTime >= expiresAt) {
            console.log('❌ Refresh token expired - logging out');
            processQueue(new Error('Refresh token expired'), null);
            await logoutFunc();
            return Promise.reject(new Error('Refresh token expired'));
          }
        }

        // Attempt to refresh the access token
        const response = await axios.post(`${AUTH_URL}/tokens/renew_access`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = response?.data?.access_token ?? response?.data?.AccessToken;
        const expiresAt = response?.data?.access_token_expires_at ?? response?.data?.AccessTokenExpiresAt;

        if (!newAccessToken || !expiresAt) {
          throw new Error('Refresh response missing access token or expiry');
        }

        await AsyncStorage.setItem('AccessToken', newAccessToken);
        await AsyncStorage.setItem('AccessTokenExpiresAt', expiresAt);

        store.dispatch(setAuthenticated(true));

        axiosInstance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return axiosInstance(originalRequest);
      } catch (err) {
        // If refresh fails (401, 403, or any error), it means refresh token is invalid/expired
        console.log('❌ Token refresh failed - logging out:', err.response?.status || err.message);
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
