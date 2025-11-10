import React, {useState, useEffect, useRef, memo, useCallback} from 'react'
import {View, Text, Pressable} from 'react-native';
import tailwind from 'twrnc';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import axiosInstance from '../screen/axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import { setInningScore, setBatsmanScore, setBowlerScore, getMatch, getCricketBattingStriker, addCricketWicketFallen, setInningStatus, setCurrentInningNumber } from '../redux/actions/actions';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { useWebSocket } from '../context/WebSocketContext';

export const UpdateCricketScoreCard = memo(({match, currentScoreEvent, isWicketModalVisible, setIsWicketModalVisible, addCurrentScoreEvent, setAddCurrentScoreEvent, runsCount, wicketTypes, game, wicketType, setWicketType, selectedFielder, currentBatsman, currentBowler, dispatch, batTeam, setIsFielder, isBatsmanStrikeChange, currentWicketKeeper, currentInning }) => {
    const {wsRef, subscribe} = useWebSocket();
    const inningStatus = useSelector(state => state.cricketMatchInning.inningStatus);
    const [isWebSocketReady, setIsWebSocketReady] = useState(false);
    const isMountedRef = useRef(true);
    const lastPayloadRef = useRef(null);
    const dispatchRef = useRef(dispatch);
    
    // Update dispatch ref when dispatch changes
    useEffect(() => {
        dispatchRef.current = dispatch;
    }, [dispatch]);

    const handleCurrentScoreEvent = useCallback((item) => {
        const eventItem = item.toLowerCase().replace(/\s+/g, '_');
        setAddCurrentScoreEvent((prevEvent) => {
            if(!prevEvent.includes(eventItem)){
                return [...prevEvent, eventItem];
            } else {
                return prevEvent.filter((it) => it !== eventItem)
            }
        })

        if (eventItem === "wicket" ){
            setIsWicketModalVisible(true);
        }
    }, [setAddCurrentScoreEvent, setIsWicketModalVisible]);
    

    const handleScorecard = useCallback(async (temp) => {
        const batting = currentBatsman?.find((item) => (item.is_currently_batting === true && item.is_striker === true));
            if(addCurrentScoreEvent.length === 0){
                try {
                    const data = {
                        match_public_id: match?.public_id,
                        batsman_team_public_id: batTeam,
                        batsman_public_id: batting?.player?.public_id,
                        bowler_public_id: currentBowler[0]?.player?.public_id,
                        runs_scored: temp,
                        inning_number: Number(currentInning.slice(-1))
                    }
                    const authToken = await AsyncStorage.getItem("AccessToken")
                    const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateCricketRegularScore`, data, {
                        headers: {
                            'Authorization': `bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    console.log("Update Score: ", response.data)

                } catch (err) {
                    console.error("Failed to add the runs and balls: ", err)
                }
            } else if(addCurrentScoreEvent[0] === "no_ball"){
                try {
                    const data = {
                        match_public_id: match?.public_id,
                        batting_team_public_id: batTeam,
                        batsman_public_id: batting?.player?.public_id,
                        bowler_public_id: currentBowler[0]?.player?.public_id,
                        runs_scored: temp,
                        inning_number: Number(currentInning.slice(-1))
                    }

                    const authToken = await AsyncStorage.getItem("AccessToken")
                    const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateCricketNoBall`, data, {
                        headers: {
                            'Authorization': `bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                    })
                    console.log("No Ball: ", response.data)

                } catch (err) {
                    console.error("Failed to add the runs and balls: ", err)
                }
            } else if(addCurrentScoreEvent[0] === "wide") {
                try {
                    const data = {
                        match_public_id: match?.public_id,
                        batting_team_public_id: batTeam,
                        batsman_public_id: batting?.player?.public_id,
                        bowler_public_id: currentBowler[0]?.player?.public_id,
                        runs_scored: temp,
                        inning_number: Number(currentInning.slice(-1))
                    }

                    const authToken = await AsyncStorage.getItem("AccessToken")
                    const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateCricketWide`, data, {
                        headers: {
                            'Authorization': `bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    console.log("Wide Ball: ", response.data)

                } catch (err) {
                    console.error("Failed to add the runs and balls: ", err)
                }
            } else if(addCurrentScoreEvent[0] === "wicket") {
                try {
                    const data = {
                        match_public_id: match.public_id,
                        batting_team_public_id: batTeam,
                        bowling_team_public_id: match.homeTeam.public_id === batTeam?match.awayTeam.public_id: match.homeTeam.public_id,
                        Batsman_public_id: batting?.player.public_id,
                        bowler_public_id: currentBowler[0]?.player?.public_id,
                        wicket_type: wicketType,
                        fielder_public_id: wicketType === "Stamp" ? currentWicketKeeper?.public_id : null,
                        runs_scored: temp,
                        bowl_type: addCurrentScoreEvent.length == 2 ? addCurrentScoreEvent[1] : null,
                        toggle_striker: isBatsmanStrikeChange,
                        inning: Number(currentInning.slice(-1))
                    }

                    if (wicketType === 'Run Out' || wicketType === "Catch") {
                        data.fielder_public_id = selectedFielder.public_id
                    }

                    const newMessage = {
                        "type": "UPDATE_SCORE",
                        "payload": {
                            ...data,
                            "event_type":"wicket" 
                        }
                    }
                    wsRef.current.send(JSON.stringify(newMessage));
                } catch (err) {
                    console.error("Failed to add the runs and balls: ", err)
                }
        }
    }, [currentBatsman, currentBowler, addCurrentScoreEvent, match, batTeam, currentInning, wsRef, wicketType, selectedFielder, currentWicketKeeper, isBatsmanStrikeChange]);

    const handleWicketType = useCallback((item) => {
        if(item === "Run Out"){
            setWicketType(item);
            setIsFielder(true);
        } else if(item === "Catch"){
            setWicketType(item);
            setIsFielder(true);
        } else {
            setWicketType(item);
        }
    }, [setWicketType, setIsFielder]);

    return (
        <View>
            <View style={tailwind`p-4 bg-white rounded-xl`}>
                <Text style={tailwind`text-lg font-bold`}>Update Score</Text>
                <View style={tailwind`flex-row justify-between py-2`}>
                    {currentScoreEvent.map((item, index) => (
                        <Pressable key={index} onPress={() => { handleCurrentScoreEvent(item)}} style={tailwind`flex-row rounded-lg shadow-md bg-white p-2`}>
                            <MaterialIcon name={addCurrentScoreEvent.includes(item.toLowerCase().replace(/\s+/g, '_'))?"check-box": "check-box-outline-blank"} size={24} color={addCurrentScoreEvent.includes(item.toLowerCase().replace(/\s+/g, '_'))?"green":"gray"}/>
                            <Text>{item}</Text>
                        </Pressable>
                    ))}
                </View>
                {isWicketModalVisible && (
                    <View style={tailwind`mt-4`}>
                        <Text style={tailwind`text-base font-semibold text-gray-700 mb-2`}>Wicket Types</Text>
                        <View style={tailwind`flex-row flex-wrap`}>
                            {wicketTypes.map((item, index) => (
                                <Pressable 
                                    key={index} 
                                    onPress={() => {handleWicketType(item)}}
                                    style={[tailwind`rounded-lg shadow-md px-4 py-2 mr-2 mb-2`, wicketType === item ? tailwind`bg-red-400` : tailwind`bg-gray-100`]}
                                >
                                    <Text style={tailwind`text-gray-800 text-lg`}>{item}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                )}

                <View style={tailwind`flex-row justify-between py-2`}>
                    <Text style={tailwind`text-lg font-bold`}>Runs/Ball</Text>
                    {runsCount.map((item, index) => (
                        <Pressable onPress={() => {handleScorecard(item)}} style={tailwind`rounded-lg shadow-md bg-white p-2`} key={index}>
                            <Text>{item}</Text>
                        </Pressable>
                    ))}
                    
                </View>
            </View>
        </View>
    );
});

UpdateCricketScoreCard.displayName = 'UpdateCricketScoreCard';

export default UpdateCricketScoreCard;