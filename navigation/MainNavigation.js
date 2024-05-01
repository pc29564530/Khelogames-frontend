import React, {useEffect, useState} from 'react';
import {View,ActivityIndicator } from 'react-native';
import tailwind from 'twrnc';
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
import JoinCommunity from '../screen/JoinCommunity';
import CommunityList from '../screen/CommunityList';
import CommunityPage from '../screen/CommunityPage';
import CommunityType from '../screen/CommunityType';
import Shorts from '../screen/Shorts';
import Message from '../screen/Message';
import CommunityMessage from '../screen/CommunityMessage';
import MessagePage from '../screen/MessagePage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Club from '../screen/Club';
import CreateClub from '../screen/CreateClub';
import ClubPage from '../screen/ClubPage';
import Tournament from '../screen/Tournament';
import TournamentPage from '../screen/TournamentPage';
import CreateTournament from '../screen/CreateTournament';
import TournamentDescription from '../screen/TournamentDescription';
import AddPlayerToClub from '../components/AddPlayerToClub';
import PlayerProfile from '../screen/PlayerProfile';
import CricketMatchPage from '../screen/CricketMatchPage'

const Stack = createStackNavigator();

export default function MainNavigation() {
    const dispatch = useDispatch();
    const[loading, setLoading] = useState(true)
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    useEffect(() => {
        
        const checkAuthStatus = async () => {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const user = await AsyncStorage.getItem('User');
            if (authToken) {
                dispatch(setAuthenticated(true));
                dispatch(setUser(user))
            }
        };
    
        setLoading(false);
        checkAuthStatus();
        dispatch(checkExpireTime())
    }, []);

    if(loading) {
        <View style={tailwind`flex-1 justify-evenly items-center`}>
            <ActivityIndicator size="large" color="white"/>
        </View>
    }

    return(
        <NavigationContainer>
            <Stack.Navigator initialRouteName={isAuthenticated?'Home':'SignIn'} 
                screenOptions={{
                    presentation:'modal'
                }}
            >
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
                        <Stack.Screen name="JoinCommunity" component={JoinCommunity}
                            options={() => ({
                            headerShown: false,
                            headerTitle: null,
                            headerBackTitleVisible: false,
                            headerLeft: false
                            })}
                        />
                        <Stack.Screen name="CreateThread" component={CreateThread} />
                        <Stack.Screen name="Shorts" component={Shorts} />
                        <Stack.Screen name="CreateCommunity" component={CreateCommunity}/>
                        <Stack.Screen name="Profile" component={Profile}/>
                        <Stack.Screen name="EditProfile" component={EditProfile} />
                        <Stack.Screen name="ThreadComment" component={ThreadComment} />
                        <Stack.Screen name="CommunityPage" component={CommunityPage} />
                        <Stack.Screen name="CommunityList" component={CommunityList} />
                        <Stack.Screen name="CommunityType" component={CommunityType} />
                        <Stack.Screen name="Message" component={Message} />
                        <Stack.Screen name="MessagePage" component={MessagePage} />
                        <Stack.Screen name="Club" component={Club} />
                        <Stack.Screen name="CreateClub" component={CreateClub} />
                        <Stack.Screen name="ClubPage" component={ClubPage} />
                        <Stack.Screen name="Tournament" component={Tournament} />
                        <Stack.Screen name="TournamentPage" component={TournamentPage} />
                        <Stack.Screen name="CreateTournament" component={CreateTournament} />
                        <Stack.Screen name="TournamentDesciption" component={TournamentDescription} />
                        <Stack.Screen name="CommunityMessage" component={CommunityMessage} />
                        {/* <Stack.Screen name="MatchPage" component={FixturePage} /> */}
                        <Stack.Screen name="AddPlayerToClub" component={AddPlayerToClub} />
                        <Stack.Screen name="PlayerProfile" component={PlayerProfile} />
                        <Stack.Screen name="CricketMatchPage" component={CricketMatchPage} />
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