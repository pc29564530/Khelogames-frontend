import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Image, ScrollView} from 'react-native';
import AsyncStorage  from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {useSelector,useDispatch} from 'react-redux';
import {logout,setAuthenticated, setFollowUser, setUnFollowUser, getFollowingUser} from '../redux/actions/actions';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';

const  logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');

function Following() {

    const [followingWithProfile, setFollowingWithProfile] = useState([]);
    const [displayText, setDisplayText] = useState('');
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch()
    const following = useSelector(state => state.user.following)

    const fetchFollowing = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const user = await AsyncStorage.getItem('User');
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
                console.log("FollowingUser: ", followingProfile)
                console.log("Herllo Ind")
                const followingData = await Promise.all(followingProfile);
                console.log("Hello Bharat")
                setFollowingWithProfile(followingData);
                dispatch(getFollowingUser(followingData));
            }
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        fetchFollowing();
    }, []);
    return (
        <ScrollView style={tailwind`bg-black`}>
             <View style={tailwind`flex-1 pl-5`}>
                {following.map((item, i) => (
                        <View key={i} style={tailwind`bg-black flex-row items-center p-1 h-15`}>
                            {!item.profile && item.profile.avatar_url ?(
                                <View style={tailwind`w-12 h-12 rounded-12 bg-white items-center justify-center`}>
                                    <Text style={tailwind`text-red-500 text-6x3`}>
                                        {displayText}
                                    </Text>
                                </View>
                            ) : (
                                <Image style={tailwind`w-10 h-10 rounded-full`} source={{uri: item.profile.avatar_url}}  />
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

export default Following;