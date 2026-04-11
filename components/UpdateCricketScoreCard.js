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
import { validateCricketScoreForm } from '../utils/validation/cricketScoreValidation';
import { handleInlineError } from '../utils/errorHandler';

export const UpdateCricketScoreCard = memo(({match, currentScoreEvent, isWicketModalVisible, setIsWicketModalVisible, addCurrentScoreEvent, setAddCurrentScoreEvent, runsCount, wicketTypes, game, wicketType, setWicketType, selectedFielder, currentBatsman, currentBowler, dispatch, batTeam, setIsFielder, isBatsmanStrikeChange, currentWicketKeeper, currentInningNumber, setIsCurrentBatsmanModalVisible, setSelectedOutBatsman }) => {
    const {wsRef, subscribe} = useWebSocket();
    const inningStatus = useSelector(state => state.cricketMatchInning.inningStatus);
    const [isWebSocketReady, setIsWebSocketReady] = useState(false);
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
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
        // Regular Score Update (no extras)
        if(addCurrentScoreEvent.length === 0){
            try {
                const formData = {
                    match_public_id: match?.public_id,
                    batsman_team_public_id: batTeam,
                    batsman_public_id: batting?.player.public_id,
                    bowler_public_id: currentBowler[0]?.player?.public_id,
                    runs_scored: temp,
                    inning_number: currentInningNumber,
                    addCurrentScoreEvent: []
                }

                console.log("Form Datas: ", formData)

                // Validate the form data
                const validation = validateCricketScoreForm(formData);
                if (!validation.isValid) {
                    setError({
                        global: null,
                        fields: validation.errors,
                    });
                    console.error("Validation errors:", validation.errors);
                    return;
                }

                setError({
                    global: null,
                    fields: {},
                })

                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateCricketRegularScore`, {
                    match_public_id: formData.match_public_id,
                    batsman_team_public_id: formData.batsman_team_public_id,
                    batsman_public_id: formData.batsman_public_id,
                    bowler_public_id: formData.bowler_public_id,
                    runs_scored: formData.runs_scored,
                    inning_number: formData.inning_number
                }, {
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });

            } catch (err) {
                const backendErrors = err?.response?.data?.error?.fields || {};
                if(err?.response?.data?.error?.code === "FORBIDDEN") {
                    setError({
                        global: err?.response?.data?.error?.message,
                        fields: {},
                    })
                } else {
                    setError({
                        global: "Unable to update batting and runs and ball",
                        fields: backendErrors,
                    });
                }
                console.log("Failed to add the runs and balls: ", err.response.data.error)
            }
        }
        
        // No Ball Update
        else if(addCurrentScoreEvent[0] === "no_ball"){
            try {
                const formData = {
                    match_public_id: match?.public_id,
                    batsman_team_public_id: batTeam,
                    batsman_public_id: batting?.player?.public_id,
                    bowler_public_id: currentBowler[0]?.player?.public_id,
                    runs_scored: temp,
                    inning_number: currentInningNumber,
                    addCurrentScoreEvent: ['no_ball']
                }

                // Validate the form data
                const validation = validateCricketScoreForm(formData);
                if(!validation.isValid){
                     setError({
                        global: null,
                        fields: validation.errors,
                    });
                    console.error("Validation errors for no_ball:", validation.errors);
                    return;
                }

                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateCricketNoBall`, {
                    match_public_id: formData.match_public_id,
                    batting_team_public_id: formData.batsman_team_public_id,
                    batsman_public_id: formData.batsman_public_id,
                    bowler_public_id: formData.bowler_public_id,
                    runs_scored: formData.runs_scored,
                    inning_number: formData.inning_number
                }, {
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })

                setError({
                    global: null,
                    fields: {},
                });
                setWicketType([])

            } catch (err) {
                const backendErrors = err?.response?.data?.error?.fields || {};
                if(err?.response?.data?.error?.code === "FORBIDDEN") {
                    setError({
                        global: err?.response?.data?.error?.message,
                        fields: {},
                    })
                } else {
                    setError({
                        global: "Unable to add no ball",
                        fields: backendErrors,
                    });
                }
                console.log("Unable to add no ball: ", err);
                console.error("Failed to add no ball: ", err)
            }
        }
        // Wide Ball Update
        else if(addCurrentScoreEvent[0] === "wide") {
            try {
                const formData = {
                    match_public_id: match?.public_id,
                    batsman_team_public_id: batTeam,
                    batsman_public_id: batting?.player?.public_id,
                    bowler_public_id: currentBowler[0]?.player?.public_id,
                    runs_scored: temp,
                    inning_number: currentInningNumber,
                    addCurrentScoreEvent: ['wide']
                }

                // Validate the form data
                const validation = validateCricketScoreForm(formData);
                if(!validation.isValid){
                     setError({
                        global: null,
                        fields: validation.errors,
                    });
                    console.log("Unable to get wide ball: ", validation.errors);
                    return;
                }

                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateCricketWide`, {
                    match_public_id: formData.match_public_id,
                    batting_team_public_id: formData.batsman_team_public_id,
                    batsman_public_id: formData.batsman_public_id,
                    bowler_public_id: formData.bowler_public_id,
                    runs_scored: formData.runs_scored,
                    inning_number: formData.inning_number
                }, {
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });



                setError({
                    global: null,
                    fields: {},
                });

            } catch (err) {
                const backendErrors = err?.response?.data?.error?.fields || {};
                if(err?.response?.data?.error?.code === "FORBIDDEN") {
                    setError({
                        global: err?.response?.data?.error?.message,
                        fields: {},
                    })
                } else {
                    setError({
                        global: "Unable to update wide ball",
                        fields: backendErrors,
                    });
                }
                console.log("Unable to update wide ball: ", err);
            }
        }
        // Wicket Update
        else if(addCurrentScoreEvent[0] === "wicket") {
            try {
                const bowlingTeamId = match.homeTeam.public_id === batTeam ? match.awayTeam.public_id : match.homeTeam.public_id;
                const currentInningStatus = inningStatus?.[String(currentInningNumber)] || {};
                const currentWicketsFallen = Number(currentInningStatus?.wickets ?? 0);
                const currentBallNumber = Number(currentBowler?.[0]?.ball_number ?? 0);

                const formData = {
                    match_public_id: match.public_id,
                    batsman_team_public_id: batTeam,
                    bowling_team_public_id: bowlingTeamId,
                    batsman_public_id: batting?.player.public_id,
                    bowler_public_id: currentBowler[0]?.player?.public_id,
                    wicket_type: wicketType,
                    fielder_public_id: wicketType === "Stamp" ? currentWicketKeeper?.public_id :
                                       (wicketType === 'Run Out' || wicketType === "Catch") ? selectedFielder?.public_id : null,
                    runs_scored: temp,
                    bowl_type: addCurrentScoreEvent.length === 2 ? addCurrentScoreEvent[1] : null,
                    inning_number: currentInningNumber,
                    addCurrentScoreEvent: addCurrentScoreEvent
                }

                // Validate the form data
                const validation = validateCricketScoreForm(formData);
                if(!validation.isValid){
                     setError({
                        global: null,
                        fields: validation.errors,
                    });
                    console.log("Unable to add wicket", validation.errors);
                    return;
                }
                const data = {
                    match_public_id: match.public_id,
                    batting_team_public_id: batTeam,
                    batsman_public_id: batting?.player.public_id,
                    bowler_public_id: currentBowler[0]?.player?.public_id,
                    fielder_public_id: wicketType === "Stamp" ? currentWicketKeeper?.public_id :
                        (wicketType === 'Run Out' || wicketType === "Catch") ? selectedFielder?.public_id : null,
                    runs_scored: temp,
                    inning_number: currentInningNumber,
                    wicket_number: currentWicketsFallen + 1,
                    ball_number: currentBallNumber,
                    wicket_type: wicketType,
                    bowl_type: addCurrentScoreEvent.length === 2 ? addCurrentScoreEvent[1] : null,
                    crossed_before_catch: wicketType === "Catch" ? !!isBatsmanStrikeChange : false,
                }
                const authToken = await AsyncStorage.getItem("AccessToken")

                const response = await axiosInstance.post(`${BASE_URL}/${game.name}/wickets`, data, {
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });

            } catch (err) {
                console.log("Wicket Error: ", err)
                const backendErrors = err?.response?.data?.error?.fields || {};
                if(err?.response?.data?.error?.code === "FORBIDDEN") {
                        setError({
                            global: err?.response?.data?.error?.message,
                            fields: {},
                        })
                    } else {
                        setError({
                            global: "Unable to update wicket",
                            fields: backendErrors,
                        });
                    }
                    console.log("Unable to update wicket: ", err);
                }
        }
    }, [currentBatsman, currentBowler, addCurrentScoreEvent, match, batTeam, currentInningNumber, wsRef, wicketType, selectedFielder, currentWicketKeeper, isBatsmanStrikeChange, game, setError]);

    const handleWicketType = useCallback((item) => {
        if(item === "Run Out"){
            setWicketType(item);
            setIsCurrentBatsmanModalVisible(true);
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
                <Text style={tailwind`text-lg font-bold text-gray-900 mb-3`}>Update Score</Text>
                {/* Global Error Display */}
                {error?.global && (
                    <View style={tailwind`bg-red-50 border border-red-200 rounded-lg p-3 mb-3`}>
                        <Text style={tailwind`text-sm font-semibold text-red-800`}>{error.global}</Text>
                    </View>
                )}

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