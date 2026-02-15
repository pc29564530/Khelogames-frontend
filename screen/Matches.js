import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Image, PermissionsAndroid, Platform, Alert, FlatList, ActivityIndicator } from 'react-native';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DatePicker from 'react-native-modern-datepicker';
import { useSelector, useDispatch } from 'react-redux';
import {setGames, setGame } from '../redux/actions/actions';
import { sportsServices } from '../services/sportsServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import { formatToDDMMYY, formattedDate, formattedTime, convertToISOString, localToUTCTimestamp,  } from '../utils/FormattedDateTime';
import { getMatches, getTournamentByIdAction } from '../redux/actions/actions';
import { convertBallToOvers } from '../utils/ConvertBallToOvers';
import { requestLocationPermission } from '../utils/locationService';

const liveStatus = ['in_progress', 'break', 'half_time', 'penalty_shootout', 'extra_time'];

const STATUS_LABELS = {
    not_started: 'Upcoming',
    in_progress: 'Live',
    half_time: 'Half Time',
    break: 'Break',
    finished: 'FT',
    penalty_shootout: 'Penalties',
    extra_time: 'Extra Time',
};

export const renderInningScore = (scores) => {
    return scores?.map((score, index) => (
      <View key={index} style={tailwind`flex-row ml-2`}>
        <Text style={tailwind`ml-2 text-lg text-gray-800`}>
          {score.score}/{score.wickets}
        </Text>
        {score.overs !== undefined && (
            <Text style={tailwind`ml-2 text-lg text-gray-800`}>({convertBallToOvers(score.overs)})</Text>
        )}
      </View>
    ));
  };

export const emptyStateUI = () => {
    return (
        <View style={tailwind`flex-1 justify-center items-center p-6`}>
            <AntDesign name="calendar" size={64} color="#d1d5db" />
            <Text style={tailwind`text-gray-700 text-xl font-semibold mt-4 text-center`}>
                No Matches Scheduled
            </Text>
            <Text style={tailwind`text-gray-500 text-sm mt-2 text-center`}>
                No {game?.name} matches found for {formattedDate(selectedDate)}
            </Text>
            <Text style={tailwind`text-gray-400 text-xs mt-3 text-center`}>
                Try selecting a different date or sport, or check Live matches
            </Text>
            <View style={tailwind`flex-row gap-3 mt-6`}>
                <Pressable
                    onPress={() => setIsDatePickerVisible(true)}
                    style={tailwind`bg-orange-400 px-6 py-3 rounded-lg`}
                >
                    <Text style={tailwind`text-white font-semibold`}>Change Date</Text>
                </Pressable>
                <Pressable
                    onPress={handleLiveMatches}
                    style={tailwind`bg-red-500 px-6 py-3 rounded-lg`}
                >
                    <Text style={tailwind`text-white font-semibold`}>View Live</Text>
                </Pressable>
            </View>
        </View>
    )
}

const renderScore = (item, game) => {
    if (item.status === "not_started") {
        return null;
    }

    if (game?.name === 'football') {
        return (
            <View style={tailwind`items-center`}>
                <Text style={tailwind`ml-2 text-lg font-bold text-black`}>{item.homeScore?.score || '0'}</Text>
                <Text style={tailwind`ml-2 text-lg font-bold text-black`}>{item.awayScore?.score || '0'}</Text>
            </View>
        );
    }

    if (game?.name === 'cricket') {
        return (
            <View style={tailwind`items-center`}>
                {item.homeScore && renderInningScore(item.homeScore)}
                {item.awayScore && renderInningScore(item.awayScore)}
            </View>
        );
    }

    return null;
};

const formatDatePickerToDate = (dateString) => {
    if (!dateString) return new Date();
    // dateString is in format "YYYY/MM/DD"
    const parts = dateString.split('/');
    if (parts.length !== 3) return new Date();
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // months are 0-indexed
    const day = parseInt(parts[2], 10);
    // Create date at midnight local time
    return new Date(year, month, day, 0, 0, 0, 0);
};

// Convert Date object to DatePicker string format (YYYY/MM/DD)
const formatDateToDatePicker = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
};

// Convert Date object to Unix timestamp in SECONDS (for backend)
// This ensures we get the start of the selected day in LOCAL time
const dateToUnixTimestamp = (date) => {
    if (!date) return null;
    const d = new Date(date);
    // Create a new date at midnight LOCAL time for the selected date
    const localMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    return Math.floor(localMidnight.getTime() / 1000);
};

const Matches = () => {
    const navigation = useNavigation();
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [error, setError] = useState({global: null, fields: {}});
    const [loading, setLoading] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [selectedSport, setSelectedSport] = useState({"id": 1, "min_players": 11, "name": "football"});
    const [permissionGranted, setPermissionGranted] = useState(null);
    const dispatch = useDispatch();
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const games = useSelector(state => state.sportReducers.games);
    const game = useSelector(state => state.sportReducers.game);
    const scrollViewRef = useRef(null);

    const matches = useSelector((state) => state.matches.matches)

    useEffect(() => {
        const defaultSport = { id: 1, name: 'football', min_players: 11};
        dispatch(setGame(defaultSport));
    }, [dispatch]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await sportsServices();
                dispatch(setGames(response.data));
            } catch (err) {
                const backendError = err?.response?.data?.error?.fields || {};
                setError({
                    global: "Unable to get all sports",
                    fields: backendError,
                })
                console.error("unable to fetch games data: ", error)
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const today = new Date();
        setSelectedDate(today);
    }, []);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                setLoading(true);
                setError({global: null, fields: {}});
                const authToken = await AsyncStorage.getItem("AccessToken");
                const timestamp = selectedDate;
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getAllMatches`, {
                    params: {
                        start_timestamp: timestamp
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                console.log("Matches Response: ", response.data);

                // Always dispatch matches (even if empty) to clear old data
                if (response.data.success) {
                    dispatch(getMatches(response.data.data || []));
                } else {
                    dispatch(getMatches([]));
                }
            } catch (err) {
                const backendError = err?.response?.data?.error?.fields || {};
                setError({
                    global: "Unable to get matches",
                    fields: backendError,
                })
                console.error("unable to fetch the matchs by date and sport ", err);
                dispatch(getMatches([])); // Clear matches on error
            } finally {
                setLoading(false);
            }
        }
        fetchMatches();
    }, [game, selectedDate, dispatch]);


    const handleSport = useCallback((item) => {
        setSelectedSport(item);
        dispatch(setGame(item));
    }, [game]);

    const scrollRight = () => {
        scrollViewRef.current.scrollTo({x:100, animated:true})
    }

    const handleTournamentPage = (item) => {
        dispatch(getTournamentByIdAction(item));
        navigation.navigate("TournamentPage" , {tournament: item, currentRole: ""})
    }

    const checkSportForMatchPage = (item, game) => {
        if (game.name==='football'){
            navigation.navigate("FootballMatchPage",{matchPublicID: item.public_id} )
        } else if(game.name === 'cricket') {
            navigation.navigate("CricketMatchPage", {matchPublicID: item.public_id})
        }
    }

    const handleLiveMatches = () => {
        const liveMatches = async () => {
            try {
                setLoading(true);
                setError({global: null, fields: {}});
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getLiveMatches`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                console.log("Live Matches Response: ", response.data);

                // Handle different response structures
                const matchesData = response.data?.data || response.data || [];
                dispatch(getMatches(Array.isArray(matchesData) ? matchesData : []));

            } catch (err) {
                const backendError = err?.response?.data?.error?.fields || {};
                setError({
                    global: "Unable to get live matches",
                    fields: backendError,
                })
                console.error("Failed to get live matches: ", err);
                dispatch(getMatches([])); // Clear matches on error
            } finally {
                setLoading(false);
            }
        }
        liveMatches();
    }

    const fetchMatchesByLocation = async (lat, lng) => {
        try {
            setLoading(true);
            setError({global: null, fields: {}});
            const authToken = await AsyncStorage.getItem("AccessToken");
            const timestamp = dateToUnixTimestamp(selectedDate);
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/get-matches-by-location`, {
                params: {
                    start_timestamp: timestamp,
                    latitude: lat,
                    longitude: lng
                },
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log("Matches Response by location: ", response.data);

            // Handle different response structures
            const matchesData = response.data?.data || response.data || [];
            dispatch(getMatches(Array.isArray(matchesData) ? matchesData : []));

        } catch (err) {
            const backendError = err?.response?.data?.error?.fields || {};
            setError({
                global: "Unable to fetch nearby matches",
                fields: backendError,
            })
            console.error("Failed to get the matches by location: ", err);
            dispatch(getMatches([])); // Clear matches on error
        } finally {
            setLoading(false);
        }
    };

    const handleLocation = async () => {
        if (isLoadingLocation) {
            return;
        }

        if (permissionGranted === false) {
            Alert.alert(
                'Location Permission Required',
                'Please enable location permissions in your device settings.'
            );
            return;
        }

        await requestLocationPermission(
            (coords) => {
                setPermissionGranted(true);
                fetchMatchesByLocation(coords.latitude, coords.longitude);
            },
            () => {
                setPermissionGranted(false);
                Alert.alert(
                    'Location Permission Denied',
                    'Location permission is required to find nearby matches.'
                );
            },
            setIsLoadingLocation
        );
    };

    const renderMatchCard = ({ item }) => {
        const isLive = liveStatus.includes(item.status_code);

        return (
            <Pressable
                style={[
                    tailwind`mb-3 bg-white rounded-xl overflow-hidden`,
                    {shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2}
                ]}
                onPress={() => checkSportForMatchPage(item, game)}
            >   

                {/* Tournament Header */}
                <View style={tailwind`bg-gray-50 px-4 py-2 border-b border-gray-100`}>
                    <Text style={tailwind`text-gray-600 text-xs font-semibold`} numberOfLines={1}>
                        {item?.tournament?.name || 'Tournament'}
                    </Text>
                    {/* <MaterialIcons name="right" size={12} color="#6b7280" style={tailwind`ml-1`} /> */}
                </View>

                {/* Match Content */}
                <View style={tailwind`p-4`}>
                    <View style={tailwind`flex-row items-center justify-between`}>
                        {/* Teams */}
                        <View style={tailwind`flex-1`}>
                            {/* Home Team */}
                            <View style={tailwind`flex-row items-center mb-3`}>
                                <View style={tailwind`w-6 h-6 rounded-full bg-gray-100 items-center justify-center overflow-hidden`}>
                                    {item?.homeTeam?.media_url ? (
                                        <Image
                                            source={{ uri: item.homeTeam.media_url }}
                                            style={tailwind`w-full h-full`}
                                        />
                                    ) : (
                                        <Text style={tailwind`text-red-400 font-bold text-md`}>
                                            {item?.homeTeam?.name?.charAt(0).toUpperCase()}
                                        </Text>
                                    )}
                                </View>
                                <Text style={tailwind`text-gray-900 font-semibold ml-3 flex-1`} numberOfLines={1}>
                                    {item?.homeTeam?.name}
                                </Text>
                                {item?.status !== "not_started" && item?.homeScore && (
                                    <Text style={tailwind`text-gray-900 font-bold text-md ml-2`}>
                                        {item.homeScore.goals}
                                        {item.homeScore?.penalty_shootout && (
                                            <Text style={tailwind`text-gray-500 text-md`}> ({item.homeScore.penalty_shootout})</Text>
                                        )}
                                    </Text>
                                )}
                            </View>

                            {/* Away Team */}
                            <View style={tailwind`flex-row items-center`}>
                                <View style={tailwind`w-6 h-6 rounded-full bg-gray-100 items-center justify-center overflow-hidden`}>
                                    {item?.awayTeam?.media_url ? (
                                        <Image
                                            source={{ uri: item.awayTeam.media_url }}
                                            style={tailwind`w-full h-full`}
                                        />
                                    ) : (
                                        <Text style={tailwind`text-red-400 font-bold text-md`}>
                                            {item?.awayTeam?.name?.charAt(0).toUpperCase()}
                                        </Text>
                                    )}
                                </View>
                                <Text style={tailwind`text-gray-900 font-semibold ml-3 flex-1`} numberOfLines={1}>
                                    {item?.awayTeam?.name}
                                </Text>
                                {item?.status !== "not_started" && item?.awayScore && (
                                    <Text style={tailwind`text-gray-900 font-bold text-md ml-2`}>
                                        {item.awayScore.goals}
                                        {item.awayScore?.penalty_shootout && (
                                            <Text style={tailwind`text-gray-500 text-sm`}> ({item.awayScore.penalty_shootout})</Text>
                                        )}
                                    </Text>
                                )}
                            </View>
                        </View>
                        
                        {/* Vertical divider */}
                        <View style={tailwind`w-px bg-gray-100 my-3`} />

                        {/* Match Info */}
                        <View style={tailwind`items-end ml-4`}>
                            <Text style={tailwind`text-gray-600 text-xs font-semibold mb-1`}>
                                {formatToDDMMYY(convertToISOString(item?.start_timestamp))}
                            </Text>
                            {item?.status !== "not_started" ? (
                                <View style={tailwind`px-2 py-1 rounded bg-gray-100`}>
                                    <Text style={tailwind`text-xs font-semibold capitalize`}>
                                        {item?.status_code || item?.status}
                                    </Text>
                                </View>
                            ) : (
                                <Text style={tailwind`text-gray-500 text-xs`}>
                                    {formattedTime(convertToISOString(item?.start_timestamp))}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
        </Pressable>
        )
    };

    if (loading && !matches.length) {
        return (
            <View style={tailwind`flex-1 bg-white justify-center items-center`}>
                <ActivityIndicator size="large" color="#f97316" />
                <Text style={tailwind`mt-4 text-gray-600`}>Loading matches...</Text>
            </View>
        );
    }

    return (
        <View style={tailwind`flex-1 bg-white`}>
            <View style={tailwind`p-4`}>
                <View style={tailwind`flex-row justify-between items-center mb-4`}>
                    <Pressable
                        style={tailwind`flex-row items-center`}
                        onPress={() => setIsDatePickerVisible(true)}
                    >
                        <AntDesign name="calendar" size={25} color="black" />
                        <Text style={tailwind`ml-2 text-base text-black`}>
                            {formattedDate(selectedDate)}
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => {handleLocation()}}
                        style={[
                            tailwind`bg-red-500 rounded-md shadow-md px-3 py-2`,
                            isLoadingLocation && tailwind`opacity-50`
                        ]}
                        disabled={isLoadingLocation}
                    >
                        {isLoadingLocation ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={tailwind`text-white text-sm font-bold`}>Nearby</Text>
                        )}
                    </Pressable>
                    <Pressable
                        onPress={() => handleLiveMatches()}
                        style={tailwind`bg-red-500 rounded-md shadow-md px-3 py-2`}
                    >
                        <Text style={tailwind`text-white text-sm font-bold`}>Live</Text>
                    </Pressable>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    ref={scrollViewRef}
                    contentContainerStyle={tailwind`pb-3`}
                >
                    {games && games?.map((item, index) => (
                        <Pressable
                            key={index}
                            style={[
                                tailwind`border rounded-lg px-4 py-2 mr-2`,
                                selectedSport.name===item.name ? tailwind`bg-orange-400` : tailwind`bg-orange-200`
                            ]}
                            onPress={() => handleSport(item)}
                        >
                            <Text style={tailwind`text-white font-semibold capitalize`}>{item.name}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {error.global && (
                <View style={tailwind`px-4 py-2 bg-red-50`}>
                    <Text style={tailwind`text-red-600 text-center`}>{error.global}</Text>
                </View>
            )}

            {!matches.length && !loading ? (
                <View style={tailwind`flex-1 justify-center items-center p-6`}>
                    <AntDesign name="calendar" size={64} color="#d1d5db" />
                    <Text style={tailwind`text-gray-700 text-xl font-semibold mt-4 text-center`}>
                        No Matches Scheduled
                    </Text>
                    <Text style={tailwind`text-gray-500 text-sm mt-2 text-center`}>
                        No {game?.name} matches found for {formattedDate(selectedDate)}
                    </Text>
                    <Text style={tailwind`text-gray-400 text-xs mt-3 text-center`}>
                        Try selecting a different date or sport, or check Live matches
                    </Text>
                    <View style={tailwind`flex-row gap-3 mt-6`}>
                        <Pressable
                            onPress={() => setIsDatePickerVisible(true)}
                            style={tailwind`bg-orange-400 px-6 py-3 rounded-lg`}
                        >
                            <Text style={tailwind`text-white font-semibold`}>Change Date</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleLiveMatches}
                            style={tailwind`bg-red-500 px-6 py-3 rounded-lg`}
                        >
                            <Text style={tailwind`text-white font-semibold`}>View Live</Text>
                        </Pressable>
                    </View>
                </View>
            ) : (
                <FlatList
                    data={matches}
                    keyExtractor={(item) => item.public_id}
                    renderItem={renderMatchCard}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={tailwind`px-4 pb-4`}
                />
            )}

            {isDatePickerVisible && (
                <Modal
                    visible={isDatePickerVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setIsDatePickerVisible(false)}
                >
                    <Pressable
                        onPress={()=>setIsDatePickerVisible(false)}
                        style={tailwind`flex-1 justify-center p-2 bg-black/50`}
                    >
                        <Pressable onPress={(e) => e.stopPropagation()}>
                            <View style={tailwind`bg-white rounded-lg p-4`}>
                                <DatePicker
                                    date={formatDateToDatePicker(selectedDate)}
                                    mode="calendar"
                                    onDateChange={(dateString) => {
                                        console.log("Date selected from picker: ", dateString);
                                        setSelectedDate(formatDatePickerToDate(dateString));
                                    }}
                                />
                                <Pressable
                                    style={tailwind`mt-4 bg-orange-400 rounded-md p-3`}
                                    onPress={() => setIsDatePickerVisible(false)}
                                >
                                    <Text style={tailwind`text-white text-center font-bold`}>
                                        Confirm
                                    </Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
};

export default Matches;
