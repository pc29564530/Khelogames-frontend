import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Image } from 'react-native';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DatePicker from 'react-native-modern-datepicker';
import { useSelector, useDispatch } from 'react-redux';
import {setGames, setGame } from '../redux/actions/actions';
import { sportsServices } from '../services/sportsServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import { formatToDDMMYY, formattedDate, formattedTime } from '../utils/FormattedDateTime';
import { convertToISOString } from '../utils/FormattedDateTime';
import { getMatches, getTournamentByIdAction } from '../redux/actions/actions';
import { convertBallToOvers } from '../utils/ConvertBallToOvers';

const liveStatus = ['in_progress', 'break', 'half_time', 'penalty_shootout', 'extra_time'];

export const renderInningScore = (scores) => {
    return scores?.map((score, index) => (
      <View key={index} style={tailwind`flex-row ml-2`}>
        <Text style={tailwind`ml-2 text-lg text-gray-800`}>
          {score.score}/{score.wickets}
        </Text>
        {score.is_inning_completed === false && (
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
    const [selectedSport, setSelectedSport] = useState({"id": 1, "min_players": 11, "name": "football"});
    const dispatch = useDispatch();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const games = useSelector(state => state.sportReducers.games);
    const game = useSelector(state => state.sportReducers.game);
    const scrollViewRef = useRef(null);
    const axiosInstance = useAxiosInterceptor();
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
            navigation.navigate("FootballMatchPage",{item: item.id} )
        } else if(game.name === 'cricket') {
            navigation.navigate("CricketMatchPage", {item: item.id})
        }
    }

    const handleLiveMatches = () => {
        const filterMatches = matches.filter((item) => liveStatus.includes(item.status_code));
        dispatch(getMatches(filterMatches));
    }

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
                                                {item.status_code !== "not_started" && checkSport(item, game)}
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
