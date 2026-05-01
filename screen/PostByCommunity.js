import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Text, View, Pressable, Image, ScrollView} from 'react-native'
import axiosInstance from './axios_config';
import tailwind from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {setThreads} from '../redux/actions/actions';
import Video from 'react-native-video';
import { BASE_URL, AUTH_URL } from '../constants/ApiConstants';
import Animated, { useAnimatedScrollHandler } from 'react-native-reanimated';
import { handleLikes, handleThreadComment, handleUser } from '../utils/ThreadUtils';
import ThreadItem from '../components/ThreadItems';

const PostByCommunity = ({item, parentScrollY, headerHeight, collapsedHeader}) => {
    const community = item;
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const threads = useSelector((state) => state.threads.threads);
    const [error, setError] = useState({ global: null, fields: {} });

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            parentScrollY.value = event.contentOffset.y;
        },
    });

    const handleThreadComment = (item, threadPublicID) => {
        navigation.navigate('ThreadComment', {item: item, threadPublicID: threadPublicID});
    };

    const handleProfile = async (item) => {
        navigation.navigate('Profile', { profilePublicID: item.profile.public_id });
    };

    const fetchThreadByCommunity = async () => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            const response = await axiosInstance.get(`${BASE_URL}/GetAllThreadsByCommunityDetailsFunc/${community.name}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            });
            
            const responseData = response.data;
            dispatch(setThreads(responseData.data));
        } catch(e) {
            console.error("unable to get the thread by community: ", e);
        }
    };

    useEffect(() => {
        fetchThreadByCommunity();
    }, []);

    return (
        <ScrollView
            style={tailwind`flex-1 bg-white`}
            showsVerticalScrollIndicator={false}
        >
            <View style={tailwind`pb-4`}>
            {threads.map((item, i) => (
                <ThreadItem
                key={item.public_id || i}
                item={item}
                handleLikes={handleLikes}
                handleThreadComment={handleThreadComment}
                handleUser={handleUser}
                />
            ))}
            </View>
        </ScrollView>
    )
};

export default PostByCommunity;