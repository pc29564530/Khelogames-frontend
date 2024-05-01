import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {Text, View, ScrollView} from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';

const getMember = async (authToken, teamID, axiosInstance) => {
    const teamResponse = await axiosInstance.get(`${BASE_URL}/getClubMember`, {
        params: { club_id: teamID.toString() },
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
    });
    return teamResponse;
}

const CricketTeamSquad = ({route}) => {
    const [team1Player, setTeam1Player] = useState([]);
    const [team2Player, setTeam2Player] = useState([]);
    const axiosInstance = useAxiosInterceptor();    
    const {team1ID, team2ID} = route.params;

    useEffect(() => {
        const fetchTeamPlayer = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const team1Response = await getMember(authToken, team1ID, axiosInstance);
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
                })

                const  team1Data = await Promise.all(team1PlayerNameResponse);

                const team2Response = await getMember(authToken, team2ID, axiosInstance);
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
                const response1 = await axiosInstance.get(`${BASE_URL}/getClub/${team1Data[0].club_id}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                    
                const response2 = await axiosInstance.get(`${BASE_URL}/getClub/${team2Data[0].club_id}`, {
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
            <View style={tailwind`flex-row justify-between items-start`}>
                <View>
                    <Text style={tailwind`text-xl font-bold mb-2`}>{team1Player[team1Player.length - 1]?.clubName}</Text>
                    {renderPlayers(team1Player)}
                </View>
                <View>
                    <Text style={tailwind`text-xl font-bold mb-2`}>{team2Player[team2Player.length - 1]?.clubName}</Text>
                    {renderPlayers(team2Player)}
                </View>
            </View>
        </ScrollView>
    )
}

export default CricketTeamSquad;
