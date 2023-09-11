import React, {useState, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Main from './components/Main';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import User from './components/User';
import ThreadComment from './components/ThreadComment';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigationRef = useRef();

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
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator 
         initialRouteName={isAuthenticated? 'Main' : 'SignIn'}
         screenOptions={{
           headerTitle: null,
           headerTransparent: false,
           headerShown: false,
           headerLeft: null,
           headerBackTitleVisible: true,
         }}  
      >
        {!isAuthenticated ? (
            <>
              <Stack.Screen name="SignUp" component={() => <SignUp />} />
              <Stack.Screen name="User" component={() => <User setIsAuthenticated={setIsAuthenticated}/>}
                options={{
                  headerTitle: null,
                  headerTransparent: false,
                  headerShown: false,
                  headerLeft: null,
                  headerBackTitleVisible: false,
                }}
              />
              <Stack.Screen name="SignIn" component={() => <SignIn setIsAuthenticated={setIsAuthenticated}/>} 
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
             <Stack.Screen name="Main" component={() => <Main logout={logout}/>}  
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
          </>
        )}
      </Stack.Navigator>
        
   </NavigationContainer>
    
  );
}

