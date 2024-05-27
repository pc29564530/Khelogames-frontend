import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Modal} from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import CheckBox from '@react-native-community/checkbox';
import {useSelector } from 'react-redux';

const CricketMatchDetail = ({route}) => {
    const [matchData, setMatchData] = useState({});
    const [isTossed, setIsTossed] = useState(false);
    const axiosInstance = useAxiosInterceptor();
    const [isTossedModalVisible, setIsTossedModalVisible] = useState(false);
    const [tossOption, setTossOption] = useState('');
    const [tossData, setTossData] = useState({});
    const [teamID, setTeamId] = useState('');
    const {matchID, tournamentID} = route.params;
    const sport = useSelector((state) => state.sportReducers.sport);
    const currentDate = new Date();

    const addToss = async () => {
        try {
            const data = {
                tournament_id: tournamentID,
                match_id: matchID,
                toss_won: teamID,
                bat_or_bowl: tossOption
            }
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post(`${BASE_URL}/${sport}/addCricketMatchToss`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            });
            setIsTossedModalVisible(false);
        } catch (err) {
            console.error("unable to add the toss: ", err);
        }
    }

    useEffect(() => {
        const fetchTossData = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/${sport}/getCricketMatchToss`, {
                    params: {
                        tournament_id: tournamentID,
                        match_id: matchID
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    }
                });
                setTossData(response.data || {});
            } catch (err) {
                console.error("Unable to get the toss data: ", err);
            }
        }
        fetchTossData();
    }, []);

    useEffect(() => {
        const fetchMatchData = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken");
                const response = await axiosInstance.get(`${BASE_URL}/${sport}/getMatch`, {
                    params: {
                        match_id: matchID.toString(),
                        tournament_id: tournamentID.toString()
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    }
                });
                const item = response.data || {};
                const responseClubName1 = await axiosInstance.get(`${BASE_URL}/${sport}/getClub/${item.team1_id}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    }
                });
                const responseClubName2 = await axiosInstance.get(`${BASE_URL}/${sport}/getClub/${item.team2_id}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    }
                });
                const matchStartTime = new Date(item.start_time);
                if (currentDate >= matchStartTime) {
                    setIsTossed(true);
                }
                setMatchData({ ...item, clubName1: responseClubName1.data?.club_name, clubName2: responseClubName2.data?.club_name });
            } catch (err) {
                console.error("unable to fetch the match data: ", err);
            }
        }
        fetchMatchData();
    }, [matchID, tournamentID]);

    const handleModalVisible = () => {
        setIsTossedModalVisible(!isTossedModalVisible);
    }

    const handleTeam = (item) => {
        setTeamId(item);
    }

    const updateTossOption = (item) => {
        setTossOption(item);
    }
    
    return (
        <View style={tailwind`flex-1 mt-2 p-4`}>
            <View style={tailwind`mb-4`}>
                <Text style={tailwind`text-2xl font-bold text-blue-900`}>Update Match Details</Text>
                <Pressable onPress={handleModalVisible} style={tailwind`bg-blue-600 rounded-full p-3 mt-4`}>
                    <Text style={tailwind`text-white text-center text-lg`}>Update Toss</Text>
                </Pressable>
            </View>
            <View style={tailwind`bg-white rounded-lg p-4 mb-4 shadow-lg`}>
                <Text style={tailwind`text-lg font-bold text-blue-900`}>Match Information</Text>
                <View style={tailwind`mt-2`}>
                    <Text style={tailwind`text-gray-700`}>Venue: {matchData.venue}</Text>
                </View>
                {isTossed && (
                    <View style={tailwind`mt-4`}>
                        <Text style={tailwind`text-gray-700`}>Toss Won By: {tossData.toss_won === matchData.team1_id ? matchData.clubName1 : matchData.clubName2}</Text>
                        <Text style={tailwind`text-gray-700`}>Decision: {tossData.bat_or_bowl}</Text>
                    </View>
                )}
            </View>
            {isTossedModalVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isTossedModalVisible}
                    onRequestClose={() => setIsTossedModalVisible(false)}
                >
                    <Pressable onPress={() => setIsTossedModalVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-t-lg p-6`}>
                            <Text style={tailwind`text-xl font-bold text-blue-900 mb-4`}>Select Team for Toss</Text>
                            <View style={tailwind`flex-row justify-between mb-4`}>
                                <Pressable onPress={() => handleTeam(matchData.team1_id)} style={[tailwind`p-4 rounded-full bg-gray-200`, teamID === matchData.team1_id && tailwind`bg-blue-200`]}>
                                    <Text style={tailwind`text-lg text-center text-blue-900`}>{matchData.clubName1}</Text>
                                </Pressable>
                                <Pressable onPress={() => handleTeam(matchData.team2_id)} style={[tailwind`p-4 rounded-full bg-gray-200`, teamID === matchData.team2_id && tailwind`bg-blue-200`]}>
                                    <Text style={tailwind`text-lg text-center text-blue-900`}>{matchData.clubName2}</Text>
                                </Pressable>
                            </View>
                            <Text style={tailwind`text-lg font-bold text-blue-900 mb-2`}>Choose Decision</Text>
                            <View style={tailwind`flex-row items-center mb-2`}>
                                <CheckBox
                                    value={tossOption === 'Batting'}
                                    onValueChange={() => updateTossOption("Batting")}
                                />
                                <Text style={tailwind`ml-2 text-lg text-blue-900`}>Bat</Text>
                            </View>
                            <View style={tailwind`flex-row items-center mb-4`}>
                                <CheckBox
                                    value={tossOption === 'Bowling'}
                                    onValueChange={() => updateTossOption("Bowling")}
                                />
                                <Text style={tailwind`ml-2 text-lg text-blue-900`}>Bowl</Text>
                            </View>
                            <Pressable onPress={addToss} style={tailwind`bg-blue-600 rounded-full p-3`}>
                                <Text style={tailwind`text-white text-center text-lg`}>Submit</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
}

export default CricketMatchDetail;
