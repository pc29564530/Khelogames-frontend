import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import {View, Text, Pressable, Modal} from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import DateTimePicker from 'react-native-modern-datepicker';
import  MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ScrollView } from 'react-native-gesture-handler';

const AddFootballPlayerScore = ({route}) => {
    const [team, setTeam] = useState('');
    const [playerModalVisible, setPlayerModalVisible] = useState(false);
    const [players, setPlayers] = useState([]);
    const [playerId, setPlayerId] = useState('');
    const [teamId, setTeamId] = useState('');
    const [isModalTimeVisible, setIsModalTimeVisible] = useState(false);
    const [goalScoreTime, setGoalScoreTime] = useState(new Date());
    const axiosInstance = useAxiosInterceptor();

    const matchData = route.params.matchData;

    useEffect(()=> {
        const fetchPlayerProfile = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/getClubMember`, {
                    params: teamId,
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                const item = response.data || [];
                setPlayers(item)
            } catch (err) {
                console.error("unable to get the player profile: ", err);
            }
        }
        
        fetchPlayerProfile();
    }, []);

    const handleAddGoalPlayer = async (item) => {
        try {
            const data = {
                match_id: matchData.match_id,
                team_id: teamId,
                player_id: playerId,
                tournament_id: matchData.tournament_id,
                goal_score_time: goalScoreTime
            }
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/addFootballGoalByPlayer`,data,  {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const item = response.data || [];
            setPlayers(item)

        } catch (err) {
            console.error("unable to add the goal by player: ", err);
        }
    }

    console.log("Line no 67: ", players)
    return (
        <View style={tailwind`flex-1 mt-2`}>
            <View style={tailwind`rounded-lg p-2 shadow-sm bg-white`}>
                <Text>Select Team</Text>
                <View style={tailwind`flex-row`}>
                    <Pressable style={[tailwind`shadow-lg p-6 rounded-lg`, team === matchData.team1_name?tailwind`bg-gray-200`:null]} onPress={() => setTeam(matchData.team1_id)}>
                        <Text>{matchData.team1_name}</Text>
                    </Pressable>   
                    <Pressable style={[tailwind`shadow-lg p-6 rounded-lg`, team === matchData.team1_name?tailwind`bg-gray-200`:null]} onPress={() => setTeam(matchData.team2_id)}>
                        <Text>{matchData.team2_name}</Text>
                    </Pressable>
                </View>
            </View>
                <Pressable onPress={() => setIsModalTimeVisible(!isModalTimeVisible)} style={tailwind`mb-2`}>
                    <MaterialIcons name="date-range" size={24} color="black" />
                </Pressable>
                <Pressable style={tailwind`shadow-lg p-6 rounded-lg mb-2`} onPress={() => setPlayerModalVisible(!playerModalVisible)}>
                    <Text> Select Player</Text>
                </Pressable>
                <Pressable onPress={() => handleAddGoalPlayer()}>
                    <Text>Submit</Text>
                </Pressable>
                {playerModalVisible && (
                    <Modal
                        transparent={true}
                        animationType="slide"
                        visible={playerModalVisible}
                        onRequestClose={() => setPlayerModalVisible(false)}
                    >
                         <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                            <View style={tailwind`bg-white rounded-lg m-4`}>
                                {players.map((item, index) => (
                                    <Pressable key={index} onPress={() => setPlayerId(item.id)}> 
                                        <Text>{item.player_name}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </Modal>
                )}
                {isModalTimeVisible && (
                    <Modal
                        transparent={true}
                        animationType="slide"
                        visible={isModalTimeVisible}
                        onRequestClose={() => setIsModalTimeVisible(false)}
                    >
                        <ScrollView
                            contentContainerStyle={tailwind`flex-grow`}
                            style={tailwind`flex-1`}
                            onTouchEnd={(event) => {
                                const swipeDistance = 50;
                                const swipeThresold = 20;
                                const touchY = event.nativeEvent.pageY;
                                const touchStartY = touchY-event.nativeEvent.locationY;
                                if(touchY-touchStartY>swipeDistance){
                                    if(touchY-touchStartY > swipeThresold) {
                                        setIsModalTimeVisible(false)
                                    }
                                }
                            }}
                        >
                            <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                                <View style={tailwind`bg-white rounded-md p-4`}>
                                    <DateTimePicker
                                        onSelectedChange={(goalScoreTime) => {
                                            setGoalScoreTime(goalScoreTime);
                                            setIsModalTimeVisible(false);
                                        }}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                        
                    </Modal>
                )}
        </View>
    );
}

export default AddFootballPlayerScore;