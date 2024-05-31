import React, {useEffect} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { AUTH_URL } from '../constants/ApiConstants';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/actions/actions';



//create a new instance of the axios
const axiosInstance = axios.create();


function useAxiosInterceptor() {
    const navigation = useNavigation();
    const dispatch = useDispatch();
  
    useEffect(() => {

      //request of axios
      axiosInstance.interceptors.request.use(
        async (config) => {
          const accessToken = await AsyncStorage.getItem('AccessToken');
          if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );
      
      //response of axios
      axiosInstance.interceptors.response.use(
        (response) => {
          return response;
        },
        async (error) => {
          if (error.response && error.response.status === 401) {
            try {
              const refreshToken = await AsyncStorage.getItem('RefreshToken');
              if (refreshToken) {
                const response = await axios.post(`${AUTH_URL}/tokens/renew_access`, {
                  'refresh_token': refreshToken,
                });
                if (response.data.access_token) {
                  // Renewal was successful, update the access token
                  await AsyncStorage.setItem('AccessToken', response.data.access_token);
                  error.config.headers['Authorization'] = `Bearer ${response.data.access_token}`;
                  return axiosInstance(error.config);
                } else {
                  // Failed to renew token or received an invalid token
                  await handleTokenExpiry();
                }
              } else {
                // No refresh token is available
                await handleTokenExpiry();
              }
            } catch (err) {
              console.error("Error occurred while regenerating the access token: ", err);
              await handleTokenExpiry();
            }
          }
          return Promise.reject(error);
        }
      );
    }, [navigation]);

    const handleTokenExpiry = async () => {
      try {
        const username = await AsyncStorage.getItem('User');
        if (username) {
          await axios.delete(`${AUTH_URL}/removeSession/${username}`)
        }
        dispatch(logout())
        await AsyncStorage.removeItem('AccessToken');
        await AsyncStorage.removeItem('RefreshToken');
        await AsyncStorage.removeItem('User');
      } catch (error) {
        console.error("Error during token expiry handling: ", error);
      }
      navigation.navigate('SignIn');
    }
  
    return axiosInstance;
  }
  
  export default useAxiosInterceptor;