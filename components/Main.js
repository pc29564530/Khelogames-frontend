import React, {useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Text, View, StyleSheet, Button, SafeAreaView, Touchable} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Constants from 'expo-constants';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Header from './Header';
import Footer from './Footer';
import Home from './Home';
import { createStackNavigator } from '@react-navigation/stack';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const styles = StyleSheet.create({
    container: {
        marginTop: Constants.statusBarHeight,
        flexGrow: 1,
        flexShrink:1,
    }
})

 
const Main = ({logout}) => {
    console.log('Main component rendered');
    return (
        <>  
            <Header logout={logout}/>
            <Footer logout={logout}/>
        </>
    )
}

export default Main;
