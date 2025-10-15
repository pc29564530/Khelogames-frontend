import {useEffect, useState} from 'react';
import { View, Text, Pressable, Modal } from "react-native";
import tailwind from "twrnc";
import { AddCricketBowler } from "./AddCricketBowler";
import { AddCricketBatsman } from "./AddCricketBatsman";
import { useSelector, useDispatch } from 'react-redux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CricketTeamSquad from './CricketTeamSquad';
import axiosInstance from '../screen/axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import { getCricketMatchSqud } from '../redux/actions/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddBatsmanAndBowler = ({match, setAddBatsmanAndBowlerModalVisible}) => {
    const [currentAuthUser, setCurrentAuthUser] = useState(null);
    const [striker, setStriker] = useState(null);
    const [nonStriker, setNonStriker] = useState(null)
    const [currentModal, setCurrentModal] = useState(null);
    const [selectedBowler, setSelectedBowler] = useState([]);
    const [selectedBatsman, setSelectedBatsman] = useState([]);
    const [isBowlTeamPlayerModalVisible, setIsBowlTeamPlayerModalVisible] = useState(false);
    const [isBatTeamPlayerModalVisible, setIsBatTeamPlayerModalVisible] = useState(false);
    const [addBatAndBowler, setAddBatAndBowler] = useState(false);
    const game = useSelector((state) => state.sportReducers.game);
    const homePlayer = useSelector(state => state.teams.homePlayer)
    const awayPlayer = useSelector(state =>  state.teams.awayPlayer);
    const batTeam = useSelector(state => state.cricketMatchScore.batTeam);
    const bowling = useSelector((state) => state.cricketPlayerScore.bowlingScore);
    const currentInningNumber = useSelector(state => state.cricketMatchInning.currentInningNumber)
    const cricketMatchSquad = useSelector(state => state.players.squads)
    const dispatch = useDispatch();

    const currentBatTeamUser = batTeam === match.homeTeam.public_id ? match.homeTeam.user_id : match.awayTeam.user_id;

    useEffect(() => {
        const fetchCurrentAuthUser = async () => {
            try {
                const authUser = await AsyncStorage.getItem("User");
                setCurrentAuthUser(JSON.parse(authUser));
            } catch (err) {
                console.error("Failed to set current auth user: ", err);
            }
        }
        fetchCurrentAuthUser()
    }, []);
    
    return (
        <View style={tailwind``}>
            <View style={tailwind` mb-4 bg-white p-4`}>
                <View style={tailwind`p-2 items-start`}>
                    <Text style={tailwind`text-lg`}>Select Batsman Pair</Text>
                </View>
                <Pressable onPress={() => {setIsBatTeamPlayerModalVisible(true); setCurrentModal("striker")}} style={tailwind`flex-row justify-between items-center border border-gray-300 p-4 bg-white rounded-md shadow-md mb-2`}>
                    <Text style={tailwind`text-black text-lg`}>Select Striker</Text>
                    <AntDesign name="down" size={24} />
                </Pressable>
                <Pressable onPress={() => {setIsBatTeamPlayerModalVisible(true); setCurrentModal("nonStriker")}} style={tailwind`flex-row justify-between items-center border border-gray-300 p-4 bg-white rounded-md shadow-md mb-2`}>
                    <Text style={tailwind`text-black text-lg`}>Select Non-Striker</Text>
                    <AntDesign name="down" size={24} />
                </Pressable>
                <Pressable onPress={() => 2()}style={tailwind`flex-row justify-between items-center border border-gray-300 p-4 bg-white rounded-md shadow-md mb-2`}>
                    <Text style={tailwind`text-lg`}>Add Batsman</Text>
                </Pressable>
            </View>
            <View style={tailwind`mb-4 bg-white p-2`}>
                <View style={tailwind`p-2 items-start`}>
                    <Text style={tailwind`text-lg`}>Select Bowler</Text>
                </View>
                <Pressable onPress={() => {setIsBowlTeamPlayerModalVisible(true); setCurrentModal("bowler")}} style={tailwind`flex-row justify-between items-center border border-gray-300 p-4 bg-white rounded-md shadow-md mb-2`}>
                    <Text style={tailwind`text-black text-lg`}>Select Bowler</Text>
                    <AntDesign name="down" size={24} />
                </Pressable>
            </View>
            <View style={tailwind`mb-2 bg-white p-2`}>
                <Pressable onPress={() => 2()}style={tailwind`flex-row justify-between items-center border border-gray-300 p-4 bg-white rounded-md shadow-md mb-2`}>
                    <Text style={tailwind`text-lg`}>Start Inning</Text>
                </Pressable>
                <Pressable onPress={() => 2()}style={tailwind`flex-row justify-between items-center border border-gray-300 p-4 bg-white rounded-md shadow-md mb-2`}>
                    <Text style={tailwind`text-lg`}>Add Batsman</Text>
                </Pressable>
            </View>
            {isBatTeamPlayerModalVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isBatTeamPlayerModalVisible}
                    onRequestClose={() => setIsBatTeamPlayerModalVisible(false)}
                >
                    <Pressable onPress={() => setIsBatTeamPlayerModalVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                                <AddCricketBatsman
                                     match={match}
                                     batTeam={batTeam} 
                                     game={game} 
                                     dispatch={dispatch}
                                     selectedBatsman={selectedBatsman}
                                     setSelectedBatsman={(player) => {
                                        currentModal === "striker" ? setStriker(player) : setNonStriker(player)
                                     }}
                                />
                        </View>
                    </Pressable>
                </Modal>
            )}
            {isBowlTeamPlayerModalVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isBowlTeamPlayerModalVisible}
                    onRequestClose={() => setIsBowlTeamPlayerModalVisible(false)}
                >
                    <Pressable onPress={() => setIsBowlTeamPlayerModalVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <AddCricketBowler match={match} batTeam={batTeam}  homeTeam={match.homeTeam} awayTeam={match.awayTeam} game={game} dispatch={dispatch} bowling={bowling} setSelectedBowler={setSelectedBowler}/>
                        </View>
                    </Pressable>
                </Modal>
            )}
            
        </View>
    ); 
}

export default AddBatsmanAndBowler;