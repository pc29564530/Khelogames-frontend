import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, Text, Pressable, Modal} from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import CreateFixtue from '../components/CreateFixture';
import { useFocusEffect } from '@react-navigation/native';

const TournamentMatches = ({route}) => {
    const tournament = route.params.tournament;
    const [teams, setTeams] = useState([]);
    const [admin, setAdmin] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [tournamentTeamData, setTournamentTeamData] = useState([]);
    const [organizerID, setOrganizerID] = useState(null);

    const axiosInstance = useAxiosInterceptor();

    useEffect(() => {
        fetchTournamentOrganizer();
    }, []);

    useEffect(() => {
        if (admin) {
            fetchTournamentTeams();
        }
    }, [admin]);

    useFocusEffect(
        React.useCallback(() => {
            if (admin) {
                fetchTournamentMatchs();
            }
        }, [admin])
    );

    const fetchTournamentOrganizer = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const user = await AsyncStorage.getItem('User');
            const response = await axiosInstance.get(`${BASE_URL}/getOrganizer/${tournament.tournament_id}`, null, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const item = response.data;

            item.forEach(item => {
                if (item.organizer_name.toLowerCase() === user.toLowerCase()) {
                    setAdmin(true);
                    setOrganizerID(item.organizer_id)
                }
            });
        } catch (err) {
            console.log("Unable to fetch the organizer: ", err);
        }
    };

    const fetchTournamentTeams = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getTeams/${tournament.tournament_id}`, null, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            setTeams(response.data);
        } catch (err) {
            console.error("Unable to fetch teams: ", err);
        }
    };

    const fetchTournamentMatchs = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getAllTournamentMatch`, {
                params: {
                    tournament_id: tournament.tournament_id,
                    sports: tournament.sport_type
                },
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const item = response.data;
            const allMatchData = await Promise.all(item.map(async (item) => {
                try {
                    const authToken = await AsyncStorage.getItem('AccessToken');
                    const response1 = await axiosInstance.get(`${BASE_URL}/getClub/${item.team1_id}`, null, {
                        headers: {
                            'Authorization': `bearer ${authToken}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    const response2 = await axiosInstance.get(`${BASE_URL}/getClub/${item.team2_id}`, null, {
                        headers: {
                            'Authorization': `bearer ${authToken}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    return {...item, team1_name: response1.data.club_name, team2_name: response2.data.club_name};
                } catch (err) {
                    console.error("Unable to fetch club data: ", err);
                }
            }));
            setTournamentTeamData(allMatchData);
        } catch (err) {
            console.error("Unable to fetch tournament matches: ", err);
        }
    };

    return (
        <View style={tailwind`flex-1 mt-1 items-center justify-center`}>
           {admin && (
                <Pressable onPress={() => setIsModalVisible(!isModalVisible)} style={tailwind`rounded-lg bg-purple-200 mt-10 p-2`}>
                    <Text style={tailwind`text-lg`}>Set Fixture</Text>
                </Pressable>
           )}
           
           {isModalVisible && (
                <Modal transparent={true} animationType='slide' visible={isModalVisible}>
                    <View style={tailwind`flex-1 justify-center bg-black bg-opacity-50`}>
                        <CreateFixtue 
                            tournament={tournament}
                            teams={teams}
                            organizerID={organizerID}
                        />
                    </View>
                </Modal>
           )}
            <View>
            {tournamentTeamData?.length > 0 ? (
                tournamentTeamData.map((item, index) => (
                    <Pressable key={index} style={tailwind`mt-4 rounded-lg bg-purple-300 p-4 flex-row items-center justify-evenly`}>
                        <Text style={tailwind`text-xl`}>{item.team1_name}</Text>
                        <Text style={tailwind`text-xl`}>vs</Text>
                        <Text style={tailwind`text-xl`}>{item.team2_name}</Text>
                    </Pressable>
                ))
            ) : (
                <Text>Loading matches...</Text>
            )}
            </View>
        </View>
    );
}

export default TournamentMatches;
