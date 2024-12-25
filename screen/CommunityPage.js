import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, ScrollView, Dimensions} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import tailwind from 'twrnc';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from './axios_config';
import { TopTabCommunityPage } from '../navigation/TopTabCommunityPage';
import { BASE_URL } from '../constants/ApiConstants';
import {useSelector, useDispatch} from 'react-redux';
import { getJoinedCommunity, addJoinedCommunity } from '../redux/actions/actions';
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

function CommunityPage({route}) {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const joinedCommunity = useSelector((state) => state.joinedCommunity.joinedCommunity);
    const [memberCount, setMemeberCount] = useState(1);
    const axiosInstance = useAxiosInterceptor();
    const communityPageData = route.params?.item;

    useEffect(() => {
        fetchCommunityJoinedByUser();
    },[]);

    useEffect(() => {
        fetchCommunityLength();
    }, []);
    
    const fetchCommunityJoinedByUser = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getCommunityByUser`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            dispatch(getJoinedCommunity(response.data))

        } catch (e) {
            console.error('unable to get the joined communities', e);
        }
    };
    
    const handleAnnouncement = (communityPageData) => {
        navigation.navigate('CommunityMessage', {communityPageData:communityPageData})
    }

    //community member length
    const fetchCommunityLength = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const communities_name = communityPageData.communities_name;
            const response = await axiosInstance.get(`${BASE_URL}/getUserByCommunity/${communities_name}`,null, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            });
            setMemeberCount(response.data.length);
        } catch (err) {
            console.error('Unable to get the length of the user', err);
        }
    }

    //to join any community from the community list
    const handleJoinCommunity = async (item) => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            const response = await axiosInstance.post(`${BASE_URL}/addJoinCommunity`, {community_name: item}, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            });
            dispatch(addJoinedCommunity(response.data));
            
        } catch (err) {
            console.error(err);
        }
    }

    const { height: sHeight, width: sWidth } = Dimensions.get('screen');

    const scrollY = useSharedValue(0);

    const handleScroll = useAnimatedScrollHandler((e) => {
        scrollY.value = e.contentOffset.y;
      })
    
      const bgColor = 'white'
      const bgColor2 = tailwind.color('bg-red-400')
      const offsetValue = 100;
      const headerInitialHeight = 100;
      const headerNextHeight = 50;
      const animatedHeader = useAnimatedStyle(() => {
        const height = interpolate(
          scrollY.value,
          [0, offsetValue],
          [headerInitialHeight, headerNextHeight],
          Extrapolation.CLAMP,
        )
    
        const backgroundColor = interpolateColor(
          scrollY.value,
          [0, offsetValue],
          [bgColor, bgColor2]
        )
        return {
          backgroundColor, height
        }
      })
      const nameAnimatedStyles = useAnimatedStyle(() => {
        const opacity = interpolate(
          scrollY.value,
          [0, 100, offsetValue],
          [0, 1, 1],
          Extrapolation.CLAMP,
        )
        const translateX = interpolate(
          scrollY.value,
          [0, offsetValue],
          [0,50],
          Extrapolation.CLAMP,
        )
        const translateY = interpolate(
          scrollY.value,
          [0, offsetValue],
          [0, 10],
          Extrapolation.CLAMP,
        )
        return { opacity, transform: [{ translateX }, { translateY }] }
      });

      const animImage = useAnimatedStyle(() => {
        const yValue = 78;
        const translateY = interpolate(
          scrollY.value,
          [0, offsetValue],
          [0, -yValue],
          Extrapolation.CLAMP,
        )
    
        const xValue = sWidth / 2 - (2 * 16) - 20;
        const translateX = interpolate(
          scrollY.value,
          [0, offsetValue],
          [0, -xValue],
          Extrapolation.CLAMP,
        )
    
        const scale = interpolate(
          scrollY.value,
          [0, offsetValue],
          [1, 0.3],
          Extrapolation.CLAMP,
        )
        return {
          transform: [{ translateY }, { translateX }, { scale }]
        }
      });

    return (
        <View style={tailwind`flex-1`}>
            <Animated.View style={[tailwind`flex-row safe-center`, animatedHeader]}>
                <Pressable onPress={() => navigation.goBack()} style={tailwind`p-1 pt-4`}>
                    <MaterialIcons name="arrow-back" size={22} color="black" />
                </Pressable>
                <Animated.View style={[tailwind`items-center`, nameAnimatedStyles]}>
                    <Text style={[tailwind`text-xl text-black`]}>{communityPageData?.communities_name}</Text>
                </Animated.View>
            </Animated.View>
            <Animated.Image source={""} style={[tailwind`w-32 h-32 rounded-full absolute z-10 self-center top-10 bg-yellow-300`, animImage]}/>
            <Animated.ScrollView onScroll={handleScroll} contentContainerStyle={{height: 856}} style={tailwind`bg-white`}>
                <View style={tailwind`mt-20 items-center`}>
                    <View style={tailwind`items-center`}>
                        <Text style={tailwind`text-black font-bold text-2xl`}>{communityPageData.communities_name}</Text>
                        {/* <Text style={tailwind`text-white text-`}>{communityPageData.description}</Text> */}
                        <Text style={tailwind`text-black text-sm mt-1`}>Community - {memberCount} member</Text>
                    </View>
                </View>
                <View style={tailwind`p-2 flex-row items-center justify-between`}>
                    <Pressable style={tailwind` items-start flex-row rounded bg-red-400 items-center p-2`} onPress={() => handleAnnouncement(communityPageData)}>
                        <AntDesign name="sound" size={20} color="white" style={tailwind`items-center`} />
                        <Text style={tailwind`text-white text-xl ml-2`}>Announcements</Text>
                    </Pressable>
                    <Pressable
                        style={tailwind`rounded-md  ${
                            joinedCommunity?.some(c => c.community_name === communityPageData.communities_name)
                                ? 'bg-gray-500'
                                : 'bg-blue-500'
                        } p-2 m-3 ml-20`}
                        onPress={() => handleJoinCommunity(communityPageData.communities_name)}
                    >
                        <Text style={tailwind`text-white text-xl pl-1.5`}>
                            {joinedCommunity?.some(c => c.community_name === communityPageData.communities_name) ? 'Joined' : 'Join'}
                        </Text>
                    </Pressable>
                </View>
                
                <View style={tailwind`flex-1`}>
                    <TopTabCommunityPage communityPageData={communityPageData}/>
                </View>
            </Animated.ScrollView>
        </View>
    )
}

export default CommunityPage;