import React, {useEffect} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';



//create a new instance of the axios
const axiosInstance = axios.create();


function useAxiosInterceptor() {
    const navigation = useNavigation();
  
    useEffect(() => {
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
  
      axiosInstance.interceptors.response.use(
        (response) => {
          return response;
        },
        async (error) => {
          if (error.response && error.response.status === 401) {
            try {
              const refreshToken = await AsyncStorage.getItem('RefreshToken');
              if (refreshToken) {
                  console.log("lin no 34 refresh token")
                const response = await axios.post('http://192.168.0.102:8080/tokens/renew_access', {
                  'refresh_token': refreshToken,
                });
                console.log(response.data)
                console.log("line no 38")
                if (response.data.access_token) {
                  // Renewal was successful, update the access token
                  await AsyncStorage.setItem('AccessToken', response.data.access_token);
                  error.config.headers['Authorization'] = `Bearer ${response.data.access_token}`;
                  return axiosInstance(error.config);
                } else {
                  // Failed to renew token or received an invalid token
                  const username = await AsyncStorage.getItem('User')
                  await axios.delete(`http://192.168.0.102:8080/removeSession/${username}`)
                  await AsyncStorage.removeItem('AccessToken');
                  await AsyncStorage.removeItem('RefreshToken');
                  await AsyncStorage.removeItem('User');
                  navigation.navigate('SignIn');
                }
              } else {
                // No refresh token is available
                navigation.navigate('SignIn');
              }
            } catch (err) {
              console.error("Error occurred while regenerating the access token: ", err);
              navigation.navigate('SignIn');
            }
          }
          return Promise.reject(error);
        }
      );
    }, [navigation]);
  
    return axiosInstance;
  }
  
  export default useAxiosInterceptor;