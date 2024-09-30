import AsyncStorage from '@react-native-async-storage/async-storage';
import {useState, useRef, useEffect} from 'react';
import {View, Text, ScrollView, Pressable, Modal, TextInput, Image} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import AddFootballModalIncident from '../components/AddFootballModalIncidents';
import IncidentCheck from '../components/IncidentsCheck';

const FootballIncidents = ({route}) => {
    const [incidentModalVisible, setIncidentModalVisible] = useState(false);
    const [incidents, setIncidents] = useState([]);
    const [homePlayer, setHomePlayer] = useState([]);
    const [awayPlayer, setAwayPlayer] = useState([]);
    const [penaltyH, setPenaltyH] = useState([]);
    const [penaltyA, setPenaltyA] = useState([]);
    const matchData = route.params.matchData;
    const axiosInstance = useAxiosInterceptor();

    useEffect(() => {
        const fetchHomePlayer = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const homeResponse = await axiosInstance.get(`${BASE_URL}/football/getTeamsMemberFunc`, {
                    params:{
                        team_id: matchData.homeTeam.id.toString()
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                setHomePlayer(homeResponse.data || []);
            } catch (err) {
                console.error("unable to fetch the team player: ", err);
            }
        }
        const fetchAwayPlayer = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const awayResponse = await axiosInstance.get(`${BASE_URL}/football/getTeamsMemberFunc`, {
                    params:{
                        team_id: matchData.awayTeam.id.toString()
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                setAwayPlayer(awayResponse.data || []);
            } catch (err) {
                console.error("unable to fetch the team player: ", err);
            }
        }
        fetchHomePlayer();
        fetchAwayPlayer();
    }, []);

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken");
                const data = {
                    "match_id":matchData.id
                }
                const response = await axiosInstance.get(`${BASE_URL}/football/getFootballIncidents`, {
                    params:data,
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                console.log("Incident: ", response.data[1].incidents)
                setIncidents(response.data[1].incidents || []);
            } catch (err) {
                console.error("unable to fetch the incident: ", err)
            }
        }
        fetchIncidents()
    }, []);

    useEffect(() => {
        const fetchPenaltyShootout = async () => {

            data = {
                match_id: matchData.id
            }
            console.log("match id: ", data)
            try {
                const authToken = await AsyncStorage.getItem("AccessToken");
                const response = await axiosInstance.get(`${BASE_URL}/football/getFootballPenalty`, {
                    params:{
                        match_id: matchData.id.toString()
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    }
                })

                const item = response.data || [];
                
                console.log("Shootout: ", item)
                setPenaltyH(response.data || []);

            } catch (err) {
                console.error("unable to fetch the penalty shootout: ", err)
            }
        }
        
        fetchPenaltyShootout();
    }, []);

    incidents.sort((a,b) => b.id - a.id);
    const penaltyShootoutIncidents = incidents.filter(item => item.incident_type === 'penalty_shootout');
    return (
        <ScrollView style={tailwind`flex-1 bg-white`}>
            <View style={tailwind`p-4`}>
                <View style={tailwind`items-end mb-6`}>
                    <Pressable 
                        onPress={() => setIncidentModalVisible(true)} 
                        style={tailwind`bg-blue-600 rounded-lg p-3 shadow-lg`}
                    >
                        <Text style={tailwind`text-white text-lg font-semibold`}>Add Incident</Text>
                    </Pressable>
                </View>
    
                <View style={tailwind`mb-4`}>
                    <Text style={tailwind`text-lg font-bold mb-2 items-center`}>PEN</Text>
                    <View style={tailwind`gap-4`}>
                        {penaltyShootoutIncidents.map((item, index) => (
                            <View key={index} style={tailwind` p-4 bg-gray-100 rounded-lg shadow-md`}>
                                {item.team_id === matchData.homeTeam.id ? (
                                    <View style={tailwind`flex-row justify-start gap-2`}>
                                        <Text style={tailwind`text-2xl mr-4`}>{item.penalty_shootout_scored ? '⚽' : '🚫'}</Text>
                                        <Text style={tailwind`h-10 w-0.2 bg-gray-400`}/>
                                        <Text style={tailwind`text-xl font-semibold mr-6`}>{item.player.name}</Text>
                                        <Text style={tailwind`text-xl`}>{item.home_score.goals} - {item.away_score.goals}</Text>
                                    </View>
                                ) : (
                                    <View style={tailwind`flex-row justify-end gap-2`}>
                                        <Text style={tailwind`text-xl`}>{item.home_score.goals} - {item.away_score.goals}</Text>
                                        <Text style={tailwind`text-xl font-semibold mx-6`}>{item.player.name}</Text>
                                        <Text style={tailwind`h-10 w-0.2 bg-gray-400`}/>
                                        <Text style={tailwind`text-2xl`}>{item.penalty_shootout_scored ? '⚽' : '🚫'}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>
    
                <View style={tailwind`mb-4`}>
                    <Text style={tailwind`text-lg font-bold text-center bg-red-200 p-2 w-full rounded-full mb-4`}>Extra Time</Text>
                    <IncidentCheck incidents={incidents.filter(item => (item.incident_type !== 'penalty_shootout' && item.periods === "extra_time"))} matchData={matchData}/>
    
                    <Text style={tailwind`text-lg font-bold text-center bg-red-200 p-2 w-full rounded-full mb-4`}>Full Time</Text>
                    <IncidentCheck incidents={incidents.filter(item => (item.incident_type !== 'penalty_shootout' && item.periods === "full_time"))} matchData={matchData}/>
    
                    <Text style={tailwind`text-lg font-bold text-center bg-red-200 p-2 w-full rounded-full`}>Half Time</Text>
                    <IncidentCheck incidents={incidents.filter(item => (item.incident_type !== 'penalty_shootout' && item.periods === "first_half"))} matchData={matchData}/>
                </View>
    
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