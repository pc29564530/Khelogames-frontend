import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Image, PermissionsAndroid, Platform, Alert } from 'react-native';
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

const checkSport = (item, game) => {
    if (game?.name === 'football') {
        return (
            <View style={tailwind`items-center`}>
                <Text style={tailwind`ml-2 text-lg text-black`}>{item.homeScore?.score || '0'}</Text>
                <Text style={tailwind`ml-2 text-lg text-black`}>{item.awayScore?.score || '0'}</Text>
            </View>
        );
    } else if (game?.name === 'cricket') {
        return (
            <View style={tailwind`items-center justify-center flex-row right-4`}>
                    <View style={tailwind`mb-2 flex-row`}>
                        
                        {item.status_code !== "not_started" && (
                            <View>
                            <View style={tailwind``}>
                                {item.homeScore && (
                                    <View style={tailwind``}>
                                        {renderInningScore(item.homeScore)}
                                    </View>
                                )}
                                {item.awayScore && (
                                    <View style={tailwind``}>
                                        {renderInningScore(item.awayScore)}
                                    </View>
                                )}
                            </View>
                            </View>
                        )}
                    </View>
                </View>
        );
    }
};

const fomratDateToString = (date) => {
    const selectedDateString = date.toString();
    const selectDate = new Date(selectedDateString.replace(/(\d{4})\/(\d{2})\/(\d{2})/, '$1-$2-$3'));
    return selectDate;
};

const Matches = () => {
    const navigation = useNavigation();
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [locationBuffer, setLocationBuffer] = useState([]);
    const [selectedSport, setSelectedSport] = useState({"id": 1, "min_players": 11, "name": "football"});
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
                const data = await sportsServices({axiosInstance});
                dispatch(setGames(data));
            } catch (error) {
                console.error("unable to fetch games data: ", error)
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
                const authToken = await AsyncStorage.getItem("AccessToken");
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getAllMatches`, {
                    params: {
                        start_timestamp: fomratDateToString(selectedDate)
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                dispatch(getMatches(response.data || []));
            } catch (err) {
                console.error("unable to fetch the matchs by date and sport ", err);
            }
        }
        fetchMatches();
    }, [game, selectedDate, dispatch, axiosInstance]);


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
                console.error("Failed to get live matches: ", err);
            }
        }
        liveMatches();
    }

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
                enableHighAccuracy: false, // Lower accuracy = faster
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

        try {
            const authToken = await AsyncStorage.getItem("AccessToken")
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/get-matches-by-location`, {
                params: {
                    start_timestamp: fomratDateToString(selectedDate),
                    latitude: latitude,
                    longitude: longitude
                },
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log("Matches Response by location: ", response.data)
        } catch (err) {
            console.error("Failed to get the matches by location: ", err)
        }
    };

    const handlePositionSuccess = (position) => {
        console.log("✓ SUCCESS - Position received:", position);

        if (!position || !position.coords) {
        setIsLoadingLocation(false);
        Alert.alert('Location Error', 'Unable to get coordinates');
        return;
        }

        const {latitude, longitude, accuracy} = position.coords;
        console.log("Coordinates:", latitude, longitude, "Accuracy:", accuracy);
        // reverseGeocode(latitude, longitude)

        setLocationBuffer(prevBuffer => {
        const newBuffer = [...prevBuffer, {latitude, longitude}];
        if (newBuffer.length > 3) {
            newBuffer.shift();
        }

        if (newBuffer.length >= 3) {
            const avgLat = newBuffer.reduce((sum, p) => sum + p.latitude, 0) / newBuffer.length;
            const avgLng = newBuffer.reduce((sum, p) => sum + p.longitude, 0) / newBuffer.length;
            setLatitude(avgLat);
            setLongitude(avgLng);
            console.log("Avg location set:", avgLat, avgLng);
            setIsLoadingLocation(false);
        } else {
            setLatitude(latitude);
            setLongitude(longitude);
            console.log("Initial location set:", latitude, longitude);
            setIsLoadingLocation(false);
        }

        return newBuffer;
        });
    };

    const handleLocation = async () => {
        console.log("Platform:", Platform.OS);
        if (Platform.OS === "android") {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: 'We need access to your location to set the team location.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            console.log("Granted:", granted);
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                getCurrentCoordinates();
                return true;
            } else {
                Alert.alert(
                    'Location Permission Denied',
                    'You can still create a team without location.'
                );
                return false;
            }
        } else if (Platform.OS === "ios") {
            getCurrentCoordinates();
        }
    };

    return (
        <View style={tailwind`flex-1 bg-white p-4`}>
            <ScrollView nestedScrollEnabled={true} vertical showsVerticalScrollIndicator={false}>
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
                <Pressable onPress={() => {handleLocation()}} style={tailwind`bg-red-500 rounded-md shadow-md p-2`}>
                    <Text style={tailwind`text-white text-lg font-bold`}>Nearby</Text>
                </Pressable>
                <Pressable onPress={() => handleLiveMatches()} style={tailwind`bg-red-500 rounded-md shadow-md p-2`}>
                    <Text style={tailwind`text-white text-lg font-bold`}>Live</Text>
                </Pressable>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                ref={scrollViewRef}
                contentContainerStyle={tailwind`flex-row flex-wrap justify-center`}   
            >
                {games && games?.map((item, index) => (
                    <Pressable key={index} style={[tailwind`border rounded-lg bg-blue-500 p-2 mr-2 ml-2`, selectedSport===item?tailwind`bg-orange-400`:tailwind`bg-orange-200`]} onPress={() => handleSport(item)}>
                        <Text style={tailwind`text-white`}>{item.name}</Text>
                    </Pressable>
                ))}
            </ScrollView>
                <View>
                    {matches?.map((item, index) => (
                        <Pressable key={index}  onPress={() => checkSportForMatchPage(item, game)}
                        style={tailwind`mb-1 p-1 bg-white rounded-lg shadow-md`}
                        >
                            <View>
                                <Pressable onPress={() => handleTournamentPage(item?.tournament)} style={tailwind`p-1 flex flex-row justify-between`}>
                                    <Text style={tailwind`text-6md`}>{item?.tournament?.name}</Text>
                                    <AntDesign name="right" size={12} color="black" />
                                </Pressable>
                                <View style={tailwind`flex-row items-center justify-between `}>
                                    <View style={tailwind`flex-row`}>
                                        <View style={tailwind``}>
                                            <Image 
                                                source={{ uri: item.awayTeam?.media_url }} 
                                                style={tailwind`w-6 h-6 bg-violet-200 rounded-full mb-2`} 
                                            />
                                            <Image 
                                                source={{ uri: item.homeTeam?.media_url }} 
                                                style={tailwind`w-6 h-6 bg-violet-200 rounded-full mb-2`} 
                                            />
                                        </View>
                                        <View style={tailwind``}>
                                            <Text style={tailwind`ml-2 text-lg text-gray-800`}>
                                                {item.homeTeam?.name}
                                            </Text>
                                            <Text style={tailwind`ml-2 text-lg text-gray-800`}>
                                                {item.awayTeam?.name}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={tailwind`items-center justify-center flex-row`}>
                                        <View style={tailwind`mb-2 flex-row items-center gap-4`}>
                                                {item.status !== "not_started" && (
                                                    <View>
                                                    <View style={tailwind``}>
                                                        {item?.scores?.homeScore  && checkSport(item, game) && (
                                                            <View style={tailwind``}>
                                                                {renderInningScore(item.scores.homeScore)}
                                                            </View>
                                                        )}
                                                        {item?.scores?.awayScore && (
                                                            <View style={tailwind``}>
                                                                {renderInningScore(item.scores.awayScore)}
                                                            </View>
                                                        )}
                                                    </View>
                                                    </View>
                                                )}
                                                <View style={tailwind`w-0.5 h-10 bg-gray-200`}/>
                                                <View style={tailwind`mb-2 right`}>
                                                    <Text style={tailwind`ml-2 text-lg text-gray-800`}> {formatToDDMMYY(convertToISOString(item.start_timestamp))}</Text>
                                                    {item.status !== "not_started" ? (
                                                        <Text style={tailwind`ml-2 text-md text-gray-800`}>{item.status_code}</Text>
                                                    ):(
                                                        <Text style={tailwind`ml-2 text-lg text-gray-800`}>{formattedTime(convertToISOString(item.start_timestamp))}</Text>
                                                    )}
                                                </View>
                                        </View>
                                    </View> 
                                </View>
                            </View>
                    </Pressable>
                    ))}
                </View>
                {isDatePickerVisible && (
                    <Modal
                        visible={isDatePickerVisible}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setIsDatePickerVisible(false)}
                    >
                        <Pressable onPress={()=>setIsDatePickerVisible(false)} style={tailwind`flex-1 justify-center items-center bg-black/50`}>
                            <View style={tailwind`bg-white rounded-lg p-4 w-4/5`}>
                            <DatePicker
                            date={selectedDate}
                            mode="date"
                            onDateChange={setSelectedDate}
                            onRequestClose={()=> setIsDatePickerVisible(false)}
                        />
                        <Pressable
                            style={tailwind`mt-4 bg-orange-200 rounded-md p-2`}
                            onPress={() => setIsDatePickerVisible(false)}
                        >
                            <Text style={tailwind`text-black text-center font-bold`}>
                                Confirm
                            </Text>
                        </Pressable>
                            </View>
                        </Pressable>
                    </Modal>
                )}
            </ScrollView>
        </View>
    );
};

export default Matches;
