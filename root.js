import React, {useState, useEffect, useRef} from 'react';
// import {View} from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
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
import Profile from './components/Profile';
import JoinCommunity from './components/JoinCommunity';
import Search from  './components/Search';
// import { applyMiddleware, useSelector } from 'react-redux';
import {checkExpireTime,setAuthenticated, setUser} from './redux/actions/actions';
import EditProfile from './components/EditProfile';


const Stack = createStackNavigator();

export default function Root() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const iconSize = 30
  useEffect(() => {
    
    const checkAuthStatus = async () => {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const user = await AsyncStorage.getItem('User');
      if (authToken) {
        dispatch(setAuthenticated(!isAuthenticated));
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
                  <FontAwesome
                    name="long-arrow-left"
                    size={iconSize}
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
                  <FontAwesome
                    name="long-arrow-left"
                    size={iconSize}
                    style={{ marginLeft: 10 }}
                    onPress={() => navigation.goBack()}
                  />
                ),
              })}
                  />


              <Stack.Screen name="Profile" component={Profile}
                  options={({ navigation }) => ({
                  headerShown: true,
                  headerTitle: null,
                  headerBackTitleVisible: false,
                  headerLeft: () => (
                    <FontAwesome
                      name="close"
                      size={iconSize}
                      style={{ marginLeft: 10 }}
                      onPress={() => navigation.goBack()}
                    />
                  ),
                })}
              />
              <Stack.Screen name="EditProfile" component={EditProfile}
                  options={({ navigation }) => ({
                  headerShown: true,
                  headerTitle: null,
                  headerBackTitleVisible: false,
                  headerLeft: () => (
                    <FontAwesome
                      name="close"
                      size={iconSize}
                      style={{ marginLeft: 10 }}
                      onPress={() => navigation.goBack()}
                    />
                  ),
                })}
              />

                <Stack.Screen name="JoinCommunity" component={JoinCommunity}
                  options={() => ({
                  headerShown: false,
                  headerTitle: null,
                  headerBackTitleVisible: false,
                  headerLeft: false
                  })}
                  />
                   <Stack.Screen name="Search" component={Search}
                    options={() => ({
                    headerShown: false,
                    headerTitle: null,
                    headerBackTitleVisible: false,
                    headerLeft: false
                    })}
                  />
            </>
          )}
        </Stack.Navigator>
          
      </NavigationContainer>
    
  );
}