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
// import { applyMiddleware, useSelector } from 'react-redux';
import {checkExpireTime,setAuthenticated, setUser} from './redux/actions/actions';


const Stack = createStackNavigator();

export default function Root() {
  const dispatch = useDispatch();
  console.log('startyging')
  
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  console.log("what are you doing ")
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  console.log("line no 27")
  console.log(isAuthenticated)
  console.log("line no 28")

  // const navigationRef = useRef();

  // const logout = async () => {
  //   console.log("Before logout:", await AsyncStorage.getItem('AccessToken'));
  //   await AsyncStorage.removeItem('AccessToken');
  //   await AsyncStorage.removeItem('RefreshToken');
  //   console.log("After logout:", await AsyncStorage.getItem('AccessToken')); 
  // };

  useEffect(() => {
    
    const checkAuthStatus = async () => {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const user = await AsyncStorage.getItem('User');
      if (authToken) {
        console.log("authToken")
        dispatch(setAuthenticated(true));
        dispatch(setUser(user))
      }
    };  
    console.log("line no 49")
  
    checkAuthStatus();
    dispatch(checkExpireTime())
    console.log("line no 50")
  }, []);

  return (  
      <NavigationContainer>
        <Stack.Navigator 
            initialRouteName={'SignIn'}
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
                  {/* {(props) => <User {...props} setIsAuthenticated={setIsAuthenticated} />}
                </Stack.Screen> */}
                <Stack.Screen name="SignIn" component={SignIn}
                    options={{
                    headerTitle: null,
                    headerTransparent: false,
                    headerShown: false,
                    headerLeft: null,
                    headerBackTitleVisible: false,
                  }}
                />
                    {/* {(props) => <SignIn {...props} setIsAuthenticated={setIsAuthenticated} />}
                </Stack.Screen> */}
              </>
            ):(
            <>
                <Stack.Screen name="Main" 
                  // initialParams={{logout: logout}} 
                  component={Main}
                  options={{
                    headerTitle: null,
                    headerTransparent: false,
                    headerShown: false,
                    headerLeft: null,
                    headerBackTitleVisible: false,
                  }}
               />
                  {/* {(props) => <Main {...props} logout={logout} />} 
                </Stack.Screen> */}
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