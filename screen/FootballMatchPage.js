import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useCallback, useEffect, useState} from 'react';
import { View, Text, Pressable, Image, Modal, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from '../screen/axios_config';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { formattedTime, formattedDate, convertToISOString, formatToDDMMYY } from '../utils/FormattedDateTime';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useSelector, useDispatch } from 'react-redux';
import { getMatch } from '../redux/actions/actions';
import { StatusModal } from '../components/modals/StatusModal';
const filePath = require('../assets/status_code.json');
import Animated, { 
    Extrapolation, 
    interpolate, 
    interpolateColor, 
    useAnimatedScrollHandler, 
    useAnimatedStyle, 
    useSharedValue,
} from 'react-native-reanimated';
import axios from 'axios';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import TournamentStanding from './TournamentStanding';
import FootballLineUp from './FootballLineUp';
import FootballDetails from './FootballDetails';
import FootballIncidents from './FootballIncidents';

const FootballMatchPage = ({ route }) => {
    const dispatch = useDispatch();
    const TopTab = createMaterialTopTabNavigator();
    const {matchPublicID} = route.params;                                                                     
    const match = useSelector((state) => state.matches.match);
    const navigation = useNavigation();
    const [menuVisible, setMenuVisible] = useState(false);
    const [statusVisible, setStatusVisible] = useState(false);
    const [statusCode, setStatusCode] = useState();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const game = useSelector((state) => state.sportReducers.game);

    const {height: sHeight, width: sWidth} = Dimensions.get('screen');

    // Shared scroll value for all child components
    const parentScrollY = useSharedValue(0);
    
    // Animation constants
    const bgColor = '#ffffff';   // white
    const bgColor2 = '#f87171';  // red-400
    const headerHeight = 200;
    const collapsedHeader = 60;
    const offsetValue = 120;

    // Header animation style
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
            [bgColor2, bgColor2]
        );

        const opacity = interpolate(
            parentScrollY.value,
            [0, offsetValue * 0.5, offsetValue],
            [1, 0.8, 0.6],
            Extrapolation.CLAMP,
        );

        return {
            backgroundColor, 
            height,
        };
    });

    // Content container animation
    const contentContainerStyle = useAnimatedStyle(() => {
        const marginTop = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [headerHeight, collapsedHeader],
            Extrapolation.CLAMP,
        );
        return { 
            marginTop,
            flex: 1,
        };
    });

    //Content firstTeam animation
    const firstAvatarStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [0,-90],
            Extrapolation.CLAMP
        );
        const translateX = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [0,40],
            Extrapolation.CLAMP
        )
        const scale = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [1, 0.8],
            Extrapolation.CLAMP,
        );
        return {
            transform:[{translateY}, {translateX}, {scale}]
        }
    })

        //Content firstTeam animation
    const secondAvatarStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [0,-90],
            Extrapolation.CLAMP
        );
        const translateX = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [0,-40],
            Extrapolation.CLAMP
        )
        const scale = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [1, 0.8],
            Extrapolation.CLAMP,
        );
        return {
            transform:[{translateY}, {translateX}, {scale}]
        }
    })

    // Score visibility animation
    const scoreStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [0,-100],
            Extrapolation.CLAMP
        );
        const opacity = interpolate(
            parentScrollY.value,
            [0, offsetValue * 0.7],
            [1, 0],
            Extrapolation.CLAMP,
        );

        const scale = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [1, 0.8],
            Extrapolation.CLAMP,
        );

        return {
            transform: [ {translateY}, {scale}]
        };
    });

    const fadeStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            parentScrollY.value,
            [0, offsetValue * 0.7],
            [1, 0],
            Extrapolation.CLAMP,
        );

        const scale = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [1, 0.8],
            Extrapolation.CLAMP,
        );

        return {
            opacity,
            transform: [{ scale }]
        };
    });

    useFocusEffect(useCallback(() => {
        const fetchMatchData = async () => {
            setLoading(true);
            setError('');
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getMatchByMatchID/${matchPublicID}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                dispatch(getMatch(response.data || null));
            } catch (err) {
                console.error("Failed to fetch match data: ", err);
                setError("Failed to load match data. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchMatchData();
    }, [matchPublicID, game.name, dispatch]));

    const handleUpdateResult = async (itm) => {
        setStatusVisible(false);
        setMenuVisible(false);
        setLoading(true);
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const data = { status_code: itm };
            const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateMatchStatus/${matchPublicID}`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            dispatch(getMatch(response.data || []));
        } catch (err) {
            console.error("Unable to update the match: ", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleMenu = () => setMenuVisible(!menuVisible);
    const handleSearch = (text) => setSearchQuery(text);

    const filteredStatusCodes = filePath["status_codes"].filter((item) => 
        item.type.includes(searchQuery) || item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && !match) {
        return (
            <View style={tailwind`flex-1 justify-center items-center bg-white`}>
                <ActivityIndicator size="large" color="#ef4444" />
                <Text style={tailwind`mt-2 text-gray-600`}>Loading match data...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={tailwind`flex-1 justify-center items-center bg-white px-4`}>
                <Text style={tailwind`text-red-500 text-center`}>{error}</Text>
                <Pressable 
                    onPress={() => {
                        setError('');
                        // Retry logic here
                    }}
                    style={tailwind`mt-4 bg-red-500 px-6 py-2 rounded-lg`}
                >
                    <Text style={tailwind`text-white`}>Retry</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={tailwind`flex-1 bg-white`}>
            {/* Animated Header */}
            <Animated.View
                style={[
                    headerStyle,
                    { 
                        position: "absolute", 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        zIndex: 10,
                    },
                ]}
            >
                {/* Header Controls */}
                <View style={tailwind`flex-row justify-between items-center px-4 py-3 mt-1`}>
                    <Pressable onPress={() => navigation.goBack()}>
                        <AntDesign name="arrowleft" size={26} color="white" />
                    </Pressable>
                    <Pressable onPress={toggleMenu}>
                        <MaterialIcon name="more-vert" size={24} color="white" />
                    </Pressable>
                </View>

                {/* Match Status */}
                <Animated.View style={[tailwind`items-center`, fadeStyle]}>
                    <Text style={tailwind`text-white text-lg font-semibold`}>
                        {match?.status_code || 'Loading...'}
                    </Text>
                </Animated.View>

                {/* Team Information and Score */}
                <Animated.View style={[tailwind`flex-row justify-between items-center px-2 py-2 mt-2`]}>
                    {/* Home Team */}
                    <Animated.View style={[tailwind`items-center flex-1`,firstAvatarStyle]}>
                        {match?.homeTeam?.media_url ? (
                            <Image
                                source={{ uri: match.homeTeam.media_url }}
                                style={tailwind`w-12 h-12 rounded-full`}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={tailwind`rounded-full h-12 w-12 bg-yellow-400 items-center justify-center`}>
                                <Text style={tailwind`text-white text-lg font-bold`}>
                                    {match?.homeTeam?.name?.charAt(0)?.toUpperCase() || 'H'}
                                </Text>
                            </View>
                        )}
                        <Animated.Text style={[tailwind`text-white text-sm mt-2 text-center`, fadeStyle]} numberOfLines={2}>
                            {match?.homeTeam?.name || 'Home'}
                        </Animated.Text>
                    </Animated.View>
                    {/* Score and Date and Time */}
                    {match?.status_code === "not_started" ? (
                        <Animated.View style={[tailwind`items-center justify-center `,scoreStyle]}>
                            <Text style={tailwind`text-white items-center`}>{formatToDDMMYY(convertToISOString(match.start_timestamp))}</Text>
                            <Text style={tailwind`text-white items-center`}>{formattedTime(convertToISOString(match.start_timestamp))}</Text>
                        </Animated.View>
                    ):(
                        <Animated.View style={[tailwind`items-center justify-center flex-1`, scoreStyle]}>
                            <View style={tailwind`flex-row items-center -mt-4 gap-2`}>
                                <Text style={tailwind`text-white text-3xl font-bold`}>
                                    {match?.homeScore?.goals || 0}
                                </Text>
                                <Text style={tailwind`text-white text-3xl font-bold`}>-</Text>
                                <Text style={tailwind`text-white text-3xl font-bold`}>
                                    {match?.awayScore?.goals || 0}
                                </Text>
                            </View>

                            {/* Penalty Shootout Score */}
                            {match?.homeScore?.penalty_shootout !== null &&
                                match?.awayScore?.penalty_shootout !== null && (
                                    <View style={tailwind`flex-row items-center mt-2`}>
                                        <View style={tailwind`bg-white bg-opacity-20 px-2 py-1 rounded`}>
                                            <Text style={tailwind`text-white text-sm font-semibold`}>PEN</Text>
                                        </View>
                                        <Text style={tailwind`text-white text-lg font-semibold ml-2`}>
                                            {match?.homeScore?.penalty_shootout} - {match?.awayScore?.penalty_shootout}
                                        </Text>
                                    </View>
                            )}
                        </Animated.View>
                    )}
                    {/* Away Team */}
                    <Animated.View style={[tailwind`items-center flex-1`, secondAvatarStyle]}>
                        {match?.awayTeam?.media_url ? (
                            <Image
                                source={{ uri: match.awayTeam.media_url }}
                                style={tailwind`w-12 h-12 rounded-full`}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={tailwind`rounded-full h-12 w-12 bg-yellow-400 items-center justify-center`}>
                                <Text style={tailwind`text-white text-lg font-bold`}>
                                    {match?.awayTeam?.name?.charAt(0)?.toUpperCase() || 'A'}
                                </Text>
                            </View>
                        )}
                        <Animated.Text style={[tailwind`text-white text-sm mt-2 text-center`, fadeStyle]} numberOfLines={2}>
                            {match?.awayTeam?.name || 'Away'}
                        </Animated.Text>
                    </Animated.View>
                </Animated.View>
            </Animated.View>

            {/* Content Container */}
            <Animated.View style={[contentContainerStyle]}>
                <TopTab.Navigator
                    screenOptions={{
                        tabBarStyle: { 
                            backgroundColor: '#f87171',
                            elevation: 4,
                            shadowOpacity: 0.1,
                            zIndex:20, // used this more then top tab because not having proper touch
                        },
                        tabBarLabelStyle: {
                            fontSize: 14,
                            fontWeight: '600',
                            textTransform: 'none',
                            color: 'white',
                        },
                        tabBarIndicatorStyle: {
                            backgroundColor: '#fff',
                        },
                        tabBarActiveTintColor: '#fff',
                        tabBarInactiveTintColor: '#ffe4e6',
                    }}
                >
                    <TopTab.Screen name="Details">
                        {() => (
                            <FootballDetails
                                item={match}
                                parentScrollY={parentScrollY}
                                headerHeight={headerHeight}
                                collapsedHeader={collapsedHeader}
                            />
                        )}
                    </TopTab.Screen>

                    <TopTab.Screen name="Incidents">
                        {() => (
                            <FootballIncidents
                                item={match}
                                parentScrollY={parentScrollY}
                                headerHeight={headerHeight}
                                collapsedHeader={collapsedHeader}
                            />
                        )}
                    </TopTab.Screen>

                    <TopTab.Screen name="LineUp">
                        {() => (
                            <FootballLineUp
                                item={match}
                                parentScrollY={parentScrollY}
                                headerHeight={headerHeight}
                                collapsedHeader={collapsedHeader}
                            />
                        )}
                    </TopTab.Screen>
                </TopTab.Navigator>
            </Animated.View>

            {/* Status Modal */}
            {statusVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={statusVisible}
                    onRequestClose={() => setStatusVisible(false)}
                >
                    <Pressable 
                        onPress={() => setStatusVisible(false)} 
                        style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}
                    >
                        <View style={tailwind`bg-white rounded-t-lg max-h-[70%]`}>
                            <View style={tailwind`p-4 border-b border-gray-200`}>
                                <Text style={tailwind`text-lg font-semibold text-center`}>Update Match Status</Text>
                            </View>
                            <TextInput
                                style={tailwind`bg-gray-100 p-3 m-4 rounded-md text-black`}
                                placeholder="Search status..."
                                value={searchQuery}
                                onChangeText={handleSearch}
                            />
                            <ScrollView style={tailwind`flex-1`}>
                                {filteredStatusCodes.map((item, index) => (
                                    <Pressable 
                                        key={index} 
                                        onPress={() => { 
                                            setStatusCode(item.type); 
                                            handleUpdateResult(item.type); 
                                        }} 
                                        style={tailwind`p-4 border-b border-gray-200 flex-row items-center`}
                                    >
                                        <Text style={tailwind`text-lg text-gray-600 mr-3`}>
                                            {index + 1}.
                                        </Text>
                                        <Text style={tailwind`text-lg text-gray-800 flex-1`}>
                                            {item.description}
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                    </Pressable>
                </Modal>
            )}

            {/* Menu Modal */}
            {menuVisible && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={menuVisible}
                    onRequestClose={toggleMenu}
                >
                    <TouchableOpacity onPress={toggleMenu} style={tailwind`flex-1`}>
                        <View style={tailwind`flex-row justify-end`}>
                            <View style={tailwind`mt-20 mr-4 bg-white rounded-lg shadow-lg p-2 w-40`}>
                                <TouchableOpacity 
                                    onPress={() => {
                                        setMenuVisible(false);
                                        setStatusVisible(true);
                                    }}
                                    style={tailwind`p-3`}
                                >
                                    <Text style={tailwind`text-lg text-gray-800`}>Edit Match</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => {
                                        setMenuVisible(false);
                                        // Handle delete
                                    }}
                                    style={tailwind`p-3`}
                                >
                                    <Text style={tailwind`text-lg text-red-600`}>Delete Match</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => {
                                        setMenuVisible(false);
                                    }}
                                    style={tailwind`p-3`}
                                >
                                <Text style={tailwind`text-lg text-gray-800`}>Share</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}

            {/* Loading Overlay */}
            {loading && (
                <View style={tailwind`absolute inset-0 bg-black bg-opacity-30 justify-center items-center z-50`}>
                    <View style={tailwind`bg-white rounded-lg p-6 items-center`}>
                        <ActivityIndicator size="large" color="#ef4444" />
                        <Text style={tailwind`mt-2 text-gray-600`}>Updating...</Text>
                    </View>
                </View>
            )}
            <StatusModal
                visible={statusVisible}
                onClose={() => setStatusVisible(false)}
                onSelect={(code) => updateStatus(code)}
            />
        </View>
    );
};

export default FootballMatchPage;