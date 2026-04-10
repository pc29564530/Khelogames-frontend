import {useEffect, useState} from 'react';
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
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
import { ScreenHeight } from '@rneui/base';

const AddBatsmanAndBowler = ({match, setAddBatsmanAndBowlerModalVisible}) => {
    const [striker, setStriker] = useState(null);
    const [nonStriker, setNonStriker] = useState(null)
    const [currentModal, setCurrentModal] = useState(null);
    const [selectedBowler, setSelectedBowler] = useState([]);
    const [selectedBatsman, setSelectedBatsman] = useState([]);
    const [error, setError] = useState({global: null, fields: {}});
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
    
    return (
        <View style={tailwind``}>
            <View style={[tailwind`mb-4 rounded-lg p-4`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155'}]}>
                <View style={tailwind`p-2 items-start`}>
                    <Text style={[tailwind`text-lg font-semibold`, {color: '#f1f5f9'}]}>Select Batsman Pair</Text>
                </View>
                <Pressable onPress={() => {setIsBatTeamPlayerModalVisible(true); setCurrentModal("striker")}} style={[tailwind`flex-row justify-between items-center p-4 rounded-lg mb-2`, {backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155'}]}>
                    <Text style={[tailwind`text-lg`, {color: '#f1f5f9'}]}>Select Striker</Text>
                    <AntDesign name="down" size={24} color="#94a3b8" />
                </Pressable>
                <Pressable onPress={() => {setIsBatTeamPlayerModalVisible(true); setCurrentModal("nonStriker")}} style={[tailwind`flex-row justify-between items-center p-4 rounded-lg mb-2`, {backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155'}]}>
                    <Text style={[tailwind`text-lg`, {color: '#f1f5f9'}]}>Select Non-Striker</Text>
                    <AntDesign name="down" size={24} color="#94a3b8" />
                </Pressable>
            </View>
            <View style={[tailwind`mb-4 rounded-lg p-4`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155'}]}>
                <View style={tailwind`p-2 items-start`}>
                    <Text style={[tailwind`text-lg font-semibold`, {color: '#f1f5f9'}]}>Select Bowler</Text>
                </View>
                <Pressable onPress={() => {setIsBowlTeamPlayerModalVisible(true); setCurrentModal("bowler")}} style={[tailwind`flex-row justify-between items-center p-4 rounded-lg mb-2`, {backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155'}]}>
                    <Text style={[tailwind`text-lg`, {color: '#f1f5f9'}]}>Select Bowler</Text>
                    <AntDesign name="down" size={24} color="#94a3b8" />
                </Pressable>
            </View>
            {isBatTeamPlayerModalVisible && (
            <Modal
                transparent={true}
                animationType="slide"
                visible={isBatTeamPlayerModalVisible}
                onRequestClose={() => setIsBatTeamPlayerModalVisible(false)}
            >
                <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                <Pressable
                    style={tailwind`flex-1`}
                    onPress={() => setIsBatTeamPlayerModalVisible(false)}
                />

                <View
                    style={[
                    tailwind`rounded-t-2xl p-4`,
                    {
                        backgroundColor: '#1e293b',
                        minHeight: 300,
                        maxHeight: ScreenHeight * 0.75,
                    },
                    ]}
                >
                    <ScrollView contentContainerStyle={{paddingBottom: 20}}>
                        <AddCricketBatsman
                            match={match}
                            batTeam={batTeam}
                            homePlayer={homePlayer}
                            awayPlayer={awayPlayer}
                            game={game}
                            dispatch={dispatch}
                            selectedBatsman={selectedBatsman}
                            setSelectedBatsman={setSelectedBatsman}
                            error={error}
                            setError={setError}
                            setIsBatTeamPlayerModalVisible={setIsBatTeamPlayerModalVisible}
                        />
                    </ScrollView>
                </View>
                </View>
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
                        <View style={[tailwind`rounded-t-2xl p-4`, {backgroundColor: '#1e293b', minHeight: 300, maxHeight: ScreenHeight * 0.75}]}>
                            <ScrollView contentContainerStyle={{paddingBottom: 20}}>
                                <AddCricketBowler
                                    match={match}
                                    batTeam={batTeam}
                                    homeTeam={match.homeTeam}
                                    awayTeam={match.awayTeam}
                                    game={game}
                                    dispatch={dispatch}
                                    bowling={bowling}
                                    currentBowler={selectedBowler}
                                    error={error}
                                    setError={setError}
                                    setIsBowlTeamPlayerModalVisible={setIsBowlTeamPlayerModalVisible}
                                    onSuccess={(nb) => setSelectedBowler(Array.isArray(nb) ? nb : [nb])}
                                />
                            </ScrollView>
                        </View>
                    </Pressable>
                </Modal>
            )}
            
        </View>
    ); 
}

export default AddBatsmanAndBowler;