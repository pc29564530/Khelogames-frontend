import React, { useEffect, useState, useLayoutEffect } from 'react';
import {View, Text, Image, ScrollView, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import tailwind from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { setUnFollowUser, getFollowingUser } from '../redux/actions/actions';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BASE_URL, AUTH_URL } from '../constants/ApiConstants';
import AntDesign from 'react-native-vector-icons/AntDesign';

function MessagePage() {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [followingWithProfile, setFollowingWithProfile] = useState([]);
    const [displayText, setDisplayText] = useState('');
    const [communities, setCommunities] = useState([]);
    const following = useSelector((state) => state.user.following)
    //change this method to all profile
    const fetchFollowing = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const currentUser = await AsyncStorage.getItem('UserPublicID');
            const response = await axiosInstance.get(`${BASE_URL}/getFollowing`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            });

            const item = response.data;
            if(item === null || !item) {
                setFollowingWithProfile([]);
                dispatch(getFollowingUser([]));
            } else {
                const followingProfile = item.map(async (itm, index) => {                  
                    const profileResponse = await axiosInstance.get(`${AUTH_URL}/getProfile/${itm.user_public_id}`);
                    if (!profileResponse.data.avatar_url || profileResponse.data.avatar_url === '') {
                        const usernameInitial = profileResponse.data.username ? profileResponse.data.username.charAt(0) : '';
                        setDisplayText(usernameInitial.toUpperCase());
                    } else {
                        setDisplayText('');
                    }
                    return {...item, profile: profileResponse.data}
                })
                const followingData = await Promise.all(followingProfile);
                setFollowingWithProfile(followingData);
                dispatch(getFollowingUser(followingData));
            }

        } catch (e) {
            console.error(e);
        }
    }

    const fetchCommunity = async () => {
        try {
            const currentUser = await AsyncStorage.getItem('UserPublicID');
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getCommunityByMessage`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if(!response.data || response.data === null) {
                setCommunities([]);
            } else {
                setCommunities(response.data)
            }

        } catch(err) {
            console.error('error not able fetch all community: ', err);
        }
    }

    const fetchMessageReceiver = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getMessagedUser`, null, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const item = response.data;
            if(item === null || !item) {
                setFollowingWithProfile([]);
                // dispatch(getFollowingUser([]));
            } else {
                const followingProfile = item.map(async (item, index) => {                  
                    const profileResponse = await axiosInstance.get(`${AUTH_URL}/getProfile/${item}`);
                    if (!profileResponse.data.avatar_url || profileResponse.data.avatar_url === '') {
                        const usernameInitial = profileResponse.data.owner ? profileResponse.data.owner.charAt(0) : '';
                        setDisplayText(usernameInitial.toUpperCase());
                    } else {
                        setDisplayText('');
                    }
                    return {...item, profile: profileResponse.data}
                })
                const followingData = await Promise.all(followingProfile);
                setFollowingWithProfile(followingData);
                // dispatch(getFollowingUser(followingData));
            }

        } catch(err) {
            console.error('unable to get user: ', err);
        }
    }
    
    useFocusEffect(
        React.useCallback(() => {
            // fetchFollowing();
   
        fetchCommunity();
        fetchMessageReceiver();
        },[])
    );

    const handleMessage = ({item}) => {
        navigation.navigate("Message", {profileData: item})
    }

    const handleMessageCommunity = ({item}) => {
        navigation.navigate("CommunityMessage", {communityPageData: item})
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "",
            headerStyle: tailwind`bg-red-400`,
            headerLeft: ()=> (
                <View style={tailwind`flex-row items-center gap-35 p-2`}>
                    <AntDesign name="arrowleft" onPress={()=>navigation.goBack()} size={24} color="white" />
                    <Text style={tailwind`text-white text-xl`}>Message</Text>
                </View>
            )
        })
      },[navigation]);
    return (
        <ScrollView style={tailwind`bg-white`}>
            <View style={tailwind`flex-1 bg-white pl-5 p-5`}>
            <>
                {communities.map((item,index)=>(
                    <Pressable key={index} style={tailwind`bg-white flex-row items-center p-1 h-15`} onPress={() => handleMessageCommunity({ item: item })}>
                        <View style={tailwind`w-12 h-12 rounded-12 bg-red-400 items-center justify-center`}>
                            <Text style={tailwind`text-white text-6x3`}>
                                {item.dispayText}
                            </Text>
                        </View>
                        <View  style={tailwind`text-black p-2 mb-1`}>
                            <Text style={tailwind`text-black font-bold text-xl `}>{item.name}</Text>
                            <Text style={tailwind`text-black`}>{item.discription}</Text>
                        </View>
                    </Pressable>
                ))

                }
            </>
            <>
                {followingWithProfile?.map((item, i) => (
                    <Pressable key={i} style={tailwind`bg-white flex-row items-center p-1 h-15`} onPress={() => handleMessage({ item: item.profile })}>
                            {!item.profile && !item.profile?.avatar_url ?(
                                <View style={tailwind`w-12 h-12 rounded-12 bg-white items-center justify-center`}>
                                    <Text style={tailwind`text-red-500 text-6x3`}>
                                        {displayText}
                                    </Text>
                                </View>
                            ) : (
                                <Image style={tailwind`w-10 h-10 rounded-full bg-yellow-500`} source={{uri: item.profile.avatar_url}}  />
                            )}
                            <View  style={tailwind`text-black p-2 mb-1`}>
                                <Text style={tailwind`text-black font-bold text-xl `}>{item.profile?.full_name}</Text>
                                <Text style={tailwind`text-black`}>@{item.profile?.owner}</Text>
                            </View>
                    </Pressable>
                ))}
            </>
            </View>
        </ScrollView>
    );
}

export default MessagePage;