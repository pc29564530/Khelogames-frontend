import AsyncStorage from '@react-native-async-storage/async-storage';
import {useState, useRef, useEffect} from 'react';
import {View, Text, ScrollView, Pressable, Modal, TextInput, Image} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import AddFootballModalIncident from '../components/AddFootballModalIncidents';

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
    console.log("penalty shootout: ", penaltyShootoutIncidents)
    return (
        <ScrollView style={tailwind`flex-1 bg-white`}>
            <View style={tailwind``}>
            <View style={tailwind`items-end mb-4`}>
                <Pressable 
                    onPress={() => setIncidentModalVisible(true)} 
                    style={tailwind`bg-blue-600 rounded-lg p-3 shadow-md`}
                >
                    <Text style={tailwind`text-white text-lg font-semibold`}>Add Incident</Text>
                </Pressable>
            </View>

            <View style={tailwind`flex-row`}>
                <Text style={tailwind`text-lg font-bold items-center`}>PEN</Text>
                {/* <View style={tailwind`flex-row`}>
                    <Text style={tailwind`text-lg`}>{matchData.homeTeam.name}</Text>
                    <Text style={tailwind`text-lg font-bold`}> - </Text>
                    <Text style={tailwind`text-lg`}>{matchData.awayTeam.name}</Text>
                </View> */}
            </View>

            <View style={tailwind`justify-between mb-4`}>
            {penaltyShootoutIncidents.map((item, index) => (
                <View key={index} style={[tailwind`p-4 justify-between`]}>
                    {item.team_id===matchData.homeTeam.id ? (
                        <View style={tailwind`justify-start  flex-row gap-2 `}>
                            {item.penalty_shootout_scored ===  true ? (
                                <>
                                <View>
                                    <Text style={tailwind`text-2xl`}>⚽</Text>
                                </View>
                                <View style={tailwind`h-10 w-0.2 bg-gray-400 mx-4`} />
                                <View style={tailwind`flex-row`}>
                                    <Text style={tailwind`font-bold text-2xl`}>{item.home_score.goals}</Text>
                                    <Text style={tailwind`font-bold text-2xl`}>-</Text>
                                    <Text style={tailwind`font-bold text-2xl`}>{item.away_score.goals}</Text>
                                </View>
                                </>
                            ):(
                                <>
                                <View>
                                    <Text style={tailwind`text-2xl`}>🚫</Text>
                                    <View style={tailwind`h-10 w-0.2 bg-gray-400 mx-4`} />
                                </View>
                                <View style={tailwind`flex-row`}>
                                    <Text style={tailwind`font-light text-2xl`}>{item.home_score.goals}</Text>
                                    <Text style={tailwind`font-bold text-2xl`}>-</Text>
                                    <Text style={tailwind`font-bold text-2xl`}>{item.away_score.goals}</Text>
                                </View>
                                </>
                            )}
                            <Text style={tailwind`font-bold text-2xl`}>{item.player.name}</Text>
                        </View>
                    ): (
                        <View style={tailwind`flex-row justify-end gap-2`}>
                            <Text style={tailwind`font-bold text-2xl`}>{item.player.name}</Text>
                            <View style={tailwind`flex-row`}>
                                <Text style={tailwind`font-bold text-2xl`}>{item.home_score.goals}</Text>
                                <Text style={tailwind`font-bold text-2xl`}>-</Text>
                                <Text style={tailwind`font-bold text-2xl`}>{item.away_score.goals}</Text>
                            </View>
                            <View style={tailwind`h-10 w-0.2 bg-gray-400 mx-4`} />
                            {item.penalty_shootout_scored ===  true ? (
                                <View>
                                    <Text style={tailwind`text-2xl`}>⚽</Text>
                                </View>
                            ):(
                                <View>
                                    <Text style={tailwind`text-2xl`}>🚫</Text>
                                </View>
                            )}
                        </View>
                    )}
                    
                </View>
            ))}
            </View>
            </View>
                <View style={tailwind`border border-gray-200 shadow-md rounded-md `}>
                {incidents.filter(item => item.incident_type !== 'penalty_shootout')
                    .map((item, index) => (
                        <View key={index} style={[tailwind`p-4 border-b border-gray-200 justify-between`, item.team_id === matchData.homeTeam.id?tailwind`justify-start`:tailwind`justify-end`]}>
                        {item.incident_type === "substitutions" ? (
                            <View style={tailwind`flex-row items-center`}>
                            <View style={tailwind``}>
                                <View style={tailwind`flex-row`}>
                                <Text>In:</Text>
                                <Text>{item.player_in.name}</Text>
                                </View>
                                <View style={tailwind`flex-row`}>
                                <Text>Out:</Text>
                                <Text>{item.player_out.name}</Text>
                                </View>
                            </View>
                            <View style={tailwind`h-10 w-1 bg-gray-400 mx-4`} />
                            <View style={tailwind`items-center p-2`}>
                                <Image src="" style={tailwind`rounded-full bg-yellow-200 h-5 w-5`}/>
                                <Text style={tailwind`font-bold text-lg`}>{item.incident_time}'</Text>
                            </View>
                            </View>
                        ) : (
                            <View style={tailwind`flex-row items-center`}>
                            {item.home_score && item.away_score && (
                                <View style={tailwind`flex-row`}>
                                <Text>{item.home_score.goals}</Text>
                                <Text>-</Text>
                                <Text>{item.away_score.goals}</Text>
                                </View>
                            )}
                            <View style={tailwind``}>
                                <Text>{item.player.name}</Text>
                                <Text>{item.incident_type}</Text>
                            </View>
                            <View style={tailwind`h-10 w-1 bg-gray-400 mx-4`} />
                            <View style={tailwind`items-center`}>
                                <Image src="" style={tailwind`rounded-full bg-yellow-200 h-5 w-5`}/>
                                <Text style={tailwind`font-bold text-lg`}>{item.incident_time}'</Text>
                            </View>
                            </View>
                        )}
                        </View>
                    ))}
                </View>
                
                {incidentModalVisible && (
                    <Modal
                        transparent={true}
                        animatedType="slide"
                        visible={incidentModalVisible}
                        onRequestClose={() => setIncidentModalVisible(false)}
                    >
                        <Pressable onPress={() => setIncidentModalVisible(false)}style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                            <View style={tailwind`bg-white rounded-md p-8`}>
                                <AddFootballModalIncident matchData={matchData} awayPlayer={awayPlayer} homePlayer={homePlayer} awayTeam={matchData.awayTeam} homeTeam={matchData.homeTeam}/>
                            </View>
                        </Pressable>
                    </Modal>
                )}
        </ScrollView>
    );
}
export default FootballIncidents; 