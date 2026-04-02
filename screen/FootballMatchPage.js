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
import LinearGradient from 'react-native-linear-gradient';
import { displayMatchStatus } from '../utils/MatchStatus';
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
    const match = useSelector((state) => state.matches.match);
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
    const bgColor = '#0f172a';   // dark navy
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
            if(err?.response?.data?.error?.code === "FORBIDDEN"){
                setError({
                    global: err?.response?.data?.error?.message,
                    fields: {},
                })
            } else {
                setError({
                    global: err?.response?.data?.error?.message || "Unable to update match status. Please try again.",
                    fields: backendErrors,
                });
            }
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
            if(err?.response?.data?.error?.code === "FORBIDDEN"){
                setError({
                    global: err?.response?.data?.error?.message,
                    fields: {},
                })
            } else {
                setError({
                    global: "Unable to update match sub-status. Please try again",
                    fields: backendErrors,
                });
            }

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
 
    useEffect(() => {
        if (match) {
            setLoading(false);
        }
    }, [match]);

        const handleWebSocketMessage = useCallback((event) => {
            const rawData = event.data;
            if (!rawData) {
                console.error("Raw data is undefined");
                return;
            }
    
            try {
                const message = JSON.parse(rawData);
                if(message.type === undefined || message.type === null){
                    console.log("Message type is undefined ")
                    return
                }
                switch(message.type) {
                    case "UPDATE_FOOTBALL_SCORE":
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

    if (loading && !match) {
        return (
            <View style={[tailwind`flex-1 justify-center items-center`, {backgroundColor: '#0f172a'}]}>
                <ActivityIndicator size="large" color="#f87171" />
                <Text style={[tailwind`mt-2`, {color: '#94a3b8'}]}>
                    Loading match data...
                </Text>
            </View>
        );
    }

    return (
        <View style={[tailwind`flex-1`, {backgroundColor: '#0f172a'}]}>
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
                        backgroundColor: '#0f172a'
                    },
                ]}
            >
                <LinearGradient
                    colors={['#1e3a5f', '#1e293b']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
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
                        {displayMatchStatus(match?.status_code)}
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
                            <View style={[tailwind`rounded-full h-12 w-12 items-center justify-center`, { backgroundColor: '#334155' }]}>
                                <Text style={[tailwind`text-lg font-bold`, { color: '#f87171' }]}>
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
                            <View style={[tailwind`rounded-full h-12 w-12 items-center justify-center`, { backgroundColor: '#334155' }]}>
                                <Text style={[tailwind`text-lg font-bold`, { color: '#f87171' }]}>
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
                            backgroundColor: '#1e293b',
                            elevation: 0,
                            shadowOpacity: 0,
                            borderBottomWidth: 1,
                            borderBottomColor: '#334155',
                            zIndex:20,
                        },
                        tabBarLabelStyle: {
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
                        <View style={[tailwind`rounded-t-2xl max-h-[75%]`, { backgroundColor: '#1e293b' }]}>
                            {/* Drag Handle */}
                            <View style={[tailwind`w-12 h-1.5 rounded-full self-center mt-2 mb-3`, { backgroundColor: '#475569' }]} />

                            {/* Header */}
                            <View style={[tailwind`px-5 pb-4`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
                                <Text style={[tailwind`text-xl font-bold`, { color: '#f1f5f9' }]}>Update Match Status</Text>
                                <Text style={[tailwind`text-sm mt-1`, { color: '#64748b' }]}>Select the current match status</Text>
                            </View>

                            {/* Search Bar */}
                            <View style={tailwind`px-5 py-4`}>
                                <View style={[tailwind`flex-row items-center rounded-lg px-4 py-3`, { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' }]}>
                                    <MaterialIcon name="search" size={20} color="#64748b" />
                                    <TextInput
                                        style={[tailwind`flex-1 ml-2 text-base`, { color: '#f1f5f9' }]}
                                        placeholder="Search status..."
                                        placeholderTextColor="#475569"
                                        value={searchQuery}
                                        onChangeText={handleSearch}
                                    />
                                    {searchQuery.length > 0 && (
                                        <Pressable onPress={() => setSearchQuery('')}>
                                            <MaterialIcon name="close" size={20} color="#64748b" />
                                        </Pressable>
                                    )}
                                </View>
                            </View>

                            {/* Global Error Display */}
                            {error?.global && (
                                <View style={[tailwind`mx-5 mb-3 rounded-lg p-3`, { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
                                    <View style={tailwind`flex-row items-center`}>
                                        <MaterialIcon name="error-outline" size={18} color="#fca5a5" />
                                        <Text style={[tailwind`text-sm font-semibold ml-2 flex-1`, { color: '#fca5a5' }]}>
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
                                            style={[tailwind`px-5 py-4`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}
                                        >
                                            <View style={tailwind`flex-row items-center justify-between`}>
                                                <View style={tailwind`flex-row items-center flex-1`}>
                                                    <View style={[tailwind`w-10 h-10 rounded-full items-center justify-center`, { backgroundColor: '#3b82f620' }]}>
                                                        <MaterialIcon name="sports-soccer" size={20} color="#60a5fa" />
                                                    </View>
                                                    <View style={tailwind`ml-3 flex-1`}>
                                                        <Text style={[tailwind`text-base font-semibold`, { color: '#f1f5f9' }]}>{item.label}</Text>
                                                        <Text style={[tailwind`text-xs mt-0.5`, { color: '#64748b' }]}>
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
                                        <MaterialIcon name="search-off" size={48} color="#475569" />
                                        <Text style={[tailwind`mt-3`, { color: '#64748b' }]}>No status found</Text>
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
                        <View style={[tailwind`rounded-t-2xl max-h-[75%]`, { backgroundColor: '#1e293b' }]}>
                            {/* Drag Handle */}
                            <View style={[tailwind`w-12 h-1.5 rounded-full self-center mt-2 mb-3`, { backgroundColor: '#475569' }]} />

                            {/* Header */}
                            <View style={[tailwind`px-5 pb-4`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
                                <Text style={[tailwind`text-xl font-bold`, { color: '#f1f5f9' }]}>Update Sub Status</Text>
                                <Text style={[tailwind`text-sm mt-1`, { color: '#64748b' }]}>Select the detailed match sub-status</Text>
                            </View>

                            {/* Search Bar */}
                            <View style={tailwind`px-5 py-4`}>
                                <View style={[tailwind`flex-row items-center rounded-lg px-4 py-3`, { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' }]}>
                                    <MaterialIcon name="search" size={20} color="#64748b" />
                                    <TextInput
                                        style={[tailwind`flex-1 ml-2 text-base`, { color: '#f1f5f9' }]}
                                        placeholder="Search sub status..."
                                        placeholderTextColor="#475569"
                                        value={searchQuery}
                                        onChangeText={handleSearch}
                                    />
                                    {searchQuery.length > 0 && (
                                        <Pressable onPress={() => setSearchQuery('')}>
                                            <MaterialIcon name="close" size={20} color="#64748b" />
                                        </Pressable>
                                    )}
                                </View>
                            </View>

                            {/* Global Error Display */}
                            {error?.global && (
                                <View style={[tailwind`mx-5 mb-3 rounded-lg p-3`, { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
                                    <View style={tailwind`flex-row items-center`}>
                                        <MaterialIcon name="error-outline" size={18} color="#fca5a5" />
                                        <Text style={[tailwind`text-sm font-semibold ml-2 flex-1`, { color: '#fca5a5' }]}>
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
                                            style={[tailwind`px-5 py-4`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}
                                        >
                                            <View style={tailwind`flex-row items-center justify-between`}>
                                                <View style={tailwind`flex-row items-center flex-1`}>
                                                    <View style={[tailwind`w-10 h-10 rounded-full items-center justify-center`, { backgroundColor: '#10b98120' }]}>
                                                        <MaterialIcon name="timer" size={20} color="#4ade80" />
                                                    </View>
                                                    <View style={tailwind`ml-3 flex-1`}>
                                                        <Text style={[tailwind`text-base font-semibold`, { color: '#f1f5f9' }]}>{item.label}</Text>
                                                        <Text style={[tailwind`text-xs mt-0.5`, { color: '#64748b' }]}>
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
                                        <MaterialIcon name="search-off" size={48} color="#475569" />
                                        <Text style={[tailwind`mt-3`, { color: '#64748b' }]}>No sub status found</Text>
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
                            <View style={[tailwind`mt-16 mr-4 rounded-xl overflow-hidden w-56`, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setMenuVisible(false);
                                        setStatusVisible(true);
                                    }}
                                    style={[tailwind`px-4 py-4 flex-row items-center`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}
                                >
                                    <View style={[tailwind`w-9 h-9 rounded-lg items-center justify-center mr-3`, { backgroundColor: '#3b82f620' }]}>
                                        <MaterialIcon name="edit" size={18} color="#60a5fa" />
                                    </View>
                                    <Text style={[tailwind`text-base font-medium`, { color: '#f1f5f9' }]}>Edit Main Status</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setMenuVisible(false);
                                        setSubStatusVisible(true);
                                    }}
                                    style={[tailwind`px-4 py-4 flex-row items-center`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}
                                >
                                    <View style={[tailwind`w-9 h-9 rounded-lg items-center justify-center mr-3`, { backgroundColor: '#10b98120' }]}>
                                        <MaterialIcon name="update" size={18} color="#4ade80" />
                                    </View>
                                    <Text style={[tailwind`text-base font-medium`, { color: '#f1f5f9' }]}>Edit Sub Status</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setMenuVisible(false);
                                    }}
                                    style={[tailwind`px-4 py-4 flex-row items-center`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}
                                >
                                    <View style={[tailwind`w-9 h-9 rounded-lg items-center justify-center mr-3`, { backgroundColor: '#9333ea20' }]}>
                                        <MaterialIcon name="share" size={18} color="#c084fc" />
                                    </View>
                                    <Text style={[tailwind`text-base font-medium`, { color: '#f1f5f9' }]}>Share</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setMenuVisible(false);
                                        // Handle delete
                                    }}
                                    style={tailwind`px-4 py-4 flex-row items-center`}
                                >
                                    <View style={[tailwind`w-9 h-9 rounded-lg items-center justify-center mr-3`, { backgroundColor: '#ef444420' }]}>
                                        <MaterialIcon name="delete" size={18} color="#f87171" />
                                    </View>
                                    <Text style={[tailwind`text-base font-medium`, { color: '#f87171' }]}>Delete Match</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}

            {/* Loading Overlay */}
            {loading && (
                <View style={tailwind`absolute inset-0 bg-black bg-opacity-30 justify-center items-center z-50`}>
                    <View style={[tailwind`rounded-lg p-6 items-center`, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
                        <ActivityIndicator size="large" color="#f87171" />
                        <Text style={[tailwind`mt-2`, { color: '#94a3b8' }]}>Updating...</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

export default FootballMatchPage;