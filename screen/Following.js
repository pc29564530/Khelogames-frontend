import React, { useEffect, useState } from 'react';
import {View, Text, Image, ScrollView, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { setUnFollowUser, getFollowingUser } from '../redux/actions/actions';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BASE_URL, AUTH_URL } from '../constants/ApiConstants';

function Following() {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const axiosInstance = useAxiosInterceptor();
    const [followingWithProfile, setFollowingWithProfile] = useState([]);
    const [displayText, setDisplayText] = useState('');
    const following = useSelector((state) => state.user.following)
    const fetchFollowing = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
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
                const followingProfile = item.map(async (item, index) => {
                    const profileResponse = await axiosInstance.get(`${AUTH_URL}/getProfile/${item}`);
                    if (!profileResponse.data.avatar_url || profileResponse.data.avatar_url === '') {
                        const usernameInitial = profileResponse.data.owner ? profileResponse.data.owner.charAt(0) : '';
                        setDisplayText(usernameInitial.toUpperCase());
                    } else {
                        setDisplayText(''); // Reset displayText if the avatar is present
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
    
    useFocusEffect(
        React.useCallback(() => {
            fetchFollowing();
        },[])
    );

    const handleProfile  = ({username}) => {
        navigation.navigate('Profile', {username: username})
    }

    return (
        <ScrollView style={tailwind`bg-white`}>
            <View style={tailwind`flex-1 bg-white pl-5`}>
                {following?.map((item, i) => (
                    <Pressable key={i} style={tailwind`bg-white flex-row items-center p-1 h-15`} onPress={() => handleProfile({username: item.profile?.owner})}>
                            {!item.profile && !item.profile?.avatar_url ?(
                                <View style={tailwind`w-12 h-12 rounded-12 bg-red-400 items-center justify-center`}>
                                    <Text style={tailwind`text-white text-6x3`}>
                                        {displayText}
                                    </Text>
                                </View>
                            ) : (
                                <Image style={tailwind`w-10 h-10 rounded-full bg-yellow-500`} source={{uri: item.profile.avatar_url}}  />
                            )}
                            <View  style={tailwind`text-white p-2 mb-1`}>
                                <Text style={tailwind`text-black font-bold text-xl `}>{item.profile?.full_name}</Text>
                                <Text style={tailwind`text-black`}>@{item.profile?.owner}</Text>
                            </View>
                    </Pressable>
                ))}
            </View>
        </ScrollView>
    );
}

export default Following;