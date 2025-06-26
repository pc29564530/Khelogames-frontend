import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Modal, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import AddFootballModalIncident from '../components/AddFootballModalIncidents';
import IncidentCheck from '../components/IncidentsCheck';

// change the code so that when no incident is done it does not show the header

const FootballIncidents = ({ route }) => {
    const [incidentModalVisible, setIncidentModalVisible] = useState(false);
    const [incidents, setIncidents] = useState([]);
    const [homePlayer, setHomePlayer] = useState([]);
    const [awayPlayer, setAwayPlayer] = useState([]);
    const [homeSquad, setHomeSquad] = useState([]);
    const [awaySquad, setAwaySquad] = useState([]);
    const [penaltyH, setPenaltyH] = useState([]);
    const [penaltyA, setPenaltyA] = useState([]);
    const [loading, setLoading] = useState(true);
    const matchData = route.params.matchData;
    const axiosInstance = useAxiosInterceptor();

    useEffect(() => {
        const fetchHSquad = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getFootballMatchSquad`, {
                    params: {
                        'match_id':match.id.toString(),
                        'team_id': match.home_team_id.toString()
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                setAwaySquad(response.data || [])
            } catch (err) {
                console.error("failed to fetch football lineup: ", err);
            }
        }
        const fetchASquad = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getFootballMatchSquad`, {
                    params: {
                        'match_id':match.id.toString(),
                        'team_id': match.away_team_id.toString()
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                setAwaySquad(response.data || [])
            } catch (err) {
                console.error("failed to fetch football lineup: ", err);
            }
        }
        fetchHSquad();
        fetchASquad();
    }, [])


    useEffect(() => {
        const fetchPlayersAndIncidents = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const homeResponse = await axiosInstance.get(`${BASE_URL}/football/getTeamsMemberFunc`, {
                    params: { team_id: matchData.homeTeam.id.toString() },
                    headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                });
                setHomePlayer(homeResponse.data || []);

                const awayResponse = await axiosInstance.get(`${BASE_URL}/football/getTeamsMemberFunc`, {
                    params: { team_id: matchData.awayTeam.id.toString() },
                    headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                });
                setAwayPlayer(awayResponse.data || []);

                const incidentsResponse = await axiosInstance.get(`${BASE_URL}/football/getFootballIncidents`, {
                    params: { match_id: matchData.id },
                    headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                });
                setIncidents(incidentsResponse.data[1].incidents || []);
            } catch (err) {
                console.error("Unable to fetch data: ", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayersAndIncidents();
    }, []);

    // Sort and filter incidents
    incidents.sort((a, b) => b.id - a.id);
    const penaltyShootoutIncidents = incidents.filter(item => item.incident_type === 'penalty_shootout');
    const firstHalf = incidents.filter(item => item.periods === "first_half" && item.incident_type !== 'penalty_shootout');
    const secondHalf = incidents.filter(item => item.periods === "second_half" && item.incident_type !== 'penalty_shootout');
    const extraHalfTime = incidents.filter(item => item.periods === "extra_half_time" && item.incident_type !== 'penalty_shootout');
    const halfTime = incidents.filter(item => (item.incident_type === "period" && item.periods === "half_time"));
    const fullTime = incidents.filter(item => (item.incident_type === "period" && item.periods === "full_time"));

    return (
        <ScrollView nestedScrollEnabled={true} style={tailwind`flex-1 bg -white`}>
            <View style={tailwind`p-1`}>
                <View style={tailwind`mb-2 items-center justify-center`}>
                    <Pressable 
                        onPress={() => setIncidentModalVisible(true)} 
                        style={tailwind`bg-white rounded-lg shadow-lg p-2 items-center w-full`}
                    >
                        <Text style={tailwind`text-gray text-lg font-semibold`}>Add Incident</Text>
                    </Pressable>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <>
                        <View style={tailwind`bg-white rounded-lg shadow-lg p-2 w-full mb-2`}>
                            <View style={tailwind`items-center`}>
                                <Text style={tailwind`text-lg font-bold mb-2`}>PEN</Text>
                                {/* <Text>{}</Text>  ADD the score of the match*/}
                            </View>
                            {penaltyShootoutIncidents.map((item, index) => (
                                <View key={index} style={tailwind`p-2 bg-white`}>
                                    {item.team_id === matchData.homeTeam.id ? (
                                            <View style={tailwind`flex-row justify-start gap-2`}>
                                                <Text style={tailwind`text-md`}>{item.penalty_shootout_scored ? '⚽' : '🚫'}</Text>
                                                <Text style={tailwind`h-10 w-0.2 bg-gray-400`} />
                                                <Text style={tailwind`text-lg`}>{item.player.name}</Text>
                                                <Text style={tailwind`text-xl`}>{item.home_score.goals} - {item.away_score.goals}</Text>
                                            </View>
                                    ) : (
                                            <View style={tailwind`flex-row justify-end gap-2 ml-40`}>
                                                <Text style={tailwind`text-xl`}>{item.home_score.goals} - {item.away_score.goals}</Text>
                                                <Text style={tailwind`text-lg`}>{item.player.name}</Text>
                                                <Text style={tailwind`h-10 w-0.2 bg-gray-400`} />
                                                <Text style={tailwind`text-lg`}>{item.penalty_shootout_scored ? '⚽' : '🚫'}</Text>
                                            </View>
                                    )}
                                    
                                </View>
                                
                            ))}
                        </View>
                        <View style={tailwind`bg-white rounded-lg shadow-lg p-1 items-center w-full mb-2`}>
                            <View style={tailwind`mb-4`}>
                                <View >
                                    <Text style={tailwind`text-lg font-bold text-center bg-red-200 p-2 w-full rounded-full mb-4`}>
                                        {extraHalfTime.length > 0 ? 'ET' : 'Extra Half Time'}
                                    </Text>
                                </View>
                                <View style={tailwind`gap-4`}>
                                    <IncidentCheck incident={extraHalfTime} matchData={matchData} />
                                </View>
                            </View>
                            <View style={tailwind`mb-4`}>
                                <View>
                                    <Text style={tailwind`text-lg font-bold text-center bg-red-200 p-2 w-full rounded-full mb-4`}>
                                        {fullTime.length > 0 ? 'FT' : '2nd half'}
                                    </Text>
                                </View>
                                <View style={tailwind`gap-4`}>
                                    <IncidentCheck incident={secondHalf} matchData={matchData} />
                                </View>
                            </View>
                            <View style={tailwind`mb-4`}>
                                <View>
                                    <Text style={tailwind`text-lg font-bold text-center bg-red-200 p-2 w-full rounded-full mb-4`}>
                                        {halfTime.length > 0 ? 'HT' : '1st half'}
                                    </Text>
                                </View>
                                <View style={tailwind`gap-4`}>
                                    <IncidentCheck incident={firstHalf} matchData={matchData} />
                                </View>
                            </View>
                        </View>
                    </>
                )}

                {incidentModalVisible && (
                    <Modal
                        transparent={true}
                        animationType="slide"
                        visible={incidentModalVisible}
                        onRequestClose={() => setIncidentModalVisible(false)}
                    >
                        <Pressable onPress={() => setIncidentModalVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                            <View style={tailwind`bg-white rounded-t-lg p-8`}>
                                <AddFootballModalIncident 
                                    matchData={matchData} 
                                    awayPlayer={awayPlayer} 
                                    homePlayer={homePlayer} 
                                    awayTeam={matchData.awayTeam} 
                                    homeTeam={matchData.homeTeam}
                                    awaySquad={awaySquad}
                                    homeSquad={homeSquad}
                                />
                            </View>
                        </Pressable>
                    </Modal>
                )}
            </View>
        </ScrollView>
    );
}

export default FootballIncidents;