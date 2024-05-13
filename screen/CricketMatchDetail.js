import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Modal} from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import CheckBox from '@react-native-community/checkbox';



const CricketMatchDetail = ({route}) => {
    const [matchData, setMatchData] = useState({});
    const [isTossed, setIsTossed] = useState(false);
    const axiosInstance = useAxiosInterceptor();
    const [isTossedModalVisible, setIsTossedModalVisible] = useState(false);
    const [tossOption, setTossOption] = useState('');
    const [tossData, setTossData] = useState({});
    const [teamID, setTeamId] = useState('');
    const {matchID, tournamentID} = route.params;
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
            const response = await axiosInstance.post(`${BASE_URL}/addCricketMatchToss`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            });
            setIsTossedModalVisible(false)
        } catch (err) {
            console.error("unable to add the tossed: ", err)
        }
    }

    useEffect (() => {
        const fetchTossData = async () => {
            try {
                const data = {
                    tournament_id: tournamentID,
                    match_id: matchID
                }
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/getCricketMatchToss`, {
                    params: {
                        tournament_id: tournamentID,
                        match_id: matchID
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    }
                });
                console.log("Line no 53: ", response.data)
                const item = response.data || [];
                setTossData(item);
            } catch (err) {
                console.error("unable to get the toss data: ", err);
            }
        }
        fetchTossData()
    }, [])

    useEffect(() => {
        const fetchMatchData = async () => {
            try {
                const matchItem = {
                    match_id: matchID,
                    tournament_id: tournamentID
                }
                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.get(`${BASE_URL}/getMatch`, {
                    params:{
                        match_id: matchID.toString(),
                        tournament_id: tournamentID.toString()
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                const item = response.data || {};
                const responseClubName1 = await axiosInstance.get(`${BASE_URL}/getClub/${item.team1_id}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                const responseClubName2 = await axiosInstance.get(`${BASE_URL}/getClub/${item.team2_id}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                const matchStartTime = new Date(item.start_time)
                if(currentDate >= matchStartTime) {
                    setIsTossed(true);
                }
                setMatchData({...item, clubName1: responseClubName1.data?.club_name, clubName2: responseClubName2.data?.club_name});
                
            } catch (err) {
                console.error("unable to getch the match start time ", err);
            }
        }
        fetchMatchData();
    }, [matchID, tournamentID, matchData.team1_id, matchData.team2_id]);

    const handleModalVisible = () => {
        setIsTossedModalVisible(!isTossedModalVisible)
    }

    const handleTeam = (item) => {
        setTeamId(item)
    }

    const updateTossOption = (item) => {
        setTossOption(item)
    }

    return (
        <View style={tailwind`flex-1 mt-2 p-4`}>
            <View style={tailwind`mb-4`}>
                <Text style={tailwind`text-xl font-bold`}>Update Details</Text>
                <Pressable onPress={handleModalVisible} style={tailwind`bg-blue-500 rounded p-2 mt-2`}>
                    <Text style={tailwind`text-white`}>Toss</Text>
                </Pressable>
            </View>
            <View style={tailwind`bg-gray-200 rounded p-4 mb-4`}>
                <Text style={tailwind`text-lg font-bold`}>Match Information</Text>
                <View style={tailwind`mt-2`}>
                    <Text>Venue: {matchData.venue}</Text>
                </View>
                {isTossed && (
                    <View style={tailwind`mt-2`}>
                        <Text>Toss Win: {tossData.toss_won===matchData.team1_id?matchData.clubName1:matchData.clubName2}</Text>
                        <Text>Toss Decision: {tossData.bat_or_bowl}</Text>
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
                    <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <Text style={tailwind`text-xl`}>Select Team</Text>
                            <View style={tailwind`flex-row justify-between items-center mt-2`}>
                                <Pressable onPress={() => handleTeam(matchData.team1_id)}
                                    style={[tailwind`relative p-2 bg-white items-center justify-center rounded-lg shadow-lg`, teamID===matchData.team1_id && tailwind`bg-orange-200`]}
                                >
                                    <Text style={tailwind`text-xl`}>{matchData.clubName1}</Text>
                                </Pressable>
                                <Pressable onPress={() => handleTeam(matchData.team2_id)} 
                                    style={[tailwind`relative p-2 bg-white items-center justify-center rounded-lg shadow-lg`, teamID===matchData.team2_id && tailwind`bg-orange-200`]}
                                >
                                    <Text style={tailwind`text-xl`}>{matchData.clubName2}</Text>
                                </Pressable>
                            </View>
                            <Text style={tailwind`mt-2 text-xl`}>Choose</Text>
                            <View style={tailwind`flex-row items-center mt-2`}>
                                <CheckBox
                                    value={tossOption === 'Batting'}
                                    onValueChange={() => updateTossOption("Batting")}
                                />
                                <Text style={tailwind`ml-2 text-lg`}>Bat</Text>
                            </View>
                            <View style={tailwind`flex-row items-center mt-2`}>
                                <CheckBox
                                    value={tossOption === 'Bowling'}
                                    onValueChange={() => updateTossOption("Bowling")}
                                />
                                <Text style={tailwind`ml-2 text-lg`}>Bowl</Text>
                            </View>
                            <Pressable onPress={() => addToss()} style={tailwind`bg-blue-500 rounded p-2 mt-4`}>
                                <Text style={tailwind`text-white text-xl text-center`}>Submit</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

export default CricketMatchDetail;