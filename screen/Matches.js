import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Image, PermissionsAndroid, Platform, Alert, FlatList, ActivityIndicator } from 'react-native';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DatePicker from 'react-native-modern-datepicker';
import { useSelector, useDispatch } from 'react-redux';
import { setGames, setGame } from '../redux/actions/actions';
import { sportsServices } from '../services/sportsServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import { formatToDDMMYY, formattedDate, formattedTime, convertToISOString, localToUTCTimestamp,  } from '../utils/FormattedDateTime';
import { getMatches, getTournamentByIdAction } from '../redux/actions/actions';
import { convertBallToOvers } from '../utils/ConvertBallToOvers';
import { requestLocationPermission } from '../utils/locationService';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming
} from "react-native-reanimated";
import SportSelector from '../components/SportSelector';
import { MatchesFilterBar } from '../components/FilterBar';

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
        <Text style={[tailwind`ml-2 text-lg`, {color: '#e2e8f0'}]}>
          {score.score}/{score.wickets}
        </Text>
        {score.overs !== undefined && (
            <Text style={[tailwind`ml-2 text-lg`, {color: '#e2e8f0'}]}>({convertBallToOvers(score.overs)})</Text>
        )}
      </View>
    ));
  };

export const emptyStateUI = ({game, selectedDate, setMatchMode, setIsDatePickerVisible}) => {
    return (
        <View style={[tailwind`flex-1 justify-center items-center p-6`, {backgroundColor: '#0f172a'}]}>
            <AntDesign name="calendar" size={64} color="#475569" />
            <Text style={[tailwind`text-xl font-semibold mt-4 text-center`, {color: '#94a3b8'}]}>
                No Matches Scheduled
            </Text>
            <Text style={[tailwind`text-sm mt-2 text-center`, {color: '#64748b'}]}>
                No {game?.name} matches found for {formattedDate(selectedDate)}
            </Text>
            <Text style={[tailwind`text-xs mt-3 text-center`, {color: '#475569'}]}>
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
                    onPress={() => setMatchMode('live')}
                    style={tailwind`bg-red-500 px-6 py-3 rounded-lg`}
                >
                    <Text style={tailwind`text-white font-semibold`}>View Live</Text>
                </Pressable>
            </View>
        </View>
    )
}

export const RenderScore = ({item, game}) => {
        if (game?.name === 'badminton') {
            return (
                <View style={tailwind`items-center`}>
                    <Text style={[tailwind`text-lg font-bold`, {color: '#f1f5f9'}]}>
                        {item ?? 0}
                    </Text>
                </View>
            );
        }
        if (game?.name === 'football') {
            return (
                <View style={tailwind`items-center`}>
                    <Text style={[tailwind`text-lg font-bold`, {color: '#f1f5f9'}]}>
                        {item?.goals ?? 0}
                    </Text>
                    {item?.penalty_shootout && (
                        <Text style={tailwind`text-gray-500 text-md`}> ({item.penalty_shootout})</Text>
                    )}
                </View>
            )
        }
        if (game?.name === 'cricket') {
            return (
                <View style={tailwind`items-center`}>
                    <Text style={[tailwind`text-lg font-bold`, {color: '#f1f5f9'}]}>
                        {renderInningScore(item)}
                    </Text>
                </View>
            )
        }
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

// Convert Date to midnight and return RFC3339 string for backend
const dateToRFC3339Timestamp = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const localMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    return localMidnight.toISOString(); 
};

// Create a Date object at midnight local time for the given date
const toMidnight = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
};

const Matches = () => {
    const navigation = useNavigation();
    const [matchMode, setMatchMode] = useState("date");
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [error, setError] = useState({global: null, fields: {}});
    const [loading, setLoading] = useState(false);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(null);
    const dispatch = useDispatch();

    const [selectedDate, setSelectedDate] = useState(toMidnight(new Date()));
    const games = useSelector(state => state.sportReducers.games);
    const game = useSelector(state => state.sportReducers.game);
    const scrollViewRef = useRef(null);

    const nearbyActive = matchMode === 'nearby';
    const matches = useSelector((state) => state.matches.matches)
    const today = new Date().toISOString().split("T")[0];

    const scrollY = useSharedValue(0);
    const pos = useSharedValue(0);
    const FILTER_HEIGHT = 100;

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            const currentY = event.contentOffset.y;
            if (currentY > scrollY.value + 5) {
                // scrolling down
                if (pos.value === 0) {
                    pos.value = withTiming(-FILTER_HEIGHT, { duration: 250 });
                }
            } else if (currentY < scrollY.value - 5) {
                // scrolling up
                if (pos.value === -FILTER_HEIGHT) {
                    pos.value = withTiming(0, { duration: 250 });
                }
            }
            scrollY.value = currentY;
        },
    });

    const animatedSportAndFilter = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: pos.value }],
        };
    });

    const handlePrevDate = () => {
        setMatchMode('date');
        const date = new Date(selectedDate)
        date.setDate(date.getDate() - 1)
        setSelectedDate(toMidnight(date))
    }

    const handleNextDate = () => {
        setMatchMode('date');
        const date = new Date(selectedDate)
        date.setDate(date.getDate() + 1)
        setSelectedDate(toMidnight(date))
    }

    useEffect(() => {
        const defaultSport = { id: 1, name: 'football', min_players: 11};
        dispatch(setGame(defaultSport));
    }, [dispatch]);

    const fetchMatches = async () => {
        if (!game) return;

        setLoading(true);

        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            let url = "";
            let params = {};

            if (matchMode === "nearby") {
                url = `${BASE_URL}/${game.name}/get-matches-by-location`;

                params = {
                    latitude,
                    longitude,
                    start_timestamp: dateToRFC3339Timestamp(selectedDate),
                };
            }

            else if (matchMode === "live") {
                url = `${BASE_URL}/${game.name}/getLiveMatches`;
            }

            else {
                url = `${BASE_URL}/${game.name}/getAllMatches`;

                params = {
                    start_timestamp: dateToRFC3339Timestamp(selectedDate),
                };
            }

            const response = await axiosInstance.get(url, {
                params,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                }
            });

            dispatch(getMatches(response.data.data || []));

        } catch (err) {
            dispatch(getMatches([]));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, [game, selectedDate, matchMode])

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
        setSelectedDate(toMidnight(new Date()));
    }, []);


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
        } else if (game.name === 'badminton') {
            navigation.navigate("BadmintonMatchPage", {matchPublicID: item.public_id})
        }
    }


    const handleLocation = async () => {
        if (isLoadingLocation) return;

        if (permissionGranted === false) {
            Alert.alert(
                'Location Permission Required',
                'Please enable location permissions in your device settings.'
            );
            return;
        }

        setIsLoadingLocation(true);
        setLoading(true);

        try {
            await requestLocationPermission(
                (coords) => {
                    setLatitude(coords.latitude);
                    setLongitude(coords.longitude);
                    setPermissionGranted(true);
                    setIsLoadingLocation(false);
                    setMatchMode('nearby');
                },
                () => {
                    setPermissionGranted(false);
                    setIsLoadingLocation(false);
                    setLoading(false);
                    Alert.alert(
                        'Location Permission Denied',
                        'Location permission is required to find nearby matches.'
                    );
                },
            );
        } catch (err) {
            setError({
                global: "unable to access location. Please try again.",
                fields: {},
            })
            setIsLoadingLocation(false);
            setLoading(false);
        }
    };

    const renderMatchCard = ({ item }) => {
        const isLive = liveStatus.includes(item.status_code);
        // return null;
        return (
            <Pressable
                style={[
                    tailwind`mb-3 rounded-xl overflow-hidden`,
                    {backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155'}
                ]}
                onPress={() => checkSportForMatchPage(item, game)}
            >

                {/* Tournament Header */}
                <View style={[tailwind`px-4 py-2`, {backgroundColor: '#0f172a', borderBottomWidth: 1, borderBottomColor: '#334155'}]}>
                    <Text style={[tailwind`text-xs font-semibold`, {color: '#94a3b8'}]} numberOfLines={1}>
                        {item?.tournament?.name || 'Tournament'}
                    </Text>
                </View>

                {/* Match Content */}
                <View style={tailwind`p-4`}>
                    <View style={tailwind`flex-row items-center justify-between`}>
                        {/* Teams */}
                        <View style={tailwind`flex-1`}>
                            {/* Home Team */}
                            <View style={tailwind`flex-row items-center mb-3`}>
                                <View style={[tailwind`w-6 h-6 rounded-full items-center justify-center overflow-hidden`, {backgroundColor: '#334155'}]}>
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
                                <Text style={[tailwind`font-semibold ml-3 flex-1`, {color: '#f1f5f9'}]} numberOfLines={1}>
                                    {item?.homeTeam?.name}
                                </Text>
                                    {item?.status_code !== "not_started"  && (
                                        <RenderScore item={item.homeScore} game={game} />
                                    )}
                            </View>

                            {/* Away Team */}
                            <View style={tailwind`flex-row items-center`}>
                                <View style={[tailwind`w-6 h-6 rounded-full items-center justify-center overflow-hidden`, {backgroundColor: '#334155'}]}>
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
                                <Text style={[tailwind`font-semibold ml-3 flex-1`, {color: '#f1f5f9'}]} numberOfLines={1}>
                                    {item?.awayTeam?.name}
                                </Text>
                                {item?.status_code !== "not_started" &&  (
                                    <RenderScore item={item.awayScore} game={game} />
                                )}
                            </View>
                        </View>

                        {/* Vertical divider */}
                        <View style={[tailwind`w-px my-3`, {backgroundColor: '#334155'}]} />

                        {/* Match Info */}
                        <View style={tailwind`items-end ml-4`}>
                            <Text style={[tailwind`text-xs font-semibold mb-1`, {color: '#94a3b8'}]}>
                                {formatToDDMMYY(convertToISOString(item?.start_timestamp))}
                            </Text>
                            {item?.status_code !== "not_started" ? (
                                <View style={[tailwind`px-2 py-1 rounded`, {backgroundColor: '#334155'}]}>
                                    <Text style={[tailwind`text-xs font-semibold capitalize`, {color: '#cbd5e1'}]}>
                                        {item?.status_code || item?.status_code}
                                    </Text>
                                </View>
                            ) : (
                                <Text style={[tailwind`text-xs`, {color: '#64748b'}]}>
                                    {formattedTime(convertToISOString(item?.start_timestamp))}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
        </Pressable>
        )
    };

    return (
        <View style={[tailwind`flex-1`, {backgroundColor: '#0f172a'}]}>
            {/* Sport Selector - SofaScore style */}
            <Animated.View
                style={[
                animatedSportAndFilter,
                {
                    backgroundColor: "#1e293b",
                    borderBottomColor: "#334155",
                    zIndex: 10,
                    shadowColor: "#000",
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 6
                }
                ]}
            >
                <SportSelector />
            </Animated.View>
            <Animated.FlatList
                data={matches}
                keyExtractor={(item) => item.public_id}
                renderItem={renderMatchCard}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <MatchesFilterBar
                        selectedDate={selectedDate}
                        setIsDatePickerVisible={setIsDatePickerVisible}
                        handleLocation={handleLocation}
                        formattedDate={formattedDate}
                        handleNextDate={handleNextDate}
                        handlePrevDate={handlePrevDate}
                        isLoadingLocation={isLoadingLocation}
                        nearbyActive={nearbyActive}
                        setMatchMode={setMatchMode}
                    />
                }
                stickyHeaderIndices={[0]}
                ListEmptyComponent={() => {
                    if (loading) {
                        return (
                            <View style={tailwind`items-center justify-center py-20`}>
                                <ActivityIndicator size="large" color="#f87171" />
                                <Text style={[tailwind`mt-4 text-sm`, {color: '#94a3b8'}]}>
                                    {isLoadingLocation ? 'Finding nearby matches...' : 'Loading matches...'}
                                </Text>
                            </View>
                        );
                    }
                    return emptyStateUI({
                        game,
                        selectedDate,
                        setMatchMode,
                        setIsDatePickerVisible
                    });
                }}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={{
                    paddingBottom: 80
                }}
            />

            {error.global && (
                <View style={[tailwind`px-4 py-2`, {backgroundColor: '#f8717115'}]}>
                    <Text style={tailwind`text-red-400 text-center`}>{error.global}</Text>
                </View>
            )}

            {isDatePickerVisible && (
                <Modal
                    visible={isDatePickerVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setIsDatePickerVisible(false)}
                >
                    <View style={tailwind`flex-1 justify-end bg-black/60`}>
                        <Pressable
                            style={tailwind`flex-1`}
                            onPress={() => setIsDatePickerVisible(false)}
                        />
                        <View
                            style={[
                                tailwind`p-4 rounded-t-3xl`,
                                { backgroundColor: "#0f172a", borderTopWidth: 1, borderColor: "#334155" }
                            ]}
                        >
                            {/* Drag indicator */}
                            <View
                                style={{
                                width: 40,
                                height: 4,
                                backgroundColor: "#475569",
                                borderRadius: 2,
                                alignSelf: "center",
                                marginBottom: 10
                                }}
                            />

                            {/* Header */}
                            <View style={tailwind`flex-row items-center justify-between mb-3`}>
                                <Text style={{ color: "#f1f5f9", fontSize: 18, fontWeight: "700" }}>
                                Select Date
                                </Text>
                            </View>
                            <DatePicker
                                date={formatDateToDatePicker(selectedDate) || today}
                                selected={formatDateToDatePicker(selectedDate)}
                                current={formatDateToDatePicker(selectedDate)} 
                                mode="calendar"
                                onDateChange={(dateString) => {
                                    setSelectedDate(formatDatePickerToDate(dateString));
                                    setIsDatePickerVisible(false);
                                }}
                                options={{
                                    backgroundColor: "#0f172a",
                                    textHeaderColor: "#f87171",
                                    textDefaultColor: "#f1f5f9",
                                    selectedTextColor: "#fff",
                                    mainColor: "#f87171",
                                    textSecondaryColor: "#94a3b8",
                                    borderColor: "#334155",
                                }}
                            />
                            </View>
                    </View>
                 </Modal>
            )}
        </View>
    );
};

export default Matches;
