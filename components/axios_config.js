import React, {useEffect} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';



//create a new instance of the axios
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080',
})

function useAxiosInterceptor() {
    const navigation = useNavigation();

    useEffect(() => {

        axiosInstance.interceptors.request.use(
            async (config) => {
                const accessToken = await  AsyncStorage.getItem('AccessToken');
        
                if (accessToken) {
                    config.headers['Authorization'] =   `Bearer ${accessToken}`;
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
                if (error.response && error.response.status === 401){
                   navigation.navigate('SignIn');
        
                }
                return Promise.reject(error)
            }
        )
        
    }, [navigation]);
    return axiosInstance;
}

export default useAxiosInterceptor;