import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState , useEffect} from 'react';
import { View, Text, Pressable } from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';


const FootballLineUp = ({ route }) => {
    const [team1ModalVisible, setTeam1ModalVisible] = useState(true);
    const [team2ModalVisible, setTeam2ModalVisible] = useState(false);
    const [teamPlayer1, setTeamPlayer1] = useState([]);
    const [teamPlayer2, setTeamPlayer2] = useState([]);
    const axiosInstance = useAxiosInterceptor();
   const matchData = route.params.matchData;
    const handleToggle = (team) => {
        if (team === 'team1') {
            setTeam1ModalVisible(true);
            setTeam2ModalVisible(false);
        } else if (team === 'team2') {
            setTeam1ModalVisible(false);
            setTeam2ModalVisible(true);
        }
    };

    useEffect (() => {
        const fetchTeam1Player = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/${matchData.sports}/getClubMember`, {
                    params: {
                        club_id: matchData.team1_id
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                const item = response.data || [];
                setTeamPlayer1(item);
            } catch (err) {
                console.error("unable to get the player: ", err);
            }
        }
        fetchTeam1Player();
    }, []);

    useEffect (() => {
        const fetchTeam2Player = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/${matchData.sports}/getClubMember`, {
                    params: {
                        club_id: matchData.team1_id
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                const item = response.data || [];
                setTeamPlayer2(item);
            } catch (err) {
                console.error("unable to get the player: ", err);
            }
        }
        fetchTeam2Player();
    }, []);

    const renderPlayers = (players) => {
        return (
            <View style={tailwind`ml-4`}>
                {players.map((item, index) => (
                    <View key={index} style={tailwind`mb-2`}>
                        <Text>{item.playerName}</Text>
                    </View>
                ))}
            </View>
        );
    }

    return (
        <ScrollView style={tailwind`flex-1 p-4`}>
            <View style={tailwind`flex-row justify-evenly  items-center ml-2 mr-2 gap-2`}>
                <Pressable style={tailwind` flex-1 mt-2 bg-red-400 shadow-lg p-2 rounded-lg items-center`} onPress={() => handleToggle('team1')}> 
                    <Text style={tailwind`text-xl font-bold mb-2`}>{matchData.team1_name}</Text>
                </Pressable>
                <Pressable style={tailwind` flex-1 mt-2 bg-red-400 shadow-lg p-2 rounded-lg items-center`} onPress={() => handleToggle('team2')}>
                    <Text style={tailwind`text-xl font-bold mb-2`}>{matchData.team2_name}</Text>
                </Pressable>
            </View>
            <View style={tailwind`flex-row justify-between items-start`}>
                {team1ModalVisible && (
                    <View>
                        {renderPlayers(teamPlayer1)}
                    </View>
                )}
                {team2ModalVisible && (
                    <View>
                        {renderPlayers(teamPlayer2)}
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

export default FootballLineUp;
