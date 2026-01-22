import React, { useEffect, useState } from 'react';
import {View, Text, Image, ScrollView, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import tailwind from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { setUnFollowUser, getFollowingUser } from '../redux/actions/actions';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BASE_URL, AUTH_URL } from '../constants/ApiConstants';

function Following() {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [followingWithProfile, setFollowingWithProfile] = useState([]);
    const [displayText, setDisplayText] = useState('');
    const [error, setError] = useState({
        global: null,
        fields: {},
    })
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
            if(item.data === null || !item) {
                dispatch(getFollowingUser([]));
            } else {
                dispatch(getFollowingUser(item.data));
            }

        } catch (err) {
            setError({
                global: "Unable to get following user",
                fields: {},
            })
            console.error("Unable to get following user: ", err);
        }
    }
    
    useFocusEffect(
        React.useCallback(() => {
            fetchFollowing();
        },[])
    );

    const handleProfile  = (profilePublicID) => {
        navigation.navigate('Profile', {profilePublicID})
    }

    return (
        <ScrollView style={tailwind`bg-white`}>
            <View style={tailwind`flex-1 bg-white pl-5`}>
                {error.global && following.length === 0 && (
                    <View style={tailwind`mx-3 mb-3 p-3 bg-red-50 border border-red-300 rounded-lg`}>
                        <Text style={tailwind`text-red-700 text-sm`}>
                            {error.global}
                        </Text>
                    </View>
                )}
                {following?.map((item, i) => (
                    <Pressable key={i} style={tailwind`bg-white flex-row items-center p-1 h-15`} onPress={() => handleProfile(item.profile?.public_id)}>
                        {!item.profile && !item.profile?.avatar_url ?(
                            <View style={tailwind`w-12 h-12 rounded-12 bg-white items-center justify-center`}>
                                <Text style={tailwind`text-black text-6x3`}>
                                    {displayText}
                                </Text>
                            </View>
                        ) : (
                            <Image style={tailwind`w-10 h-10 rounded-full bg-yellow-500`} source={{uri: item.profile?.avatar_url}}  />
                        )}
                        <View  style={tailwind`text-white p-2 mb-1`}>
                            <Text style={tailwind`text-black font-bold text-xl `}>{item.profile?.full_name}</Text>
                            <Text style={tailwind`text-black`}>@{item.profile?.username}</Text>
                        </View>
                    </Pressable>
                ))}
            </View>
        </ScrollView>
    );
}

export default Following;