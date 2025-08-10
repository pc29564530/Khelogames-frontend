import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_URL } from '../constants/ApiConstants';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("AccessToken");
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
        const refreshToken = await AsyncStorage.getItem("RefreshToken");

        const response = await axios.post(`${AUTH_URL}/tokens/renew_access`, {
          refresh_token: refreshToken,
        });
        console.log("Renew Access: ", response.data)

        const newAccessToken = response.data.AccessToken;

        await AsyncStorage.setItem("AccessToken", newAccessToken);
        await AsyncStorage.setItem("AccessTokenExpiresAt", response.data.AccessTokenExpiresAt);

        axiosInstance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
