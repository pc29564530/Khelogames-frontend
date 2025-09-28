import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Text, View, Pressable, Image} from 'react-native'
import axiosInstance from './axios_config';
import tailwind from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {setThreads, setLikes} from '../redux/actions/actions';
import Video from 'react-native-video';
import { BASE_URL, AUTH_URL } from '../constants/ApiConstants';
import Animated, { useAnimatedScrollHandler } from 'react-native-reanimated';

const PostByCommunity = ({item, parentScrollY, headerHeight, collapsedHeader}) => {
    const community = item;
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const threads = useSelector((state) => state.threads.threads);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            parentScrollY.value = event.contentOffset.y;
        },
    });
    
    const handleThreadComment = (item, threadPublicID) => {
        navigation.navigate('ThreadComment', {item: item, threadPublicID: threadPublicID});
    };

    const handleLikes = async (threadPublicID) => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const headers = {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            };

            const userCount = await axiosInstance.get(`${BASE_URL}/checkLikeByUser/${threadPublicID}`, {headers});
            if(userCount.data == 0) {
                const response = await axiosInstance.post(`${BASE_URL}/createLikeThread/${threadPublicID}`, null, {headers});
                if(response.status === 200) {
                    try {
                        const updatedLikeCount = await axiosInstance.get(`${BASE_URL}/countLike/${threadPublicID}`, {headers});
                        const newLikeCount = await axiosInstance.put(`${BASE_URL}/update_like/${threadPublicID}`, {}, {headers});
                        dispatch(setLikes(threadPublicID, newLikeCount.data.like_count));
                    } catch (err) {
                        console.error(err);
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
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
            if(responseData === null){
                dispatch(setThreads([]));
            } else {
                dispatch(setThreads(responseData));
            }
        } catch(e) {
            console.error("unable to get the thread by community: ", e);
        }
    };

    useEffect(() => {
        fetchThreadByCommunity();
    }, []);

    const renderThreadItem = ({item}) => (
        <View style={tailwind`bg-white mb-3 mx-2 rounded-xl shadow-sm overflow-hidden`}>
            {/* User Profile Section */}
            <Pressable 
                style={tailwind`flex-row items-center p-4 border-b border-gray-100`} 
                onPress={() => handleProfile(item)}
            >
                {item.profile && item.profile.avatar_url ? (
                    <Image 
                        source={{uri: item.profile.avatar_url}} 
                        style={tailwind`w-12 h-12 rounded-full`} 
                    />
                ) : (
                    <View style={tailwind`w-12 h-12 rounded-full bg-gray-300 items-center justify-center`}>
                        <Text style={tailwind`text-gray-600 font-semibold`}>
                            {item.profile?.full_name?.charAt(0) || 'U'}
                        </Text>
                    </View>
                )}
                
                <View style={tailwind`ml-3 flex-1`}>
                    <Text style={tailwind`font-bold text-black text-base`}>
                        {item.profile?.full_name || 'Anonymous'}
                    </Text>
                    <Text style={tailwind`text-gray-500 text-sm`}>
                        @{item.profile?.username || 'unknown'}
                    </Text>
                </View>
            </Pressable>

            {/* Post Content */}
            <View style={tailwind`p-4`}>
                {item.content && (
                    <Text style={tailwind`text-black text-base mb-3 leading-5`}>
                        {item.content}
                    </Text>
                )}

                {/* Media Content */}
                {item.media_type === 'image/jpg' && item.media_url && (
                    <Image
                        style={tailwind`w-full h-64 rounded-lg mb-3`}
                        source={{uri: item.media_url}}
                        resizeMode="cover"
                    />
                )}
                
                {item.media_type === 'video/mp4' && item.media_url && (
                    <Video 
                        style={tailwind`w-full h-64 rounded-lg mb-3`}
                        source={{uri: item.media_url}} 
                        controls={true}
                        resizeMode="cover"
                        paused={true}
                    />
                )}

                {/* Like Count */}
                <Text style={tailwind`text-gray-600 text-sm mb-3`}>
                    {item.like_count || 0} {(item.like_count || 0) === 1 ? 'Like' : 'Likes'}
                </Text>

                {/* Action Buttons */}
                <View style={tailwind`border-t border-gray-100 pt-3 flex-row justify-around`}>
                    <Pressable  
                        style={tailwind`flex-row items-center py-2 px-4 rounded-lg active:bg-gray-100`} 
                        onPress={() => handleLikes(item.public_id)}
                    >
                        <FontAwesome 
                            name="thumbs-o-up"
                            color="#6B7280"
                            size={18}
                        />
                        <Text style={tailwind`text-gray-600 ml-2 font-medium`}>Like</Text> 
                    </Pressable>
                    
                    <Pressable 
                        style={tailwind`flex-row items-center py-2 px-4 rounded-lg active:bg-gray-100`} 
                        onPress={() => handleThreadComment(item, item.public_id)}
                    >
                        <FontAwesome 
                            name="comment-o"
                            color="#6B7280"
                            size={18}
                        />
                        <Text style={tailwind`text-gray-600 ml-2 font-medium`}>Comment</Text> 
                    </Pressable>
                </View>
            </View>
        </View>
    );

    return (
        <Animated.FlatList 
            data={threads || []}
            keyExtractor={(item, index) => item.public_id ? item.public_id.toString() : index.toString()}
            renderItem={renderThreadItem}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingTop: 10, // push down so content starts below header
              paddingBottom: 50,
            }}
            showsVerticalScrollIndicator={false}

        />
    );
};

export default PostByCommunity;