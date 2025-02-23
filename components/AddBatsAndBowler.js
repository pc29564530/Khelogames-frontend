import {useState} from 'react';
import { View, Text, Pressable, Modal } from "react-native";
import tailwind from "twrnc";
import { AddCricketBowler } from "./AddCricketBowler";
import { AddCricketBatsman } from "./AddCricketBatsman";
import { useSelector, useDispatch } from 'react-redux';

const AddBatsmanAndBowler = ({match, setAddBatsmanAndBowlerModalVisible}) => {
    const [isBowlTeamPlayerModalVisible, setIsBowlTeamPlayerModalVisible] = useState(false);
    const [isBatTeamPlayerModalVisible, setIsBatTeamPlayerModalVisible] = useState(false);
    const game = useSelector((state) => state.sportReducers.game);
    const homePlayer = useSelector(state => state.teams.homePlayer)
    const awayPlayer = useSelector(state =>  state.teams.awayPlayer);
    const batTeam = useSelector(state => state.cricketMatchScore.batTeam);
    const bowling = useSelector((state) => state.cricketPlayerScore.bowlingScore);
    const dispatch = useDispatch();
    const bowlerToBeBowled = batTeam?.id === match.homeTeam.id ? awayPlayer?.filter((player) => !bowling?.innings?.some(
        (bowler) => bowler.bowling_status && bowler.player.id === player.id
        )) : homePlayer?.filter((player) => !bowling?.innings.some(
        (bowler) => bowler.bowling_status && bowler.player.id === player.id
    ));

    return (
        <Pressable onPress={() => setAddBatsmanAndBowlerModalVisible(false)} style={tailwind`py-2`}>
            <View style={tailwind`flex-row items-start justify-between mb-4`}>
                <Pressable onPress={() => {setIsBatTeamPlayerModalVisible(true)}} style={tailwind`rounded-md shadow-md p-8 items-start`}>
                    <Text style={tailwind`text-black text-lg`}>Striker</Text>
                </Pressable>
                <Pressable onPress={() => {setIsBatTeamPlayerModalVisible(true)}}style={tailwind`rounded-md shadow-md p-8 items-start`}>
                    <Text style={tailwind`text-black text-lg`}>Non-Striker</Text>
                </Pressable>
            </View>
            <View style={tailwind`flex-row items-start mb-4`}>
                <Pressable onPress={() => {setIsBowlTeamPlayerModalVisible(true)}} style={tailwind`rounded-md shadow-md p-8 items-center`}>
                    <Text style={tailwind`text-black text-lg`}>Bowler</Text>
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
                            <AddCricketBatsman match={match} batTeam={batTeam}  homePlayer={homePlayer} awayPlayer={awayPlayer} game={game} dispatch={dispatch}/>
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
                            <AddCricketBowler match={match} batTeam={batTeam}  homePlayer={homePlayer} awayPlayer={awayPlayer} game={game} dispatch={dispatch} bowling={bowling} bowlerToBeBowled={bowlerToBeBowled}/>
                        </View>
                    </Pressable>
                </Modal>
            )}
            
        </Pressable>
    ); 
}

export default AddBatsmanAndBowler;