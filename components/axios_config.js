import React, {useEffect} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';



//create a new instance of the axios
const axiosInstance = axios.create();

// const axiosInstance = axios.create();

function useAxiosInterceptor() {
    const navigation = useNavigation();
    console.log("line no 15")
    useEffect(() => {

        axiosInstance.interceptors.request.use(
            async (config) => {
                const accessToken = await  AsyncStorage.getItem('AccessToken');
        
                if (accessToken) {
                    config.headers['Authorization'] =  `Bearer ${accessToken}`;
                }
                console.log(accessToken)
                // console.log(config);
        
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
                console.log("line no 42")
                if (error.response && error.response.status === 401){
                    console.log("line no 44")
                    try {
                        console.log("line no 46")
                        const autoData = await AsyncStorage.getItem('RefreshToken');
                        console.log("line no 48");
                        // const refresh_token = refreshToken
                        // console.log(refresh_token)
                        // const authToken = await AsyncStorage.getItem('AccessToken');
                        // const headers = {
                        // 'Authorization': `Bearer ${authToken}`,
                        // 'Content-Type': 'application/json',
                        // }
                        console.log(autoData)
                        const response  = await axios.post('http://1192.168.0.107:8080/tokens/renew_access', {'refresh_token': autoData} );
                        console.log(response.data.access_token)

                        if(response.data.access_token) {
                            await AsyncStorage.setItem('AccessToken', response.data.access_token)
                             error.config.headers['Authorization'] = `Bearer ${response.data.access_token}`;
                             return axiosInstance(error.config);
                        }  else {
                            await AsyncStorage.removeItem('AccessToken')
                            await AsyncStorage.setItem('RefreshToken');
                            await AsyncStorage.setItem('User');
                            navigation.navigate('SignIn');
                        }

                    } catch(err) {
                        console.error("Error occuer regenrating access token %s", err)
                        navigation.navigate('SignIn');
                    }
        
                }
                return Promise.reject(error)
            }
        )
        
    }, [navigation]);
    return axiosInstance;
}

export default useAxiosInterceptor;