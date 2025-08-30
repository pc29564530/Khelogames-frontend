import React, { useRef, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { View, Text, Dimensions, Pressable } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import { getJoinedCommunity, addJoinedCommunity } from '../redux/actions/actions';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  useAnimatedScrollHandler,
  interpolateColor,
  useAnimatedProps
} from "react-native-reanimated";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import PostByCommunity from "./PostByCommunity";
import CommunityMember from "./CommunityMember";
import tailwind from "twrnc";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign'

const { height: sHeight, width: sWidth } = Dimensions.get("window");
const TopTab = createMaterialTopTabNavigator();

export default function CommunityPage({ route }) {
    const {item, communityPublicID} = route.params;
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const joinedCommunity = useSelector((state) => state.joinedCommunity.joinedCommunity);
    const [memberCount, setMemberCount] = useState(1);

    const AnimatedMaterialIcons = Animated.createAnimatedComponent(MaterialIcons);
    const AnimatedAntDesign = Animated.createAnimatedComponent(AntDesign)

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
    
    const handleAnnouncement = (item) => {
        navigation.navigate('CommunityMessage', {item:item})
    }

    const fetchCommunityLength = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getUserByCommunity/${communityPublicID}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            });
            setMemberCount(response.data.length);
        } catch (err) {
            console.error('Unable to get the length of the user', err);
        }
    }

    const handleJoinCommunity = async (communityPublicID) => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            const response = await axiosInstance.post(`${BASE_URL}/addJoinCommunity/${communityPublicID}`, {
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

    const parentScrollY = useSharedValue(0);
    const headerHeight = 280; // increased for better content spacing
    const collapsedHeader = 60;
    const offsetValue = 130;

    // Header background animation
    const headerStyle = useAnimatedStyle(() => {
        const height = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [headerHeight, collapsedHeader],
            Extrapolation.CLAMP,
        );

        const backgroundColor = interpolateColor(
            parentScrollY.value,
            [0, offsetValue],
            ["white", "red"]
        );

        return {
            backgroundColor,
            height
        };
    });

    // Collapsed state title animation (shows in header bar)
    const collapsedTitleStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
                  parentScrollY.value,
                  [0, offsetValue],
                  [0, 1],
                  Extrapolation.CLAMP,
                )
                const translateX = interpolate(
                  parentScrollY.value,
                  [0, offsetValue],
                  [0, 42],
                  Extrapolation.CLAMP,
                )
                const translateY = interpolate(
                  parentScrollY.value,
                  [0, offsetValue],
                  [0, 5],
                  Extrapolation.CLAMP,
                )
                const color = interpolateColor(
                    parentScrollY.value,
                    [0, offsetValue],
                    ['black', 'white']
                )
                return { opacity, transform: [{ translateX }, { translateY }] , color}
    });

    // Avatar animation for collapsed state
    const animImage = useAnimatedStyle(() => {
        const translateY = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [0, -headerHeight/2+104],
            Extrapolation.CLAMP,
        );

        const translateX = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [0, -sWidth / 2 + 56],
            Extrapolation.CLAMP,
        );

        const scale = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [1, 0.4],
            Extrapolation.CLAMP,
        );

        return {
            transform: [{ translateY }, { translateX }, { scale }],
        };
    });

    // Content fade out animation (for member count, buttons, etc.)
    const contentFadeStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            parentScrollY.value,
            [0, offsetValue * 0.6],
            [1, 0],
            Extrapolation.CLAMP,
        );

        const translateY = interpolate(
            parentScrollY.value,
            [0, offsetValue * 0.6],
            [0, -20],
            Extrapolation.CLAMP,
        );

        return {
            opacity,
            transform: [{ translateY }]
        };
    });

    const textColorSytle = useAnimatedStyle(() => {
        return {
              color: interpolateColor(
                parentScrollY.value,
                [0, offsetValue],
                ['black', 'white']
              ),
        }
    })

    // Tab container animation
    const tabContainerStyle = useAnimatedStyle(() => {
        const marginTop = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [headerHeight, collapsedHeader],
            Extrapolation.CLAMP,
        );

        return { marginTop };
    });

    const animatedIconProps = useAnimatedProps(() => {
            return {
              color: interpolateColor(
                parentScrollY.value,
                [0, offsetValue],
                ['black', 'white']
              ),
            }
          })

    return (
        <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
            {/* Collapsing Header */}
            <Animated.View
                style={[
                    headerStyle,
                    { 
                        position: "absolute", 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        zIndex: 10
                    },
                ]}
            >
                {/* Header Bar with Back Button and Collapsed Title */}
                <View style={tailwind`flex-row py-2 h-16`}>
                    <Pressable onPress={() => navigation.goBack()} style={tailwind`p-2`}>
                        <AnimatedMaterialIcons name="arrow-back" size={24} animatedProps={animatedIconProps}/>
                    </Pressable>
                    <View style={[tailwind`font-bold text-black`]}>
                        <Animated.Text style={[tailwind`text-lg font-bold text-black`, collapsedTitleStyle]}>
                            {item?.name}
                        </Animated.Text>
                    </View>
                </View>

                {/* Expanded Content Area */}
                <View style={tailwind`flex-1 items-center justify-center px-6 pt-2 pb-2`}>
                    {/* Avatar */}
                    <Animated.Image 
                        source={{ uri: item?.imageUrl }} 
                        style={[
                            tailwind`w-24 h-24 rounded-full bg-yellow-400 mb-4`,
                            animImage
                        ]}
                    />

                    {/* Content that fades out on scroll */}
                    <Animated.View style={[tailwind`items-center w-full`, contentFadeStyle]}>
                        {/* Community Name and Member Count */}
                        <View style={tailwind`items-center mb-4`}>
                            <Text style={tailwind`text-2xl font-bold text-black mb-2`}>
                                {item?.name}
                            </Text>
                            <Text style={tailwind`text-gray-600 text-sm`}>
                                Community • {memberCount} {memberCount === 1 ? 'member' : 'members'}
                            </Text>
                        </View>

                        {/* Action Buttons */}
                        <View style={tailwind`flex-row items-center justify-center w-full px-4 gap-3`}>
                            {/* Announcements Button */}
                            <Pressable 
                                style={tailwind`flex-row items-center bg-red-500 rounded-lg px-4 py-3 flex-1`} 
                                onPress={() => handleAnnouncement(item)}
                            >
                                <AntDesign name="sound" size={18} color="white" />
                                <Text style={tailwind`text-white font-medium ml-2`}>
                                    Announcements
                                </Text>
                            </Pressable>

                            {/* Join/Joined Button */}
                            <Pressable
                                style={tailwind`rounded-lg px-6 py-3 ${
                                    joinedCommunity?.some(c => c.name === item.name)
                                        ? 'bg-gray-500'
                                        : 'bg-blue-500'
                                }`}
                                onPress={() => handleJoinCommunity(item.public_id)}
                            >
                                <Text style={tailwind`text-white font-medium`}>
                                    {joinedCommunity?.some(c => c.name === item.name) ? 'Joined' : 'Join'}
                                </Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                </View>
            </Animated.View>

            {/* Top Tabs with animated margin */}
            <Animated.View style={[tabContainerStyle, { flex: 1 }]}>
                <TopTab.Navigator
                    screenOptions={{
                        tabBarStyle: { 
                            backgroundColor: "white",
                            elevation: 4,
                            shadowOpacity: 0.1,
                        },
                        tabBarLabelStyle: {
                            fontSize: 14,
                            fontWeight: '600',
                        },
                        tabBarIndicatorStyle: {
                            backgroundColor: '#ef4444',
                        },
                    }}
                >
                    <TopTab.Screen name="Posts">
                        {() => (
                            <PostByCommunity
                                item={item}
                                parentScrollY={parentScrollY}
                                headerHeight={headerHeight}
                                collapsedHeader={collapsedHeader}
                            />
                        )}
                    </TopTab.Screen>
                    <TopTab.Screen name="Members">
                        {() => (
                            <CommunityMember
                                item={item}
                                parentScrollY={parentScrollY}
                                headerHeight={headerHeight}
                                collapsedHeader={collapsedHeader}
                            />
                        )}
                    </TopTab.Screen>
                </TopTab.Navigator>
            </Animated.View>
        </View>
    );
}