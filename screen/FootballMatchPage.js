import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useCallback, useEffect, useState, useRef} from 'react';
import { View, Text, Pressable, Image, Modal, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from '../screen/axios_config';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { formattedTime, formattedDate, convertToISOString, formatToDDMMYY } from '../utils/FormattedDateTime';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useSelector, useDispatch } from 'react-redux';
import { addFootballMatchScore, getMatch, setFootballScore, setMatchStatus, addFootballIncidents, setMatchSubStatus } from '../redux/actions/actions';
import { StatusModal } from '../components/modals/StatusModal';
import { useWebSocket } from '../context/WebSocketContext';
import { validateMatchStatus, validateMatchSubStatus, validateMatchForm } from '../utils/validation/matchValidation';
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
import MediaScreen from './Media';
const filePath = require('../assets/status_code.json');

const FootballMatchPage = ({ route }) => {
    const {wsRef, subscribe} = useWebSocket();
    const dispatch = useDispatch();
    const TopTab = createMaterialTopTabNavigator();
    const {matchPublicID, tournament} = route.params;                                                                     
    const match = useSelector((state) => state.footballMatchScore.match);
    const navigation = useNavigation();
    const [allStatus, setAllStatus] = useState([]);
    const [menuVisible, setMenuVisible] = useState(false);
    const [statusVisible, setStatusVisible] = useState(false);
    const [subStatusVisible, setSubStatusVisible] = useState(false);
    const [statusCode, setStatusCode] = useState();
    const [subStatus, setSubStatus] = useState();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const game = useSelector((state) => state.sportReducers.game);
    const payloadData = {
            "type": "SUBSCRIBE",
            "category": "MATCH",
            "payload": {"match_public_id": matchPublicID}
    }
    wsRef?.current?.send(JSON.stringify(payloadData)) 

    useEffect(() => {
        const statusArray = filePath.status_codes;
        const combined = statusArray.reduce((acc, curr) => ({...acc, ...curr}), {})
        setAllStatus(combined)
    }, [])

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
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getMatchByMatchID/${matchPublicID}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                const item = response.data;
                dispatch(getMatch(item.data || null));
            } catch (err) {
                const backendErrors = err?.response?.data?.error?.fields || {};
                setError({
                    global: err?.response?.data?.error?.message || "Unable to load match data. Please try again.",
                    fields: backendErrors,
                })
                console.error("Failed to fetch match data: ", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMatchData();
    }, [matchPublicID, game.name, dispatch]));

    const handleUpdateStatus = async (itm) => {
        try {
            const formData = {
                status_code: itm.type,
            }

            // Validate the form data
            const validation = validateMatchStatus(formData);
            if (!validation.isValid) {
                setError({
                    global: null,
                    fields: validation.errors
                });
                console.error("Validation errors:", validation.errors);
                return;
            }

            // Close modals and show loading
            setStatusVisible(false);
            setMenuVisible(false);
            setLoading(true);
            setError({
                global: null,
                fields: {},
            });

            const authToken = await AsyncStorage.getItem('AccessToken');
            const data = { status_code: itm.type };
            const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateMatchStatus/${matchPublicID}`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            dispatch(setMatchStatus(response.data.data || []));

            // Clear errors on success
            setError({
                global: null,
                fields: {},
            });
        } catch (err) {
            const backendErrors = err?.response?.data?.error?.fields || {};
            setError({
                global: err?.response?.data?.error?.message || "Unable to update match status. Please try again.",
                fields: backendErrors,
            });
            setStatusVisible(true);
            console.error("Unable to update the match status: ", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSubStatus = async (itm) => {
        try {
            const formData = {
                sub_status: itm.type,
                event_type: 'status'
            }
            // Validate the form data
            const validation = validateMatchSubStatus(formData);
            if (!validation.isValid) {
                setError({
                    global: null,
                    fields: validation.errors
                });
                console.error("Validation errors:", validation.errors);
                return;
            }

            // Close modals and show loading
            setSubStatusVisible(false);
            setMenuVisible(false);
            setLoading(true);
            setError({
                global: null,
                fields: {},
            });

            // console.log("Item: Status: ", itm)
            const authToken = await AsyncStorage.getItem('AccessToken');
            const data = { sub_status: itm.type };
            const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateMatchSubStatus/${matchPublicID}`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            dispatch(setMatchSubStatus(response.data.data || response.data || []));

            // Clear errors on success
            setError({
                global: null,
                fields: {},
            });
        } catch (err) {
            const backendErrors = err?.response?.data?.error?.fields || {};
            setError({
                global: err?.response?.data?.error?.message || "Unable to update match sub-status. Please try again.",
                fields: backendErrors,
            });

            // Re-open modal to show error
            setSubStatusVisible(true);
            console.error("Unable to update the match sub-status: ", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleMenu = () => setMenuVisible(!menuVisible);
    const handleSearch = (text) => setSearchQuery(text);

    // Close status modal and clear errors
    const handleCloseStatusModal = () => {
        setStatusVisible(false);
        setError({
            global: null,
            fields: {},
        });
        setSearchQuery('');
    };

    // Close sub-status modal and clear errors
    const handleCloseSubStatusModal = () => {
        setSubStatusVisible(false);
        setError({
            global: null,
            fields: {},
        });
        setSearchQuery('');
    };
    // console.log("All Status: ", allStatus?.football)
    const filteredStatusCodes = allStatus?.football?.filter((item) =>
            item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    console.log("Line no 362: ", filteredStatusCodes)
 

    useEffect(() => {
        if (match) {
            setLoading(false);
        }
    }, [match]);

    if (loading && !match) {
        return (
            <View style={tailwind`flex-1 justify-center items-center bg-white`}>
                <ActivityIndicator size="large" color="#ef4444" />
                <Text style={tailwind`mt-2 text-gray-600`}>Loading match data...</Text>
            </View>
        );
    }

        const handleWebSocketMessage = useCallback((event) => {
            const rawData = event.data;
            if (!rawData) {
                console.error("Raw data is undefined");
                return;
            }
    
            try {
                const message = JSON.parse(rawData);
                // console.log("WebSocket Message Received:", message);
                // console.log("Message Type: ", message.type)
                if(message.type === undefined || message.type === null){
                    console.log("Message type is undefined ")
                    return
                }
                switch(message.type) {
                    case "UPDATE_FOOTBALL_SCORE":
                        // console.log("Score Update Payload:", message.payload);
                        dispatch(setFootballScore(message.payload));
                        break;
                    case "UPDATE_MATCH_STATUS":
                        dispatch(setMatchStatus(message.payload));
                        break;
                    case "UPDATE_MATCH_SUB_STATUS":
                        dispatch(setMatchSubStatus(message.payload));
                        break;
                    default:
                        console.log("Unhandled message type:", message.type);
                }
            } catch (err) {
                console.error("Error parsing WebSocket message football match:", err);
            }
        }, [dispatch]);

    useEffect(() => {
        console.log("Football - Subscribing to WebSocket messages");
        const unsubscribe = subscribe(handleWebSocketMessage);
        return unsubscribe; 
    }, [handleWebSocketMessage, subscribe])

    //console.log("Tournqment Match Page; ", tournament)

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
                                tournament={tournament}
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
                    <TopTab.Screen name="Media">
                        {() => (
                            <MediaScreen
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
                    onRequestClose={() => handleCloseStatusModal()}
                >
                    <View style={tailwind`flex-1 bg-black/50 justify-end`}>
                        {/* Backdrop - tap to close */}
                        <Pressable
                            style={tailwind`absolute inset-0`}
                            onPress={() => handleCloseStatusModal()}
                        />

                        {/* Modal Content - won't close on tap */}
                        <View style={tailwind`bg-white rounded-t-2xl max-h-[75%]`}>
                            {/* Drag Handle */}
                            <View style={tailwind`w-12 h-1.5 bg-gray-300 rounded-full self-center mt-2 mb-3`} />

                            {/* Header */}
                            <View style={tailwind`px-5 pb-4 border-b border-gray-100`}>
                                <Text style={tailwind`text-xl font-bold text-gray-900`}>Update Match Status</Text>
                                <Text style={tailwind`text-sm text-gray-600 mt-1`}>Select the current match status</Text>
                            </View>

                            {/* Search Bar */}
                            <View style={tailwind`px-5 py-4`}>
                                <View style={tailwind`flex-row items-center bg-gray-100 rounded-lg px-4 py-3`}>
                                    <MaterialIcon name="search" size={20} color="#9CA3AF" />
                                    <TextInput
                                        style={tailwind`flex-1 ml-2 text-base text-gray-900`}
                                        placeholder="Search status..."
                                        placeholderTextColor="#9CA3AF"
                                        value={searchQuery}
                                        onChangeText={handleSearch}
                                    />
                                    {searchQuery.length > 0 && (
                                        <Pressable onPress={() => setSearchQuery('')}>
                                            <MaterialIcon name="close" size={20} color="#9CA3AF" />
                                        </Pressable>
                                    )}
                                </View>
                            </View>

                            {/* Global Error Display */}
                            {error?.global && (
                                <View style={tailwind`mx-5 mb-3 bg-red-50 border border-red-200 rounded-lg p-3`}>
                                    <View style={tailwind`flex-row items-center`}>
                                        <MaterialIcon name="error-outline" size={18} color="#ef4444" />
                                        <Text style={tailwind`text-sm font-semibold text-red-800 ml-2 flex-1`}>
                                            {error.global}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Status List */}
                            <ScrollView style={tailwind`pb-10`}>
                                {filteredStatusCodes?.length > 0 ? (
                                    filteredStatusCodes.map((item, index) => (
                                        <Pressable
                                            key={index}
                                            onPress={() => {setStatusCode(item.type); handleUpdateStatus(item);}}
                                            style={tailwind`px-5 py-4 border-b border-gray-100 active:bg-gray-50`}
                                        >
                                            <View style={tailwind`flex-row items-center justify-between`}>
                                                <View style={tailwind`flex-row items-center flex-1`}>
                                                    <View style={tailwind`w-10 h-10 bg-blue-100 rounded-full items-center justify-center`}>
                                                        <MaterialIcon name="sports-soccer" size={20} color="#2563eb" />
                                                    </View>
                                                    <View style={tailwind`ml-3 flex-1`}>
                                                        <Text style={tailwind`text-base font-semibold text-gray-900`}>{item.label}</Text>
                                                        <Text style={tailwind`text-xs text-gray-500 mt-0.5`}>
                                                            {item.type}
                                                        </Text>
                                                    </View>
                                                </View>
                                                {match?.status_code === item.type && (
                                                    <MaterialIcon name="check-circle" size={22} color="#10b981" />
                                                )}
                                            </View>
                                        </Pressable>
                                    ))
                                ) : (
                                    <View style={tailwind`py-12 items-center`}>
                                        <MaterialIcon name="search-off" size={48} color="#d1d5db" />
                                        <Text style={tailwind`text-gray-500 mt-3`}>No status found</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            )}

            {/* Sub Status */}
            {subStatusVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={subStatusVisible}
                    onRequestClose={handleCloseSubStatusModal}
                >
                    <View style={tailwind`flex-1 bg-black/50 justify-end`}>
                        {/* Backdrop - tap to close */}
                        <Pressable
                            style={tailwind`absolute inset-0`}
                            onPress={handleCloseSubStatusModal}
                        />

                        {/* Modal Content - won't close on tap */}
                        <View style={tailwind`bg-white rounded-t-2xl max-h-[75%]`}>
                            {/* Drag Handle */}
                            <View style={tailwind`w-12 h-1.5 bg-gray-300 rounded-full self-center mt-2 mb-3`} />

                            {/* Header */}
                            <View style={tailwind`px-5 pb-4 border-b border-gray-100`}>
                                <Text style={tailwind`text-xl font-bold text-gray-900`}>Update Sub Status</Text>
                                <Text style={tailwind`text-sm text-gray-600 mt-1`}>Select the detailed match sub-status</Text>
                            </View>

                            {/* Search Bar */}
                            <View style={tailwind`px-5 py-4`}>
                                <View style={tailwind`flex-row items-center bg-gray-100 rounded-lg px-4 py-3`}>
                                    <MaterialIcon name="search" size={20} color="#9CA3AF" />
                                    <TextInput
                                        style={tailwind`flex-1 ml-2 text-base text-gray-900`}
                                        placeholder="Search sub status..."
                                        placeholderTextColor="#9CA3AF"
                                        value={searchQuery}
                                        onChangeText={handleSearch}
                                    />
                                    {searchQuery.length > 0 && (
                                        <Pressable onPress={() => setSearchQuery('')}>
                                            <MaterialIcon name="close" size={20} color="#9CA3AF" />
                                        </Pressable>
                                    )}
                                </View>
                            </View>

                            {/* Global Error Display */}
                            {error?.global && (
                                <View style={tailwind`mx-5 mb-3 bg-red-50 border border-red-200 rounded-lg p-3`}>
                                    <View style={tailwind`flex-row items-center`}>
                                        <MaterialIcon name="error-outline" size={18} color="#ef4444" />
                                        <Text style={tailwind`text-sm font-semibold text-red-800 ml-2 flex-1`}>
                                            {error.global}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Status List */}
                            <ScrollView style={tailwind`pb-10`}>
                                {filteredStatusCodes?.length > 0 ? (
                                    filteredStatusCodes.map((item, index) => (
                                        <Pressable
                                            key={index}
                                            onPress={() => {setSubStatus(item.type); handleUpdateSubStatus(item)}}
                                            style={tailwind`px-5 py-4 border-b border-gray-100 active:bg-gray-50`}
                                        >
                                            <View style={tailwind`flex-row items-center justify-between`}>
                                                <View style={tailwind`flex-row items-center flex-1`}>
                                                    <View style={tailwind`w-10 h-10 bg-green-100 rounded-full items-center justify-center`}>
                                                        <MaterialIcon name="timer" size={20} color="#16a34a" />
                                                    </View>
                                                    <View style={tailwind`ml-3 flex-1`}>
                                                        <Text style={tailwind`text-base font-semibold text-gray-900`}>{item.label}</Text>
                                                        <Text style={tailwind`text-xs text-gray-500 mt-0.5`}>
                                                            {item.type}
                                                        </Text>
                                                    </View>
                                                </View>
                                                {match?.sub_status === item.type && (
                                                    <MaterialIcon name="check-circle" size={22} color="#10b981" />
                                                )}
                                            </View>
                                        </Pressable>
                                    ))
                                ) : (
                                    <View style={tailwind`py-12 items-center`}>
                                        <MaterialIcon name="search-off" size={48} color="#d1d5db" />
                                        <Text style={tailwind`text-gray-500 mt-3`}>No sub status found</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </View>
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
                    <TouchableOpacity onPress={toggleMenu} style={tailwind`flex-1 bg-black/30`}>
                        <View style={tailwind`flex-row justify-end`}>
                            <View style={tailwind`mt-16 mr-4 bg-white rounded-xl shadow-2xl overflow-hidden w-56`}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setMenuVisible(false);
                                        setStatusVisible(true);
                                    }}
                                    style={tailwind`px-4 py-4 flex-row items-center border-b border-gray-100 active:bg-gray-50`}
                                >
                                    <View style={tailwind`w-9 h-9 bg-blue-100 rounded-lg items-center justify-center mr-3`}>
                                        <MaterialIcon name="edit" size={18} color="#2563eb" />
                                    </View>
                                    <Text style={tailwind`text-base font-medium text-gray-900`}>Edit Main Status</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setMenuVisible(false);
                                        setSubStatusVisible(true);
                                    }}
                                    style={tailwind`px-4 py-4 flex-row items-center border-b border-gray-100 active:bg-gray-50`}
                                >
                                    <View style={tailwind`w-9 h-9 bg-green-100 rounded-lg items-center justify-center mr-3`}>
                                        <MaterialIcon name="update" size={18} color="#16a34a" />
                                    </View>
                                    <Text style={tailwind`text-base font-medium text-gray-900`}>Edit Sub Status</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setMenuVisible(false);
                                    }}
                                    style={tailwind`px-4 py-4 flex-row items-center border-b border-gray-100 active:bg-gray-50`}
                                >
                                    <View style={tailwind`w-9 h-9 bg-purple-100 rounded-lg items-center justify-center mr-3`}>
                                        <MaterialIcon name="share" size={18} color="#9333ea" />
                                    </View>
                                    <Text style={tailwind`text-base font-medium text-gray-900`}>Share</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setMenuVisible(false);
                                        // Handle delete
                                    }}
                                    style={tailwind`px-4 py-4 flex-row items-center active:bg-red-50`}
                                >
                                    <View style={tailwind`w-9 h-9 bg-red-100 rounded-lg items-center justify-center mr-3`}>
                                        <MaterialIcon name="delete" size={18} color="#dc2626" />
                                    </View>
                                    <Text style={tailwind`text-base font-medium text-red-600`}>Delete Match</Text>
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
        </View>
    );
};

export default FootballMatchPage;