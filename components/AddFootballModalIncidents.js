import React, {useState, useRef} from 'react';
import { Pressable, Text, View, Modal, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from '../screen/axios_config';
import { TextInput } from 'react-native-gesture-handler';
import { Picker } from '@react-native-picker/picker';
import AddFootballIncidentlayer from './AddFootballIncidentPlayer';
import AddFootballSubstitution from './AddFootballSubstitutionIncident';
import AddFootballPenalty from './AddFootballPenaltyIncident';
import AddFootballMissedPenalty from './AddFootballMissedPenaltyIncident';
import AddFootballShootout from './AddFootballShootoutIncident';
import { BASE_URL } from '../constants/ApiConstants';

const incidentsTypes = ["goal", "penalty", "fouls", "shot_on_target", "penalty_miss", "yellow_card", "red_card", "substitutions", "penalty_shootout"];

const AddFootballModalIncident = ({matchData, awayPlayer, homePlayer, awayTeam, homeTeam}) => {
    const scrollViewRef = useRef(null);
    const axiosInstance = useAxiosInterceptor();
    const [selectedMinute, setSelectedMinute] = useState();
    const [selectedHalf, setSelectedHalf] = useState("first_half");
    const [selectedIncident, setSelectedIncident] = useState("");
    const [playerModalVisible, setPlayerModalVisible] = useState(false);
    const [substitutionModalVisible, setSubstitutionModalVisible] = useState(false);
    
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [description, setDescription] = useState("");
    const [teamID, setTeamID] = useState();
    const [shootoutModalVisible, setShootoutModalVisible ] = useState(false);
    const [penaltyModalVisible, setPenaltyModalVisible] = useState(false);
    const [missedPenaltyVisible, setMissedPenaltyVisible] = useState(false);

    const handlePeriods = (item) => {
        setSelectedHalf(item);
    }

    const handleIncident = (item) => {
        if (item === "penalty_shootout") {
            setShootoutModalVisible(true);
        } else if (item === "penalty") {
            setPenaltyModalVisible(true);
        } else if(item === "penalty_miss"){
            setMissedPenaltyVisible(true);
        } else if (item === "substitutions"){
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
                
            } else {
                
            }
            
        } catch (err) {
            console.error("unable to add football incident: ", err)
        }
    };
    
    return (
        <View style={tailwind``}>
            <View>
                <View>
                    {/* <Text>Select Incident</Text> */}
                    <View style={tailwind`flex-row mt-5`}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        ref={scrollViewRef}
                        contentContainerStyle={tailwind`flex-row flex-wrap justify-center`}
                    >
                        {incidentsTypes.map((item, index) => (
                            <Pressable key={index} style={[tailwind`border rounded-lg bg-blue-500 h-30 w-30 p-2 mr-2 ml-2`, selectedIncident===item?tailwind`bg-orange-400`:tailwind`bg-orange-200`]} onPress={() => handleIncident(item)}>
                                <Text style={tailwind`text-black text-2xl`}>{item}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                    <Pressable onPress={scrollRight} style={tailwind`justify-center ml-2`}>
                        <MaterialIcons name="keyboard-arrow-right" size={30} color="black" />
                    </Pressable>
                </View>
                </View>
            </View>
            {substitutionModalVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={substitutionModalVisible}
                    onRequestClose={() => setSubstitutionModalVisible(false)}
                >
                    <Pressable onPress={() => setSubstitutionModalVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <AddFootballSubstitution matchData={matchData} 
                                awayPlayer={awayPlayer} 
                                homePlayer={homePlayer} 
                                awayTeam={matchData.awayTeam} 
                                homeTeam={matchData.homeTeam}
                            />
                        </View>
                    </Pressable>
                </Modal>
            )}
            {/* {playerModalVisible && (
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
            )} */}
            {penaltyModalVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={penaltyModalVisible}
                    onRequestClose={() => setPenaltyModalVisible(false)}
                >
                    <Pressable onPress={() => setPenaltyModalVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <AddFootballPenalty matchData={matchData} 
                                awayPlayer={awayPlayer} 
                                homePlayer={homePlayer} 
                                awayTeam={matchData.awayTeam} 
                                homeTeam={matchData.homeTeam}
                            />
                        </View>
                    </Pressable>
                </Modal>
            )}
            {missedPenaltyVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={missedPenaltyVisible}
                    onRequestClose={() => setMissedPenaltyVisible(false)}
                >
                    <Pressable onPress={() => setMissedPenaltyVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <AddFootballMissedPenalty matchData={matchData} 
                                awayPlayer={awayPlayer} 
                                homePlayer={homePlayer} 
                                awayTeam={matchData.awayTeam} 
                                homeTeam={matchData.homeTeam}
                            />
                        </View>
                    </Pressable>
                </Modal>
            )}
            {shootoutModalVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={shootoutModalVisible}
                    onRequestClose={() => setShootoutModalVisible(false)}
                >
                    <Pressable onPress={() => setShootoutModalVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <AddFootballShootout matchData={matchData} 
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
    );
};

export default AddFootballModalIncident;