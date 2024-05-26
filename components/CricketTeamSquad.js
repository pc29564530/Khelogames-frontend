import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {Text, View, ScrollView, Pressable} from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import { useSelector } from 'react-redux';

const getMember = async (authToken, teamID, axiosInstance, sport) => {
    try {
        const teamResponse = await axiosInstance.get(`${BASE_URL}/${sport}/getClubMember`, {
            params: { club_id: teamID.toString() },
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });
        return teamResponse;
    } catch (err) {
        console.error("unable to fetch team member ", err);
    }
}

const CricketTeamSquad = ({route}) => {
    const [team1Player, setTeam1Player] = useState([]);
    const [team2Player, setTeam2Player] = useState([]);
    const [team1ModalVisible, setTeam1ModalVisible] = useState(true);
    const [team2ModalVisible, setTeam2ModalVisible] = useState(false);
    const axiosInstance = useAxiosInterceptor();    
    const {team1ID, team2ID} = route.params;
    const sport = useSelector((state) => state.sportReducers.sport);

    const handleToggle = (team) => {
        if (team === 'team1') {
            setTeam1ModalVisible(true);
            setTeam2ModalVisible(false);
        } else if (team === 'team2') {
            setTeam1ModalVisible(false);
            setTeam2ModalVisible(true);
        }
    };

    useEffect(() => {
        const fetchTeamPlayer = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const team1Response = await getMember(authToken, team1ID, axiosInstance, sport);
                const team1PlayerNameResponse = team1Response.data.map(async (item, index) => {
                    const response = await axiosInstance.get(`${BASE_URL}/getPlayerProfile`, {
                        params:{
                            player_id: item.player_id
                        },
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    return {...item, playerName: response.data.player_name}
                });
                const  team1Data = await Promise.all(team1PlayerNameResponse);

                const team2Response = await getMember(authToken, team2ID, axiosInstance, sport);
                const team2PlayerNameResponse = team2Response.data.map(async (item, index) => {
                    const response = await axiosInstance.get(`${BASE_URL}/getPlayerProfile`, {
                        params:{
                            player_id: item.player_id
                        },
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    return {...item, playerName: response.data.player_name}
                })
                const  team2Data = await Promise.all(team2PlayerNameResponse);

                const response1 = await axiosInstance.get(`${BASE_URL}/${sport}/getClub/${team1ID}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                    
                const response2 = await axiosInstance.get(`${BASE_URL}/${sport}/getClub/${team2ID}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                setTeam1Player([...team1Data, {clubName: response1.data.club_name}]);
                setTeam2Player([...team2Data, {clubName: response2.data.club_name}]);

            } catch (err) {
                console.error("unable to fetch the team player: ", err);
            }
        }
        fetchTeamPlayer();
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
                    <Text style={tailwind`text-xl font-bold mb-2`}>{team1Player[team1Player.length - 1]?.clubName}</Text>
                </Pressable>
                <Pressable style={tailwind` flex-1 mt-2 bg-red-400 shadow-lg p-2 rounded-lg items-center`} onPress={() => handleToggle('team2')}>
                    <Text style={tailwind`text-xl font-bold mb-2`}>{team2Player[team2Player.length - 1]?.clubName}</Text>
                </Pressable>
            </View>
            <View style={tailwind`flex-row justify-between items-start`}>
                {team1ModalVisible && (
                    <View>
                        <Text style={tailwind`text-xl font-bold mb-2`}>{team1Player[team1Player.length - 1]?.clubName}</Text>
                        {renderPlayers(team1Player)}
                    </View>
                )}
                {team2ModalVisible && (
                    <View>
                        <Text style={tailwind`text-xl font-bold mb-2`}>{team2Player[team2Player.length - 1]?.clubName}</Text>
                        {renderPlayers(team2Player)}
                    </View>
                )}
            </View>
        </ScrollView>
    )
}

export default CricketTeamSquad;
