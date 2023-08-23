import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Main from './components/Main';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import User from './components/User';
import Home from './components/Home';
import Footer from './components/Footer';
import Header from './components/Header';
import Thread from './components/Thread';
import CreateThread from './components/CreateThread';
import Community from './components/Community';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Foundation from 'react-native-vector-icons/Foundation'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import ProfileMenu from './components/ProfileMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();




export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = async () => {
    console.log("Before logout:", await AsyncStorage.getItem('AccessToken'));
    await AsyncStorage.removeItem('AccessToken');
    await AsyncStorage.removeItem('RefreshToken');
    console.log("After logout:", await AsyncStorage.getItem('AccessToken'));
      setIsAuthenticated(false)
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      const authToken = await AsyncStorage.getItem('AccessToken');
      if (authToken) {
        console.log("authToke")
        setIsAuthenticated(true);
      }
    };
  
    checkAuthStatus();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator 
         initialRouteName='SignIn'
         screenOptions={{
           headerTitle: null,
           headerTransparent: true,
           headerShown: false,
           headerLeft: null,
           headerBackTitleVisible: false,
         }}  
      >
        {!isAuthenticated ? (
            <>
               <Stack.Screen name="SignUp" component={() => <SignUp setIsAuthentication={setIsAuthenticated}/>} />
              <Stack.Screen name="User" component={() => <User setIsAuthenticated={setIsAuthenticated}/>}/>
              <Stack.Screen name="SignIn" component={() => <SignIn setIsAuthenticated={setIsAuthenticated}/>} />
            </>
        ):(
          <>
             <Stack.Screen name="Main" component={() => <Main logout={logout}/>}  />
          </>
        )}

      </Stack.Navigator>
        
   </NavigationContainer>
    
  );
}

