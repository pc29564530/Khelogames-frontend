import React, {useEffect} from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigation from './DrawerNavigation';
import { useDispatch, useSelector } from 'react-redux';
import SignIn from '../screen/SignIn';
import SignUp from '../screen/SignUp';
import User from '../screen/User';
import {checkExpireTime,setAuthenticated, setUser} from '../redux/actions/actions';
import CreateThread from '../screen/CreateThread';
import CreateCommunity from '../screen/CreateCommunity';
import Profile from '../screen/Profile';
import EditProfile from '../screen/EditProfile';
import ThreadComment from '../screen/ThreadComment';

const Stack = createStackNavigator();

export default function MainNavigation() {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
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
    console.log("Step2")
    return(
        <NavigationContainer>
            <Stack.Navigator >
                {isAuthenticated?(
                    <>
                    <Stack.Screen name="DrawerNavigation" component={DrawerNavigation} 
                    options={() => ({
                        headerShown: false,
                        headerTitle: null,
                        headerBackTitleVisible: false,
                        headerLeft: false
                        })}
                    />
                    <Stack.Screen name="CreateThread" component={CreateThread}/>
                    <Stack.Screen name="CreateCommunity" component={CreateCommunity}/>
                    <Stack.Screen name="Profile" component={Profile}/>
                    <Stack.Screen name="EditProfile" component={EditProfile} />
                    <Stack.Screen name="ThreadComment" component={ThreadComment} />
                    </>
                ):(
                    <>
                        <Stack.Screen name="SignUp" component={SignUp}
                            options={() => ({
                            headerShown: false,
                            headerTitle: null,
                            headerBackTitleVisible: false,
                            headerLeft: false
                            })}
                        />
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
                )
                }
            </Stack.Navigator>
        </NavigationContainer>
    );
}