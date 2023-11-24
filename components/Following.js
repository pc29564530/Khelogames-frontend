import React, { useEffect, useState } from 'react';
import {View, Text, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { setUnFollowUser, getFollowingUser } from '../redux/actions/actions';

function Following() {
    const dispatch = useDispatch()
    const axiosInstance = useAxiosInterceptor();
    const [followingWithProfile, setFollowingWithProfile] = useState([]);
    const [displayText, setDisplayText] = useState('');
    const following = useSelector((state) => state.user.following)
    const fetchFollowing = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`http://192.168.0.103:8080/getFollowing`, {
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
                    const profileResponse = await axiosInstance.get(`http://192.168.0.103:8080/getProfile/${item}`);
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

    //add the status of button in the follower


    useEffect(() => {
        fetchFollowing();
    },[])

    return (
        <ScrollView style={tailwind`bg-black`}>
            <View style={tailwind`flex-1 bg-black pl-5`}>
                {following?.map((item, i) => (
                    <View key={i} style={tailwind`bg-black flex-row items-center p-1 h-15`}>
                        {!item.profile && !item.profile?.avatar_url ?(
                            <View style={tailwind`w-12 h-12 rounded-12 bg-white items-center justify-center`}>
                                <Text style={tailwind`text-red-500 text-6x3`}>
                                    {displayText}
                                </Text>
                            </View>
                        ) : (
                            <Image style={tailwind`w-10 h-10 rounded-full bg-yellow-500`} source={{uri: item.profile.avatar_url}}  />
                        )}
                        <View  style={tailwind`text-white p-2 mb-1`}>
                            <Text style={tailwind`text-white font-bold text-xl `}>{item.profile?.full_name}</Text>
                            <Text style={tailwind`text-white`}>@{item.profile?.owner}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

export default Following;