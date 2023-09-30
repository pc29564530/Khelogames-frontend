import React, {useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Text, View, StyleSheet, Platform} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Header from './Header';
import Footer from './Footer';


import { createStackNavigator } from '@react-navigation/stack';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// const styles = StyleSheet.create({
//     container: {
//         marginTop: Constants.statusBarHeight,
//         flexGrow: 1,
//         flexShrink:1,
//     }
// })

 
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
        frun();
        
    }, [])
    return (
        // <View style={{ paddingTop: statusBarHeight }}> 
        <>
            <Header style={{shadowColor: '#171717',
                shadowOffset: {width: -2, height: 4},
                shadowOpacity: 0.2,
                shadowRadius: 3,}} />
            <Footer/>
        </>
    )
}

export default Main;
