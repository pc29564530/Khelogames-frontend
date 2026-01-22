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
import { formatToDDMMYY, formattedDate, formattedTime } from '../utils/FormattedDateTime';
import { convertToISOString } from '../utils/FormattedDateTime';
import { getMatches, getTournamentByIdAction } from '../redux/actions/actions';
import { convertBallToOvers } from '../utils/ConvertBallToOvers';
import Geolocation from '@react-native-community/geolocation';

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

const fomratDateToString = (date) => {
    const selectedDateString = date.toString();
    const selectDate = new Date(selectedDateString.replace(/(\d{4})\/(\d{2})\/(\d{2})/, '$1-$2-$3'));
    return selectDate;
};

const Matches = () => {
    const navigation = useNavigation();
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [error, setError] = useState({global: null, fields: {}});
    const [loading, setLoading] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [locationBuffer, setLocationBuffer] = useState([]);
    const [selectedSport, setSelectedSport] = useState({"id": 1, "min_players": 11, "name": "football"});
    const [permissionGranted, setPermissionGranted] = useState(null);
    const dispatch = useDispatch();
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
        setSelectedDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    }, []);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                setLoading(true);
                setError({global: null, fields: {}});
                const authToken = await AsyncStorage.getItem("AccessToken");
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getAllMatches`, {
                    params: {
                        start_timestamp: formattedDate(selectedDate)
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                if(response.data.success && response.data.data.length === 0) {
                    return emtpyStateUI();
                }
                dispatch(getMatches(response.data.data || []));
            } catch (err) {
                const backendError = err?.response?.data?.error?.fields || {};
                setError({
                    global: "Unable to get matches",
                    fields: backendError,
                })
                console.error("unable to fetch the matchs by date and sport ", err);
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
                const item = response.data;
                dispatch(getMatches(item))
                
            } catch (err) {
                const backendError = err?.response?.data?.error?.fields || {};
                setError({
                    global: "Unable to get matches",
                    fields: backendError,
                })
                console.error("Failed to get live matches: ", err);
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
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/get-matches-by-location`, {
                params: {
                    start_timestamp: fomratDateToString(selectedDate),
                    latitude: lat,
                    longitude: lng
                },
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log("Matches Response by location: ", response.data);
            dispatch(getMatches(response.data || []));
        } catch (err) {
            const backendError = err?.response?.data?.error?.fields || {};
            setError({
                global: "Unable to fetch nearby matches", 
                fields: backendError,
            })
            console.error("Failed to get the matches by location: ", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePositionSuccess = async (position) => {
        console.log("✓ SUCCESS - Position received:", position);

        if (!position || !position.coords) {
            setIsLoadingLocation(false);
            Alert.alert('Location Error', 'Unable to get coordinates');
            return;
        }

        const {latitude, longitude, accuracy} = position.coords;
        console.log("Coordinates:", latitude, longitude, "Accuracy:", accuracy);

        setLocationBuffer(prevBuffer => {
            const newBuffer = [...prevBuffer, {latitude, longitude}];
            if (newBuffer.length > 3) {
                newBuffer.shift();
            }

            if (newBuffer.length >= 3) {
                const avgLat = newBuffer.reduce((sum, p) => sum + p.latitude, 0) / newBuffer.length;
                const avgLng = newBuffer.reduce((sum, p) => sum + p.longitude, 0) / newBuffer.length;
                console.log("Avg location set:", avgLat, avgLng);
                fetchMatchesByLocation(avgLat, avgLng);
            } else {
                console.log("Initial location set:", latitude, longitude);
                fetchMatchesByLocation(latitude, longitude);
            }

            return newBuffer;
        });
    };

    const getCurrentCoordinates = async () => {
        setIsLoadingLocation(true);
        console.log("Getting match location...");

        // First try with high accuracy
        Geolocation.getCurrentPosition(
            (position) => {
                handlePositionSuccess(position);
            },
            (error) => {
                console.error("High accuracy failed:", error);
                // Fallback to lower accuracy
                console.log("Trying with lower accuracy...");
                Geolocation.getCurrentPosition(
                    (position) => {
                        handlePositionSuccess(position);
                    },
                    (finalError) => {
                        console.error("Final geolocation error:", finalError);
                        setIsLoadingLocation(false);
                        Alert.alert(
                            'Location Error',
                            `Unable to get location. Please ensure:\n• GPS is enabled\n• You're in an open area\n• Location services are on\n\nError: ${finalError.message}`
                        );
                    },
                    {
                        enableHighAccuracy: false,
                        timeout: 15000,
                        maximumAge: 10000,
                    }
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 10000,
                distanceFilter: 0,
                forceRequestLocation: true,
                showLocationDialog: true,
            }
        );
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

        console.log("Platform:", Platform.OS);
        if (Platform.OS === "android") {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: 'We need access to your location to find nearby matches.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            console.log("Granted:", granted);
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                setPermissionGranted(true);
                getCurrentCoordinates();
                return true;
            } else {
                setPermissionGranted(false);
                Alert.alert(
                    'Location Permission Denied',
                    'Location permission is required to find nearby matches.'
                );
                return false;
            }
        } else if (Platform.OS === "ios") {
            getCurrentCoordinates();
        }
    };

    const renderMatchCard = ({ item }) => {
        const isLive = liveStatus.includes(item.status_code);

        return (
            <Pressable
                onPress={() => checkSportForMatchPage(item, game)}
                style={tailwind`mb-2 p-3 bg-white rounded-lg shadow-md`}
            >
                <View>
                    <Pressable
                        onPress={() => handleTournamentPage(item?.tournament)}
                        style={tailwind`flex-row justify-between items-center mb-2`}
                    >
                        <Text style={tailwind`text-sm font-semibold`}>{item?.tournament?.name}</Text>
                        <AntDesign name="right" size={12} color="black" />
                    </Pressable>

                    <View style={tailwind`flex-row items-center justify-between`}>
                        <View style={tailwind`flex-row flex-1`}>
                            <View style={tailwind`mr-3`}>
                                <Image
                                    source={{ uri: item.homeTeam?.media_url }}
                                    style={tailwind`w-8 h-8 bg-gray-200 rounded-full mb-2`}
                                />
                                <Image
                                    source={{ uri: item.awayTeam?.media_url }}
                                    style={tailwind`w-8 h-8 bg-gray-200 rounded-full`}
                                />
                            </View>
                            <View style={tailwind`flex-1 justify-center`}>
                                <Text style={tailwind`text-base text-gray-800 mb-1`}>
                                    {item.homeTeam?.name}
                                </Text>
                                <Text style={tailwind`text-base text-gray-800`}>
                                    {item.awayTeam?.name}
                                </Text>
                            </View>
                        </View>

                        <View style={tailwind`flex-row items-center`}>
                            {renderScore(item, game)}

                            <View style={tailwind`w-0.5 h-12 bg-gray-300 mx-3`}/>

                            <View style={tailwind`items-end`}>
                                {isLive && (
                                    <View style={tailwind`bg-red-600 px-2 py-1 rounded mb-1`}>
                                        <Text style={tailwind`text-white text-xs font-bold`}>LIVE</Text>
                                    </View>
                                )}
                                <Text style={tailwind`text-sm text-gray-600`}>
                                    {formatToDDMMYY(convertToISOString(item.start_timestamp))}
                                </Text>
                                {item.status !== "not_started" ? (
                                    <Text style={tailwind`text-sm font-semibold text-gray-800 mt-1`}>
                                        {STATUS_LABELS[item.status_code] || item.status_code}
                                    </Text>
                                ) : (
                                    <Text style={tailwind`text-sm text-gray-600 mt-1`}>
                                        {formattedTime(convertToISOString(item.start_timestamp))}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            </Pressable>
        );
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
                            {formattedDate(fomratDateToString(selectedDate))}
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
                                selectedSport===item ? tailwind`bg-orange-400` : tailwind`bg-orange-200`
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
                        style={tailwind`flex-1 justify-center items-center bg-black/50`}
                    >
                        <View style={tailwind`bg-white rounded-lg p-4 w-4/5`}>
                            <DatePicker
                                date={selectedDate}
                                mode="date"
                                onDateChange={setSelectedDate}
                                onRequestClose={()=> setIsDatePickerVisible(false)}
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
                </Modal>
            )}
        </View>
    );
};

export default Matches;
