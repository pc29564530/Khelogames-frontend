import React, {useState, useEffect, useRef} from 'react';
// import {View} from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Main from './components/Main';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import User from './components/User';
import {Provider, useSelector, useDispatch} from 'react-redux'
import ThreadComment from './components/ThreadComment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import store from './redux/store';
import rootReducer from './redux/reducers';
import ProfileMenu from './components/ProfileMenu';
// import { applyMiddleware, useSelector } from 'react-redux';
import {checkExpireTime,setAuthenticated, setUser} from './redux/actions/actions';


const Stack = createStackNavigator();

export default function Root() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  useEffect(() => {
    
    const checkAuthStatus = async () => {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const user = await AsyncStorage.getItem('User');
      if (authToken) {
        dispatch(setAuthenticated(true));
        dispatch(setUser(user))
      }
    };
  
    checkAuthStatus();
    dispatch(checkExpireTime())
  }, []);

  return (  
      <NavigationContainer>
        <Stack.Navigator 
            initialRouteName={isAuthenticated?'Main':'SignIn'}
            screenOptions={{
              headerTitle: null,
              headerTransparent: false,
              headerShown: false,
              headerLeft: null,
              headerBackTitleVisible: false,
            }}  
        >
          {!isAuthenticated ? (
              <>
                <Stack.Screen name="SignUp" component={SignUp}/>
                <Stack.Screen name="User" component={User}
                  options={{
                    headerTitle: null,
                    headerTransparent: false,
                    headerShown: false,
                    headerLeft: null,
                    headerBackTitleVisible: false,
                  }}
                />
                <Stack.Screen name="SignIn" component={SignIn}
                    options={{
                    headerTitle: null,
                    headerTransparent: false,
                    headerShown: false,
                    headerLeft: null,
                    headerBackTitleVisible: false,
                  }}
                />
              </>
            ):(
            <>
                <Stack.Screen name="Main"
                  component={Main}
                  options={{
                    headerTitle: null,
                    headerTransparent: false,
                    headerShown: false,
                    headerLeft: null,
                    headerBackTitleVisible: false,
                  }}
               />
                <Stack.Screen name="ThreadComment" component={ThreadComment} 
                options={({ navigation }) => ({
                headerShown: true,
                headerTitle: null,
                headerBackTitleVisible: false,
                headerLeft: () => (
                  <Ionicons
                    name="arrow-back"
                    size={30}
                    style={{ marginLeft: 10 }}
                    onPress={() => navigation.goBack()}
                  />
                ),
              })}
                  />
                  <Stack.Screen name="ProfileMenu" component={ProfileMenu} 
                options={({ navigation }) => ({
                headerShown: true,
                headerTitle: null,
                headerBackTitleVisible: false,
                headerLeft: () => (
                  <Ionicons
                    name="arrow-back"
                    size={30}
                    style={{ marginLeft: 10 }}
                    onPress={() => navigation.goBack()}
                  />
                ),
              })}
                  />
            </>
          )}
        </Stack.Navigator>
          
      </NavigationContainer>
    
  );
}