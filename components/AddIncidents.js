import React, {useState, useRef} from 'react';
import { Pressable, Text, View, Modal, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from '../screen/axios_config';
import { TextInput } from 'react-native-gesture-handler';
import { Picker } from '@react-native-picker/picker';
import AddFootballIncidentlayer from './AddFootballIncidentPlayer';
import FootballSubstitution from './FootballSubstitutions';
import { BASE_URL } from '../constants/ApiConstants';

const incidentsTypes = ["goal", "penalty", "fouls", "shot_on_target", "penalty_miss", "yellow_card", "red_card", "substitutions"];

const AddIncident = ({matchData, awayPlayer, homePlayer, awayTeam, homeTeam}) => {
    const scrollViewRef = useRef(null);
    const axiosInstance = useAxiosInterceptor();
    const [selectedMinute, setSelectedMinute] = useState();
    const [selectedHalf, setSelectedHalf] = useState("first_half");
    const [selectedIncident, setSelectedIncident] = useState("");
    const [playerModalVisible, setPlayerModalVisible] = useState(false);
    const [substitutionModalVisible, setSubstitutionModalVisible] = useState(false);
    const [selectedPlayerIn, setSelectedPlayerIn] = useState(null);
    const [selectedPlayerOut, setSelectedPlayerOut] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [description, setDescription] = useState("");
    const [teamID, setTeamID] = useState();

    const handlePeriods = (item) => {
        setSelectedHalf(item);
    }

    const handleIncident = (item) => {
        if (item === "substitutions"){
            setSubstitutionModalVisible(true);
        } else {
            setPlayerModalVisible(true);
        }
        setSelectedIncident(item);
    }

    const scrollRight = () => {
        scrollViewRef.current.scrollTo({x:100, animated:true})
    }

    const minutes = Array.from({length:90}, (_,i)=> i+1);

    const handleAddIncident = async () => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            if(selectedIncident === "substitutions") {
                const data = {
                    "match_id":matchData.id,
                    "team_id":teamID,
                    "periods":selectedHalf,
                    "incident_type":selectedIncident,
                    "incident_time":selectedMinute,
                    "player_in_id":selectedPlayerIn.id,
                    "player_out_id":selectedPlayerOut.id,
                    "description":description
                }
                console.log("Data: ", data)
                const response = await axiosInstance.post(`${BASE_URL}/Football/addFootballIncidents`, data, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
            } else {
                const data = {
                    "match_id":matchData.id,
                    "team_id":teamID,
                    "periods":selectedHalf,
                    "incident_type":selectedIncident,
                    "incident_time":selectedMinute,
                    "player_id":selectedPlayer.id,
                    "description":description
                }
                console.log("Data: ", data)
                const response = await axiosInstance.post(`${BASE_URL}/Football/addFootballIncidents`, data, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
            }
            
        } catch (err) {
            console.error("unable to add football incident: ", err)
        }
    };
    
    return (
        <View style={tailwind``}>
            <View>
                <View>
                    <Text>Edit Periods</Text>
                </View>
                <View style={tailwind`flex-row items-center  justify-between`}>
                    <Pressable style={tailwind`border roounded-md h-30 w-30`} onPress={() => handlePeriods("first_half")}>
                        <Text>1st Half</Text>
                    </Pressable>
                    <Pressable style={tailwind`border roounded-md h-30 w-30`} onPress={() => handlePeriods("second_half")}>
                        <Text>2nd Half</Text>
                    </Pressable>
                </View>
            </View>
            <View style={tailwind`flex-row items-center  justify-between`}>
                <Pressable style={tailwind`border roounded-md h-30 w-30`} onPress={() => setTeamID(homeTeam.id)}>
                    <Text>{homeTeam.name}</Text>
                </Pressable>
                <Pressable style={tailwind`border roounded-md h-30 w-30`} onPress={() => setTeamID(awayTeam.id)}>
                    <Text>{awayTeam.name}</Text>
                </Pressable>
            </View>

            <View>
                {/* Minute Selector */}
                <View style={tailwind`flex-row items-center mb-4`}>
                    <Text style={tailwind`mr-2`}>Incident Time:</Text>
                    <Picker
                        selectedValue={selectedMinute}
                        style={tailwind`h-50 w-30`}
                        onValueChange={(itemValue) => setSelectedMinute(itemValue)}>
                        {minutes.map((minute) => (
                            <Picker.Item label={`${minute}`} value={minute} key={minute} />
                        ))}
                    </Picker>
                </View>
                <View>
                    <Text>Select Incident</Text>
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
                <View style={tailwind`mb-4`}>
                    <Text>Description:</Text>
                    <TextInput
                        style={tailwind`border p-2 rounded`}
                        placeholder="Enter about incident.."
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>
                </View>
            </View>
            <Pressable onPress={() => handleAddIncident()} style={tailwind`bg-blue-500 p-2 rounded`}>
                <Text style={tailwind`text-white text-center`}>Confirm</Text>
            </Pressable>
            {substitutionModalVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={substitutionModalVisible}
                    onRequestClose={() => setSubstitutionModalVisible(false)}
                >
                    <Pressable onPress={() => setSubstitutionModalVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <FootballSubstitution matchData={matchData} 
                                awayPlayer={awayPlayer} 
                                homePlayer={homePlayer} 
                                awayTeam={matchData.awayTeam} 
                                homeTeam={matchData.homeTeam} 
                                selectedPlayerIn={selectedPlayerIn} 
                                setSelectedPlayerIn={setSelectedPlayerIn} 
                                selectedPlayerOut={selectedPlayerOut} 
                                setSelectedPlayerOut={setSelectedPlayerOut}
                                teamID={teamID}
                            />
                        </View>
                    </Pressable>
                </Modal>
            )}
            {playerModalVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={playerModalVisible}
                    onRequestClose={() => setPlayerModalVisible(false)}
                >
                    <Pressable onPress={() => setPlayerModalVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <AddFootballIncidentlayer 
                                matchData={matchData} 
                                awayPlayer={awayPlayer} 
                                homePlayer={homePlayer} 
                                awayTeam={matchData.awayTeam} 
                                homeTeam={matchData.homeTeam} 
                                selectedPlayer={selectedPlayer} 
                                setSelectedPlayer={setSelectedPlayer}
                                teamID={teamID}
                            />
                        </View>
                    </Pressable>
                </Modal>
            )}

        </View>
    );
};

export default AddIncident;