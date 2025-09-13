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
import CreatePlayerProfile from '../screen/CreatePlayerProfile';
import PlayerProfile from '../screen/PlayerProfile';
import CricketMatchPage from '../screen/CricketMatchPage';
// import AddCricketMatchPlayer from '../screen/AddCricketMatchPlayer';
import EditMatchScore from '../screen/EditMatchScore';
import FootballMatchPage from '../screen/FootballMatchPage';
import AddFootballPlayerScore from '../screen/AddFootballPlayerScore';
import Follow from '../screen/Follow';
import CreateMatch from '../screen/CreateMatch';
import CricketLiveScore from  '../screen/CricketLiveScore';
import EditPlayerProfile from '../screen/EditPlayerProfile';

const Stack = createStackNavigator();

export default function MainNavigation() {
    const dispatch = useDispatch();
    const[loading, setLoading] = useState(true)
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    useEffect(() => {
        
        const checkAuthStatus = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const refreshToken = await AsyncStorage.getItem('RefreshToken');
                const user = await AsyncStorage.getItem("User");
                
                if (authToken && refreshToken && user) {
                    dispatch(setAuthenticated(true));
                    dispatch(setUser(user));
                } else {
                    console.log('❌ No valid tokens found - setting authenticated to false');
                    dispatch(setAuthenticated(false));
                    
                    // Clear any partial auth data
                    await AsyncStorage.multiRemove([
                        'AccessToken', 
                        'RefreshToken', 
                        'AccessTokenExpiresAt',
                        'User'
                    ]);
                }
            } catch (error) {
                console.error('💥 Error checking auth status:', error);
                dispatch(setAuthenticated(false));
                dispatch(setUser(user))
            } finally {
                // Small delay to prevent flash
                setTimeout(() => {
                    setLoading(false);
                    console.log('✅ Auth check completed, app loading finished');
                }, 200);
            }
        };

        checkAuthStatus();
        dispatch(checkExpireTime());
    }, [dispatch]);

    // Show loading while determining auth status
    if (loading || isAuthenticated === null) {
        console.log('⏳ Showing loading screen...');
        return (
            <View style={tailwind`flex-1 justify-center items-center bg-black`}>
                <ActivityIndicator size="large" color="white"/>
            </View>
        );
    }

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
                        <Stack.Screen name="CreateThread" component={CreateThread} />
                        <Stack.Screen name="Shorts" component={Shorts} />
                        <Stack.Screen name="CreateCommunity" component={CreateCommunity}/>
                        <Stack.Screen name="Profile" component={Profile}
                            options={() => ({
                                headerShown: false,
                                headerTitle: null,
                                headerBackTitleVisible: false,
                                headerLeft: false
                            })}
                        />
                        <Stack.Screen name="EditProfile" component={EditProfile} />
                        <Stack.Screen name="ThreadComment" component={ThreadComment} />
                        <Stack.Screen name="CommunityPage" component={CommunityPage} 
                            options={() => ({
                                headerShown: false,
                                headerTitle: null,
                                headerBackTitleVisible: false,
                                headerLeft: false
                            })}
                        />
                        <Stack.Screen name="CommunityList" component={CommunityList} />
                        <Stack.Screen name="CommunityType" component={CommunityType} />
                        <Stack.Screen name="Message" component={Message} />
                        <Stack.Screen name="MessagePage" component={MessagePage} />
                        <Stack.Screen name="Club" component={Club} />
                        <Stack.Screen name="CreateClub" component={CreateClub} />
                        <Stack.Screen name="ClubPage" component={ClubPage} 
                            options={() => ({
                                headerShown: false,
                                headerTitle: null,
                                headerBackTitleVisible: false,
                                headerLeft: false
                            })}
                        />
                        <Stack.Screen name="Tournament" component={Tournament} />
                        <Stack.Screen name="TournamentPage" component={TournamentPage} 
                            options={() => ({
                                headerShown: false,
                                headerTitle: null,
                                headerBackTitleVisible: false,
                                headerLeft: false
                            })}
                        />
                        <Stack.Screen name="CreateMatch" component={CreateMatch} />
                        <Stack.Screen name="CreateTournament" component={CreateTournament} />
                        <Stack.Screen name="TournamentDesciption" component={TournamentDescription} />
                        <Stack.Screen name="CommunityMessage" component={CommunityMessage} />
                        <Stack.Screen name="CreatePlayerProfile" component={CreatePlayerProfile} 
                            options={{
                                headerShown: true,
                                headerTitle: '',
                                headerBackTitleVisible: false,
                                headerStyle: { backgroundColor: tailwind.color('bg-red-400') },
                                headerTintColor: tailwind.color('bg-black'),
                            }}
                        />
                        <Stack.Screen name="PlayerProfile" component={PlayerProfile} 
                            options={{
                                headerShown: true,
                                headerTitle: '',
                                headerBackTitleVisible: false,
                                headerStyle: { backgroundColor: tailwind.color('bg-red-400') },
                                headerTintColor: tailwind.color('bg-black'),
                            }}
                        />
                        <Stack.Screen name="CricketMatchPage" component={CricketMatchPage} 
                            options={{
                                headerShown: false,
                                headerTitle: '',
                                headerBackTitleVisible: false,
                                headerStyle: { backgroundColor: tailwind.color('bg-red-400') },
                                headerTintColor: tailwind.color('bg-black'),
                            }}
                        />
                        {/* <Stack.Screen name="AddCricketMatchPlayer" component={AddCricketMatchPlayer} /> */}
                        <Stack.Screen name="EditMatchScore" component={EditMatchScore} />
                        <Stack.Screen name="FootballMatchPage" component={FootballMatchPage} 
                            options={{
                                headerShown: false,
                                headerTitle: '',
                                headerBackTitleVisible: false,
                                headerStyle: { backgroundColor: tailwind.color('bg-red-400') },
                                headerTintColor: tailwind.color('bg-black'),
                            }}
                        />
                        {/* <Stack.Screen name="AddFootballPlayerScore" component={AddFootballPlayerScore} /> */}
                        <Stack.Screen name="Follow" component={Follow} 
                            options={{
                                headerShown: true,
                                headerTitle: '',
                                headerBackTitleVisible: false,
                                headerStyle: { backgroundColor: tailwind.color('bg-red-400') },
                                headerTintColor: tailwind.color('bg-black'),
                            }}
                        />
                        <Stack.Screen name="Live Match" component={CricketLiveScore} />
                    </>
                ):(
                    <>
                        <Stack.Screen name="SignUp" component={SignUp}
                            options={() => ({
                            headerShown: true,
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