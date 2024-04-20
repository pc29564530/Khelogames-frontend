import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Pressable, Modal, Image } from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import CreateFixtue from '../components/CreateFixture';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ScrollView } from 'react-native-gesture-handler';

const currentTime = new Date();

const TournamentMatches = ({ route }) => {
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
                    setOrganizerID(item.organizer_id);
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
            const matchData = item.map(async (item) => {
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
                    const response3 = await axiosInstance.get(`${BASE_URL}/getTournament/${item.tournament_id}`, null, {
                        headers: {
                            'Authorization': `bearer ${authToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    const response4 = await axiosInstance.get(`${BASE_URL}/getFootballMatchScore`, {
                        params:{
                            match_id: item.match_id,
                            team_id: item.team1_id
                        },
                        headers: {
                            'Authorization': `bearer ${authToken}`,
                            'Content-Type': 'application/json'
                        }
                    })

                    const response5 = await axiosInstance.get(`${BASE_URL}/getFootballMatchScore`, {
                        params:{
                            match_id: item.match_id,
                            team_id: item.team2_id
                        },
                        headers: {
                            'Authorization': `bearer ${authToken}`,
                            'Content-Type': 'application/json'
                        }
                    })

                    return { ...item, team1_name: response1.data.club_name, team2_name: response2.data.club_name, tournament_name: response3.data.tournament_name, team1_score: response4.data.goal_score?response4.data.goal_score:0, team2_score: response5.data.goal_score?response5.data.goal_score:0 };
                } catch (err) {
                    console.error("Unable to fetch club data: ", err);
                }
            });
            const allMatchData = await Promise.all(matchData);
            setTournamentTeamData(allMatchData);
        } catch (err) {
            console.error("Unable to fetch tournament matches: ", err);
        }
    };

    const handleCloseFixtureModal = () => {
        setIsModalVisible(!isModalVisible);
    }
    
    const determineMatchStatus = (item) => {
        startTimeStr = item.start_time;
        endTimeStr = item.end_time;
        const [datePart, timePart] = startTimeStr.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute, second] = timePart.slice(0,-1).split(':').map(Number);
        const matchStartDateTime = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

        const [datePartEnd, timePartEnd] = endTimeStr.split('T');
        const [yearEnd, monthEnd, dayEnd] = datePartEnd.split('-').map(Number);
        const [hourEnd, minuteEnd, secondEnd] = timePartEnd.slice(0,-1).split(':').map(Number);
        const matchEndDateTime = new Date(Date.UTC(yearEnd, monthEnd - 1, dayEnd, hourEnd, minuteEnd, secondEnd));


        const currentDateTime = new Date();
        const localDate = new Date(currentDateTime.getTime()-currentDateTime.getTimezoneOffset()*60*1000)
        if (isNaN(matchStartDateTime) || isNaN(matchEndDateTime)) {
            console.error("date time format error")
            return "";
        }
    
        let status;
        if (localDate < matchStartDateTime ) {
            status = "Not Started";
        } else if (localDate > matchEndDateTime) {
            status = "End";
        } else {
            status = "Live";
        }
        return status;
    };
    
    const formattedDate = (item) => {
        const timestampStrDate = item;
        const timestampDate = new Date(timestampStrDate);
        const optionsDate = { weekday: 'long', month: 'long', day: '2-digit' };
        const formattedDate = timestampDate.toLocaleDateString('en-US', optionsDate);
        return formattedDate;
    }
    

    const formattedTime = (item) => {
        const timestampStr = item;
        const [datePart, timePart] = timestampStr.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
        let adjustedHour = hour;
        if (adjustedHour > 12) {
            adjustedHour = adjustedHour%12;
        } else if (adjustedHour < 12) {
            adjustedHour = adjustedHour;
        }
        const period = hour < 12 ? 'AM' : 'PM';
        const formattedTime = `${adjustedHour}:${minute < 10 ? '0' + minute : minute} ${period}`;
        return formattedTime;
    }

    return (
        <ScrollView 
            contentContainerStyle={{flexGrow:1}}
            nestedScrollEnabled={true}
        >
        <View style={tailwind`flex-1 bg-gray-100`}>
            <View style={tailwind`p-4 flex-row justify-between items-center bg-white`}>
                <Text style={tailwind`text-xl font-bold text-gray-800`}>{tournament.name}</Text>
                {admin && (
                    <Pressable onPress={() => setIsModalVisible(!isModalVisible)} style={tailwind`rounded-lg bg-purple-200 p-2 justify-start flex-row items-center`}>
                        <Text style={tailwind`text-lg text-purple-800`}>Set Fixture</Text>
                        <MaterialIcons name="add" size={24} color="black" />
                    </Pressable>
                )}
            </View>
            {isModalVisible && (
                <Modal transparent={true} animationType='slide' visible={isModalVisible} onRequestClose={handleCloseFixtureModal}>
                    <View style={tailwind`flex-1 justify-center bg-black bg-opacity-50`}>
                        <CreateFixtue
                            tournament={tournament}
                            teams={teams}
                            organizerID={organizerID}
                            handleCloseFixtureModal={handleCloseFixtureModal}
                        />
                    </View>
                </Modal>
            )}
            <View style={tailwind`p-4`}>
                {tournamentTeamData?.length > 0 ? (
                    tournamentTeamData.map((item, index) => (
                        <Pressable key={index} style={tailwind`mb-4 p-4 bg-white rounded-lg shadow-md`}>
                            <View style={tailwind`flex-row justify-between items-center mb-2 gap-2 p-2`}>
                                <View style={tailwind`items-center`}>
                                    <Image source={{ uri: item.team1_avatar_url }} style={tailwind`w-10 h-10 bg-violet-200 rounded-full `} />
                                    <Text style={tailwind`ml-2 text-xl font-semibold text-gray-800`}>{item.team1_name}</Text>
                                </View>
                                {(determineMatchStatus(item) === "Live" || determineMatchStatus(item) === "End") && (
                                    <View>
                                        <Text>{item.team1_score}</Text>
                                    </View>
                                )}
                                <Text style={tailwind`text-gray-600 text-lg`}>vs</Text>
                                {(determineMatchStatus(item) === "Live" || determineMatchStatus(item) === "End") && (
                                    <View>
                                        <Text>{item.team2_score}</Text>
                                    </View>
                                )}
                                
                                <View style={tailwind` items-center`}>
                                    <Image source={{ uri: item.team2_avatar_url }} style={tailwind`w-10 h-10 bg-violet-200 rounded-full`} />
                                    <Text style={tailwind`ml-2 text-xl font-semibold text-gray-800`}>{item.team2_name}</Text>
                                </View>
                            </View>
                            {determineMatchStatus(item) === "Not Started" ? (
                                <View style={tailwind`flex-row justify-between`}>
                                    <Text style={tailwind`text-gray-600`}>{formattedDate(item.date_on)}</Text>
                                    <Text style={tailwind`text-gray-600`}>{formattedTime(item.start_time)}</Text>
                                </View>
                            ):(
                                <View style={tailwind`items-center -mt-2`}>
                                   <Text style={tailwind`text-gray-600 shadow-lg bg-red-500 p-1 rounded-md`}>{determineMatchStatus(item) === "Live" ? "Live" : "Ended"}</Text>
                                </View>
                            )}
                            
                            
                        </Pressable>
                    ))
                ) : (
                    <Text style={tailwind`text-center mt-4 text-gray-600`}>Loading matches...</Text>
                )}
            </View>
        </View>
        </ScrollView>
    );
};

export default TournamentMatches;
