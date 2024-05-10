import React ,{useState, useEffect} from 'react';
import {View, Text, Pressable, ScrollView, Image} from 'react-native';
import tailwind from 'twrnc';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { getFootballMatches } from '../services/footballMatchServices';

const TournamentFootballMatch = ({ tournament, determineMatchStatus, formattedDate, formattedTime, AsyncStorage, axiosInstance, BASE_URL}) => {
    const [tournamentTeamData, setTournamentTeamData] = useState([]);
    const navigation = useNavigation();
    
    useFocusEffect(
        React.useCallback(() => {
                fetchTournamentMatchs();
        }, [])
    );

    const fetchTournamentMatchs = async () => {
        try {
            const item = await getFootballMatches({axiosInstance: axiosInstance, tournamentId: tournament.tournament_id, tournamentSport: tournament.sport_type});
            const matchData = item?.map(async (item) => {
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

    const handleFootballMatchPage = (item) => {
        navigation.navigate("FootballMatchPage", {matchData:item, determineMatchStatus:determineMatchStatus, formattedDate:formattedDate, formattedTime:formattedTime});
    }

    return (
        <ScrollView>
            <View style={tailwind`p-4`}>
                {tournamentTeamData?.length > 0 ? (
                    tournamentTeamData.map((item, index) => (
                        <Pressable key={index} style={tailwind`mb-1 p-1 bg-white rounded-lg shadow-md flex-row  justify-between`} onPress={() => handleFootballMatchPage(item)}>
                            <View>
                                <View style={tailwind`justify-between items-center mb-1 gap-1 p-1 flex-row`}>
                                    <View style={tailwind`flex-row`}>
                                        <Image source={{ uri: item.team1_avatar_url }} style={tailwind`w-6 h-6 bg-violet-200 rounded-full `} />
                                        <Text style={tailwind`ml-2 text-lg text-gray-800`}>{item.team1_name}</Text>
                                    </View>
                                    {(determineMatchStatus(item) === "Live" || determineMatchStatus(item) === "End") && (
                                        <View>
                                            <Text>{item.team1_score}</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={tailwind`justify-between items-center mb-1 gap-1 p-1 flex-row`}>
                                    <View style={tailwind`flex-row`}>
                                        <Image source={{ uri: item.team1_avatar_url }} style={tailwind`w-6 h-6 bg-violet-200 rounded-full `} />
                                        <Text style={tailwind`ml-2 text-lg text-gray-800`}>{item.team2_name}</Text>
                                    </View>
                                    {(determineMatchStatus(item) === "Live" || determineMatchStatus(item) === "End") && (
                                        <View>
                                            <Text>{item.team2_score}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <View style={tailwind`h-16 items-center justify-center w-0.2 bg-black`}></View>
                            {determineMatchStatus(item) === "Not Started" ? (
                                <View style={tailwind`justify-center items-start`}>
                                    <Text style={tailwind`text-gray-600 items-c`}>{formattedDate(item?.date_on)}</Text>
                                    <Text style={tailwind`text-gray-600`}>{formattedTime(item?.start_time)}</Text>
                                </View>
                            ):(
                                <View style={tailwind`items-center justify-center `}>
                                   <Text style={tailwind`text-gray-600 shadow-lg bg-red-500 p-1 rounded-md`}>{determineMatchStatus(item) === "Live" ? "Live" : "Completed"}</Text>
                                </View>
                            )}
                        </Pressable>
                    ))
                ) : (
                    <Text style={tailwind`text-center mt-4 text-gray-600`}>Loading matches...</Text>
                )}
            </View>
        </ScrollView>
    );
}

export default TournamentFootballMatch;