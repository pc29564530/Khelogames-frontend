import React, { useEffect, useState } from 'react';
import {View, Text, Image, ScrollView, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import tailwind from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { setUnFollowUser, getFollowerUser } from '../redux/actions/actions';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL, AUTH_URL } from '../constants/ApiConstants';
import EmptyState from '../components/molecules/EmptyState';
import { getEmptyStateVariant } from '../components/molecules/EmptyState/emptyStateVariants';

function Follower() {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [followerWithProfile, setFollowerWithProfile] = useState([]);
    const [displayText, setDisplayText] = useState('');
    const follower = useSelector((state) => state.user.follower)
    const fetchFollower = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getFollower`, {
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
                dispatch(getFollowerUser(item));
            }
        } catch (e) {
            console.error(e);
        }
    }

    //add the status of button in the follower
    useEffect(() => {
        fetchFollower();
    },[])

    const handleProfile = (profilePublicID) => {
        navigation.navigate('Profile', {profilePublicID})
    }

    return (
        <ScrollView style={tailwind`bg-white`}>
            <View style={tailwind`flex-1 bg-white pl-5`}>
                {follower && follower.length > 0 ? (
                    follower.map((item, i) => (
                        <Pressable key={i} style={tailwind`bg-white flex-row items-center p-1 h-15`} onPress={() => handleProfile(item.profile?.public_id)}>
                            {!item.profile && !item.profile.avatar_url ?(
                                <View style={tailwind`w-12 h-12 rounded-12 bg-white items-center justify-center`}>
                                    <Text style={tailwind`text-black text-6x3`}>
                                        {displayText}
                                    </Text>
                                </View>
                            ) : (
                                <Image style={tailwind`w-10 h-10 rounded-full bg-yellow-500`} source={{uri: item.profile.avatar_url}}  />
                            )}
                            <View  style={tailwind`text-white p-2 mb-1`}>
                                <Text style={tailwind`text-black font-bold text-xl `}>{item.profile.full_name}</Text>
                                <Text style={tailwind`text-black`}>@{item.profile.username}</Text>
                            </View>
                        </Pressable>
                    ))
                ) : (
                    <EmptyState
                        {...getEmptyStateVariant('followers')}
                        testID="followers-empty-state"
                    />
                )}
            </View>
        </ScrollView>
    );
}

export default Follower;