import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { View, Text, Dimensions, Pressable } from "react-native";
import { getJoinedCommunity, addJoinedCommunity } from '../redux/actions/actions';
import { fetchCommunityJoinedByUserService, addUserToCommunity } from '../services/communityServices';
import LinearGradient from "react-native-linear-gradient";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
} from "react-native-reanimated";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import CommunityMember from "./CommunityMember";
import CommunityMessage from "./CommunityMessage";
import tailwind from "twrnc";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width: sWidth } = Dimensions.get("window");
const TopTab = createMaterialTopTabNavigator();

const BG_RED = '#f87171'; // red-400 — matches TournamentPage exactly
const APP_RED = '#ef4444';

export default function CommunityPage({ route }) {
    const { item, communityPublicID } = route.params;
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const joinedCommunity = useSelector((state) => state.joinedCommunity.joinedCommunity || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({ global: null, fields: {} });

    useEffect(() => {
        fetchCommunityJoinedByUser();
    }, []);

    const fetchCommunityJoinedByUser = async () => {
        try {
            setLoading(true);
            const response = await fetchCommunityJoinedByUserService();
            dispatch(getJoinedCommunity(response.data || []));
        } catch (err) {
            setError({ global: "Unable to load community info", fields: {} });
            console.error('unable to get the joined communities', err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinCommunity = async () => {
        try {
            setLoading(true);
            const response = await addUserToCommunity({ communityPublicID: item.public_id });
            dispatch(addJoinedCommunity(response.data));
        } catch (err) {
            setError({ global: "Unable to join community", fields: {} });
            console.error('unable to join community', err);
        } finally {
            setLoading(false);
        }
    };

    const isJoined = joinedCommunity?.some(c => c.public_id === item.public_id);

    // ── Animation constants — mirrors TournamentPage ──
    const parentScrollY = useSharedValue(0);
    const headerHeight   = 160;
    const collapsedHeader = 50;
    const offsetValue    = headerHeight - collapsedHeader; // 110

    // Header height collapses; background stays solid red (like TournamentPage)
    const headerStyle = useAnimatedStyle(() => {
        const height = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [headerHeight, collapsedHeader],
            Extrapolation.CLAMP,
        );
        return { backgroundColor: BG_RED, height };
    });

    // Avatar circle: big + centred → small + slides to left  (mirrors trophyStyle)
    const avatarStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [1, 0.5],
            Extrapolation.CLAMP,
        );
        const translateY = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [30, -24],
            Extrapolation.CLAMP,
        );
        const translateX = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [0, -sWidth/2-60],
            Extrapolation.CLAMP,
        );
        return { transform: [{ scale }, { translateX }, { translateY }] };
    });

    // Community name: slides left alongside avatar  (mirrors titleStyle)
    const titleStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [1, 0.85],
            Extrapolation.CLAMP,
        );
        const translateY = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [44, -80],
            Extrapolation.CLAMP,
        );
        const translateX = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [0, -(sWidth/2) + 170 ],
            Extrapolation.CLAMP,
        );
        return { transform: [{ scale }, { translateX }, { translateY }] };
    });

    // Action buttons (join / announcements): fade out as header collapses
    const actionsStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            parentScrollY.value,
            [0, offsetValue * 0.4],
            [1, 0],
            Extrapolation.CLAMP,
        );
        const translateY = interpolate(
            parentScrollY.value,
            [0, offsetValue * 0.4],
            [0, -10],
            Extrapolation.CLAMP,
        );
        return { opacity, transform: [{ translateY }] };
    });

    // Content container pushes down from header  (mirrors contentContainerStyle)
    const contentContainerStyle = useAnimatedStyle(() => {
        const marginTop = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [headerHeight, collapsedHeader],
            Extrapolation.CLAMP,
        );
        return { flex: 1, marginTop };
    });

    return (
        <View style={[tailwind`flex-1`, { backgroundColor: "#020617" }]}>
            {/* ── Collapsing red header ── */}
            <Animated.View style={[headerStyle, { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }]}>
                <LinearGradient
                    colors={['#1e3a5f', '#1e293b']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />

                {/* Back button — absolute top-left, always white */}
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={tailwind`absolute left-3 top-2 p-1.5 z-10`}
                    hitSlop={12}
                >
                    <MaterialIcons name="arrow-back" size={22} color="#e2e8f0" />
                </Pressable>

                {/* Avatar + name animate together from centre → left */}
                <View style={tailwind`items-center`}>
                    <Animated.View style={[
                        tailwind`w-20 h-20 rounded-full bg-white/20 items-center justify-center`,
                        avatarStyle,
                    ]}>
                        <Text style={tailwind`text-white text-2xl font-bold`}>
                            {item?.name?.charAt(0)?.toUpperCase()}
                        </Text>
                    </Animated.View>

                    <Animated.View style={titleStyle}>
                        <Text style={tailwind`text-xl text-white font-semibold`}>
                            {item?.name}
                        </Text>
                    </Animated.View>
                </View>

                {/* Right-side: Join pill */}
                <View style={tailwind`absolute right-2 top-2 flex-row items-center`}>
                    <Pressable
                        onPress={() => !isJoined && handleJoinCommunity()}
                        disabled={loading || isJoined}
                        style={[
                            tailwind`px-3 py-1 rounded-full`,
                            isJoined ? { backgroundColor: 'rgba(255,255,255,0.15)' } : { backgroundColor: '#ffffff' }
                        ]}
                        hitSlop={8}
                    >
                        <Text style={[
                            tailwind`text-xs font-bold`,
                            isJoined ? tailwind`text-white` : { color: BG_RED },
                        ]}>
                            {isJoined ? 'Joined' : 'Join'}
                        </Text>
                    </Pressable>
                </View>

            </Animated.View>

            {/* ── Top Tabs — pushed down by animated marginTop ── */}
            <Animated.View style={[contentContainerStyle, { backgroundColor: "#020617" }]}>
                <TopTab.Navigator
                    screenOptions={{
                        headerShown: false,
                        tabBarStyle: {
                            backgroundColor: '#1e293b',
                            elevation: 0,
                            shadowOpacity: 0,
                            borderBottomWidth: 1,
                            borderBottomColor: '#334155',
                            zIndex:20,
                        },
                        tabBarLabelStyle: {
                            width:110,
                            fontSize: 14,
                            fontWeight: '600',
                            textTransform: 'none',
                        },
                        tabBarIndicatorStyle: {
                            backgroundColor: '#f87171',
                            height: 3,
                            borderRadius: 2,
                        },
                        tabBarActiveTintColor: '#f1f5f9',
                        tabBarInactiveTintColor: '#64748b',
                    }}
                >   
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
                    <TopTab.Screen name="Announcements">
                        {() => (
                            <CommunityMessage
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
