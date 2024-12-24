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
    const joinedCommunity = useSelector((state) => state.joinedCommunity.joinedCommunity)
    const [memberCount, setMemeberCount] = useState(1);
    const axiosInstance = useAxiosInterceptor();
    const communityPageData = route.params?.item;

    const { height: sHeight, width: sWidth } = Dimensions.get('screen');

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

    // navigation.setOptions({
    //     headerTitle: '',
    //     headerStyle:{
    //         backgroundColor:'black'
    //     },
    //     headerTintColor:'white'
    // });

    const scrollY = useSharedValue(0);

    const handleScroll = useAnimatedScrollHandler((e) => {
        scrollY.value = e.contentOffset.y;
    });
    
    const bgColor = tailwind.color('bg-red-400')
    const bgColor2 = tailwind.color('bg-red-400')
    const offsetValue = 100;
    const headerInitialHeight = 240;
    const headerNextHeight =60;
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

    const textColor = useAnimatedStyle(() => {
    const color = interpolate(
        scrollY.value,
        [0, offsetValue],
        ['white', 'black']
    )
    return {color};
    })

    const iconColor = useAnimatedStyle(() => {
    const color = interpolate(
        scrollY.value,
        [0, offsetValue],
        ['white', 'black']
    )
    return {color};
    })

    const nameAnimatedStyles = useAnimatedStyle(() => {
    const opacity = interpolate(
        scrollY.value,
        [0, offsetValue],
        [1, 1, 1],
        Extrapolation.CLAMP,
    );
    
    // Set translateX to 0 to prevent horizontal movement
    const xValue = sWidth / 2 - (2 * offsetValue) - 20;
    const translateX = interpolate(
      scrollY.value,
      [0, offsetValue],
      [0, xValue],
      Extrapolation.CLAMP,
    )
    
    // Animate translateY based on scrollY
    const translateY = interpolate(
        scrollY.value,
        [0, offsetValue],
        [50, -2],
        Extrapolation.CLAMP,
    );

    const scale = interpolate(
        scrollY.value,
        [0, offsetValue],
        [1, 0.7],
        Extrapolation.CLAMP,
    );
    
    return { opacity, transform: [{ translateX }, { translateY }, {scale}] };
    });

    const animImage = useAnimatedStyle(() => {

        const opacity = interpolate(
            scrollY.value,
            [0, offsetValue],
            [1, 1, 1],
            Extrapolation.CLAMP,
        );
        
        const xValue = sWidth / 2 - (2 * offsetValue) - 80;
        const translateX = interpolate(
        scrollY.value,
        [0, offsetValue],
        [0, xValue],
        Extrapolation.CLAMP,
        )
        
        // Animate translateY based on scrollY
        const translateY = interpolate(
            scrollY.value,
            [0, offsetValue],
            [50, -6],
            Extrapolation.CLAMP,
        );

        const scale = interpolate(
            scrollY.value,
            [0, offsetValue],
            [1, 0.6],
            Extrapolation.CLAMP,
        );
        return {
            transform: [{ translateY }, { translateX }, { scale }]
        }
    });

    const buttonAnimatedStyles = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, offsetValue],
            [1, 0, 0],
            Extrapolation.CLAMP,
        );

        const height = interpolate(
            scrollY.value,
            [0, offsetValue],
            [headerInitialHeight, 0],
            Extrapolation.CLAMP,
        )
        

        const translateX = interpolate(
            scrollY.value,
            [0, offsetValue],
            [60, -10],
            Extrapolation.CLAMP,
        )
    
        const translateY = interpolate(
            scrollY.value,
            [0, offsetValue],
            [0, -20],
            Extrapolation.CLAMP,
        );
    
        return {
            opacity, height,
            transform: [{ translateY }, { translateX }]
        };
    });


    return (
        <View style={tailwind`flex-1`}>
            <Animated.View style={[tailwind`flex-row items-start bg-red-400`, animatedHeader]}>
                <Pressable onPress={() => navigation.goBack()} style={tailwind`justify-center pt-4 pl-2 pr-1`}>
                    <MaterialIcons name="arrow-back" size={22} color="black" />
                </Pressable>
                <Animated.View style={[tailwind`flex-row items-center`, nameAnimatedStyles]}>
                    <Animated.View style={[tailwind`h-16 w-16 rounded-md bg-yellow-500 items-center justify-center`]}>
                        <Text style={tailwind`text-2xl text-black`}>{communityPageData.displayText}</Text>
                    </Animated.View>
                    <Animated.View style={[tailwind`ml-4`]}>
                        <Text style={tailwind`text-2xl text-black`}>{communityPageData.communities_name}</Text>
                    </Animated.View>
                </Animated.View>
                <Pressable style={tailwind``} onPress={() => handleAnnouncement(communityPageData)}>
                    <AntDesign name="message1" size={20} color="black" style={tailwind`items-end left-30 top-4`} />
                    {/* <Text style={tailwind`text-white text-2xl ml-2`}>Announcements</Text> */}
                </Pressable>
                {/* <Pressable
                        style={tailwind` w-1/5 h-9 rounded-md  ${
                            joinedCommunity?.some(c => c.community_name === communityPageData.communities_name)
                                ? 'bg-gray-500'
                                : 'bg-blue-500'
                        } p-2 m-3 ml-20`}
                        onPress={() => handleJoinCommunity(communityPageData.communities_name)}
                    >
                        <Text style={tailwind`text-white pl-1.5`}>
                            {joinedCommunity?.some(c => c.community_name === communityPageData.communities_name) ? 'Joined' : 'Join'}
                        </Text>
                    </Pressable> */}
            </Animated.View>
            <Animated.ScrollView onScroll={handleScroll} contentContainerStyle={{height: 670}}>
                <TopTabCommunityPage communityPageData={communityPageData}/>
            </Animated.ScrollView>
        </View>
    )
}

export default CommunityPage;
