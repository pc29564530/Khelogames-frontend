import React, { useEffect, useState, useLayoutEffect } from 'react';
import {View, Text, Image, ScrollView, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { setUnFollowUser, getFollowingUser } from '../redux/actions/actions';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../constants/ApiConstants';
import AntDesign from 'react-native-vector-icons/AntDesign';

function MessagePage() {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const axiosInstance = useAxiosInterceptor();
    const [followingWithProfile, setFollowingWithProfile] = useState([]);
    const [displayText, setDisplayText] = useState('');
    const following = useSelector((state) => state.user.following)
    const fetchFollowing = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const currentUser = await AsyncStorage.getItem('User');
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
                    const profileResponse = await axiosInstance.get(`${BASE_URL}/getProfile/${item}`);
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

    const handleMessage = ({item}) => {
        navigation.navigate("Message", {profileData: item})
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "",
            headerStyle: tailwind`bg-black`,
            headerLeft: ()=> (
                <View style={tailwind`flex-row items-center gap-35 p-2`}>
                    <AntDesign name="arrowleft" onPress={()=>navigation.goBack()} size={24} color="white" />
                    <Text style={tailwind`text-white`}>Message</Text>
                </View>
            )
        })
      },[navigation])

    return (
        <ScrollView style={tailwind`bg-black`}>
            <View style={tailwind`flex-1 bg-black pl-5 p-5`}>
                {following?.map((item, i) => (
                    <Pressable key={i} style={tailwind`bg-black flex-row items-center p-1 h-15`} onPress={() => handleMessage({ item: item.profile })}>
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
                    </Pressable>
                ))}
            </View>
        </ScrollView>
    );
}

export default MessagePage;