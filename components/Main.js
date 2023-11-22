import React, {useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Text, View, StyleSheet, Platform} from 'react-native';
import Header from './Header';
import Footer from './Footer';


const Main =  () => {
    const statusBarHeight = Platform.OS === 'android' ? 0 : 20;

    useEffect(() => {
        const frun = async () => {
        await AsyncStorage.getItem('AccessToken')
        const accessTime = await AsyncStorage.getItem('AccessTokenExpiresAt')
        const refreshToken = await AsyncStorage.getItem('RefreshToken')
        console.log(refreshToken)
        const refreshExpiresAt = await AsyncStorage.getItem('RefreshTokenExpiresAt')
        console.log(accessTime)
        console.log(refreshExpiresAt)
        }
        const createProfile = async () => {
            const user = await AsyncStorage.getItem('User')
            const getUser = await axios.get(`http://192.168.0.103:8080/getProfile/${user}`);

            //added new profile creation funcitonality
            if(getUser.data == undefined || getUser.data == null) {
                try {
                    await axiosInstance.post(`http://192.168.0.103.8080/createProfile`, {username: user}, {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json'
                        }
                    })
                } catch (e) {
                    console.error("unable to create a profile: ", e)
                }
            }
        }
        createProfile();
        frun();
    }, [])
    return (
        <>
            <Header/>
            <Footer/>
        </>
    )
}

export default Main;
