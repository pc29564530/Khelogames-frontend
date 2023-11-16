import React, { useEffect, useState } from 'react';
import {View, Text, Image, StyleSheet,ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { getFollowerUser } from '../redux/actions/actions';

const  logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');

function Follower() {
    const dispatch = useDispatch()
    const axiosInstance = useAxiosInterceptor();
    const [followerWithProfile, setFollowerWithProfile] = useState([]);
    const [displayText, setDisplayText] = useState('');
    const follower = useSelector((state) => state.user.follower)
    const fetchFollower = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const user = await AsyncStorage.getItem('User');
            const response = await axiosInstance.get(`http://192.168.0.103:8080/getFollower`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            });

            const item = response.data;
            if(item === null || !item) {
                setFollowerWithProfile([]);
                dispatch(getFollowerUser([]));
            } else {
                const followerProfile = item.map(async (item, index) => {
                    const profileResponse = await axiosInstance.get(`http://192.168.0.103:8080/getProfile/${item}`);
                    if (!profileResponse.data.avatar_url || profileResponse.data.avatar_url === '') {
                        const usernameInitial = profileResponse.data.owner ? profileResponse.data.owner.charAt(0) : '';
                        setDisplayText(usernameInitial.toUpperCase());
                    } else {
                        setDisplayText(''); // Reset displayText if the avatar is present
                    }
                    return {...item, profile: profileResponse.data}
                })
                const followerData = await Promise.all(followerProfile);
                setFollowerWithProfile(followerData);
                dispatch(getFollowerUser(response.data));
            }

        } catch (e) {
            console.error(e);
        }
    }

    //add the status of button in the follower

    //add the profile avatar image
    //add the Fullname and username


    useEffect(() => {
        fetchFollower();
    },[])

    return (
        <ScrollView style={tailwind`bg-black`}>
            <View style={tailwind`flex-1 bg-black pl-5`}>
                {followerWithProfile.map((item, i) => (
                    <View key={i} style={tailwind`bg-black flex-row items-center p-1 h-15`}>
                        {!item.profile.avatar_url ?(
                            <View style={tailwind`w-12 h-12 rounded-12 bg-white items-center justify-center`}>
                                <Text style={tailwind`text-red-500 text-6x3`}>
                                    {displayText}
                                </Text>
                            </View>
                        ) : (
                            <Image style={tailwind`w-10 h-10 rounded-full`} source={item.profile.avatar_url}  />
                        )}
                        <View  style={tailwind`text-white p-2 mb-1`}>
                            <Text style={tailwind`text-white font-bold text-xl `}>{item.profile.full_name}</Text>
                            <Text style={tailwind`text-white`}>@{item.profile.owner}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

export default Follower;