import AsyncStorage from '@react-native-async-storage/async-storage';
import {useState, useRef, useEffect} from 'react';
import {View, Text, ScrollView, Pressable, Modal, TextInput} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';


const incidentsTypes = ["goal", "penalty", "corner_kick", "fouls", "shot_on_target", "goal_keeper_save", "penalty_miss", "free_kicks", "yellow_card", "red_card"]

const FootballIncidents = ({route}) => {
    const scrollViewRef = useRef(null)
    const [selectedIncident, setSelectedIncident] = useState("");
    const [incidentModalVisible, setIncidentModalVisible] = useState(false);
    const [teamID, setTeamID] = useState(); 
    const [homePlayer, setHomePlayer] = useState([]);
    const [awayPlayer, setAwayPlayer] = useState([]);
    const [homePlayerModal, setHomePlayerModal] = useState(false);
    const [awayPlayerModal, setAwayPlayerModal] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState();
    const [description, setDescription] = useState("");
    const axiosInstance = useAxiosInterceptor()
    const matchData = route.params.matchData;
    console.log("Match Id: ", matchData.id)
    console.log("Match Data: ", matchData)
    const handleIncident = (item) => {
        setSelectedIncident(item);
        setIncidentModalVisible(true);
    }
    const scrollRight = () => {
        scrollViewRef.current.scrollTo({x:100, animated:true})
    }

    useEffect(() => {
        const fetchHomePlayer = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const homeResponse = await axiosInstance.get(`${BASE_URL}/Football/getTeamsMemberFunc`, {
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
                const awayResponse = await axiosInstance.get(`${BASE_URL}/Football/getTeamsMemberFunc`, {
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

    const handleAddIncident = async () => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            const data = {
                "match_id":matchData.id,
                "team_id":teamID,
                "incident_type":selectedIncident,
                "incident_time":0,
                "player_id":selectedPlayer,
                "description":description
            }
            console.log("Data: ", data)
            const response = await axiosInstance.post(`${BASE_URL}/Football/addFootballIncidents`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
        } catch (err) {
            console.error("unable to add football incident: ", err)
        }
    }

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken");
                const data = {
                    "match_id":matchData.id
                }
                console.log("Data: ", data)
                const response = await axiosInstance.get(`${BASE_URL}/Football/getFootballIncidents`, {
                    params:data,
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                console.log("Incident: ", response.data)
            } catch (err) {
                console.error("unable to fetch the incident: ", err)
            }
        }
        fetchIncidents()
    })

    console.log("Away Player: ", awayPlayer)
    console.log("Home Player; ", homePlayer)

    return (
        <View>
                <View style={tailwind`flex-row mt-5`}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        ref={scrollViewRef}
                        contentContainerStyle={tailwind`flex-row flex-wrap justify-center`}
                    >
                        {incidentsTypes.map((item, index) => (
                            <Pressable key={index} style={[tailwind`border rounded-lg bg-blue-500 p-2 mr-2 ml-2`, selectedIncident===item?tailwind`bg-orange-400`:tailwind`bg-orange-200`]} onPress={() => handleIncident(item)}>
                                <Text style={tailwind`text-white`}>{item}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                    <Pressable onPress={scrollRight} style={tailwind`justify-center ml-2`}>
                        <MaterialIcons name="keyboard-arrow-right" size={30} color="black" />
                    </Pressable>
                </View>
            {incidentModalVisible && (
                <Modal
                    transparent={true}
                    animatedType="slide"
                    visible={incidentModalVisible}
                    onRequestClose={() => setIncidentModalVisible(false)}
                >
                    <Pressable onPress={() => setIncidentModalVisible(false)}style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <View style={tailwind`flex flex-row items-start`}>
                                <View>
                                    <Text>Teams: </Text>
                                </View>
                                
                                <View style={tailwind`flex-row gap-10`}>
                                    <Pressable onPress={() => setTeamID(matchData.homeTeam.id)}>
                                        <Text>{matchData.homeTeam.name}</Text>
                                    </Pressable>
                                    <Pressable onPress={() => setTeamID(matchData.awayTeam.id)}>
                                        <Text>{matchData.awayTeam.name}</Text>
                                    </Pressable>
                                </View>
                            </View>
                            <View>
                                <View>
                                    <Text>Player: </Text>
                                </View>
                                <Pressable onPress={() => setHomePlayerModal(true)}>
                                    <Text>{matchData.homeTeam.name}</Text>
                                </Pressable>
                                <Pressable onPress={() => setAwayPlayerModal(true)}>
                                    <Text>{matchData.awayTeam.name}</Text>
                                </Pressable>
                            </View>
                            <View>
                                <Text>Incident Type: </Text>
                                <Text>{selectedIncident}</Text>
                            </View>
                            <View>
                                <Text>Incident Time</Text>
                            </View>
                            <View>
                                <Text>Description</Text>
                                <TextInput name="description" value={description} onChangeText={setDescription} placeholder="Enter about incident.."/>
                            </View>
                            <Pressable onPress={() => handleAddIncident()}>
                                <Text>Confirm</Text>
                            </Pressable>
                            
                        </View>
                    </Pressable>
                </Modal>
            )}
            {homePlayerModal && (
                <Modal
                    transparent={true}
                    animatedType="slide"
                    visible={homePlayerModal}
                    onRequestClose={() => setHomePlayerModal(false)}
                >
                    <Pressable onPress={() => setHomePlayerModal(false)}style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            {homePlayer.map((item, index) => (
                                <Pressable onPress={() => {setSelectedPlayer(item.id); setHomePlayerModal(false)}}>
                                    <Text key={index}>{item.player_name}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </Pressable>
                </Modal>
            )}
            {awayPlayerModal && (
                <Modal
                    transparent={true}
                    animatedType="slide"
                    visible={awayPlayerModal}
                    onRequestClose={() => setAwayPlayerModal(false)}
                >
                    <Pressable onPress={() => setAwayPlayerModal(false)}style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            {awayPlayer.map((item, index) => (
                                <Pressable onPress={() => {setSelectedPlayer(item.id); setAwayPlayerModal(false)}}>
                                    <Text key={index}>{item.player_name}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
}
export default FootballIncidents;