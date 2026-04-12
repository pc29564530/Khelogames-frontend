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

export const UpdateCricketScoreCard = memo(({match, currentScoreEvent, isWicketModalVisible, setIsWicketModalVisible, addCurrentScoreEvent, setAddCurrentScoreEvent, runsCount, wicketTypes, game, wicketType, setWicketType, selectedFielder, currentBatsman, currentBowler, dispatch, batTeam, setIsFielderModalVisible, isBatsmanStrikeChange, currentWicketKeeper, currentInningNumber, setIsCurrentBatsmanModalVisible, setSelectedOutBatsman }) => {
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
            setIsFielderModalVisible(true);
        } else {
            setWicketType(item);
        }
    }, [setWicketType, setIsFielderModalVisible]);

    return (
        <View style={{backgroundColor: '#0f172a'}}>
            {/* Global Error */}
            {error?.global && (
                <View style={[tailwind`mb-3 p-3 rounded-lg`, {backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130'}]}>
                    <Text style={[tailwind`text-xs`, {color: '#fca5a5'}]}>{error.global}</Text>
                </View>
            )}

            {/* Extras Card */}
            <View style={[tailwind`mb-4 rounded-lg overflow-hidden`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155'}]}>
                <View style={[tailwind`flex-row justify-between items-center px-4 py-2`, {borderBottomWidth: 1, borderColor: '#334155'}]}>
                    <Text style={[tailwind`text-md`, {color: '#94a3b8'}]}>Extras</Text>
                    <Text style={[tailwind`text-md`, {color: '#94a3b8'}]}>Inning {currentInningNumber}</Text>
                </View>
                <View style={tailwind`flex-row flex-wrap gap-2 px-4 py-3`}>
                    {currentScoreEvent.map((item, index) => {
                        const key = item.toLowerCase().replace(/\s+/g, '_');
                        const isActive = addCurrentScoreEvent.includes(key);
                        return (
                            <Pressable
                                key={index}
                                onPress={() => handleCurrentScoreEvent(item)}
                                style={[
                                    tailwind`flex-row items-center rounded-lg px-3 py-2`,
                                    {
                                        backgroundColor: isActive ? '#f8717120' : '#0f172a',
                                        borderWidth: 1,
                                        borderColor: isActive ? '#f87171' : '#334155',
                                    },
                                ]}
                            >
                                <MaterialIcon
                                    name={isActive ? 'check-box' : 'check-box-outline-blank'}
                                    size={20}
                                    color={isActive ? '#f87171' : '#94a3b8'}
                                />
                                <Text style={[tailwind`ml-2 text-sm font-medium`, {color: isActive ? '#f1f5f9' : '#cbd5e1'}]}>
                                    {item}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {/* Wicket Types Card */}
            {isWicketModalVisible && (
                <View style={[tailwind`mb-4 rounded-lg overflow-hidden`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155'}]}>
                    <View style={[tailwind`flex-row justify-between items-center px-4 py-2`, {borderBottomWidth: 1, borderColor: '#334155'}]}>
                        <Text style={[tailwind`text-md`, {color: '#94a3b8'}]}>Wicket Type</Text>
                    </View>
                    <View style={tailwind`flex-row flex-wrap px-4 py-3`}>
                        {wicketTypes.map((item, index) => {
                            const isActive = wicketType === item;
                            return (
                                <Pressable
                                    key={index}
                                    onPress={() => handleWicketType(item)}
                                    style={[
                                        tailwind`rounded-lg px-4 py-2 mr-2 mb-2`,
                                        {
                                            backgroundColor: isActive ? '#f87171' : '#0f172a',
                                            borderWidth: 1,
                                            borderColor: isActive ? '#f87171' : '#334155',
                                        },
                                    ]}
                                >
                                    <Text style={[tailwind`text-sm font-semibold`, {color: isActive ? '#ffffff' : '#cbd5e1'}]}>
                                        {item}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            )}

            {/* Runs / Ball Card */}
            <View style={[tailwind`mb-4 rounded-lg overflow-hidden`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155'}]}>
                <View style={[tailwind`flex-row justify-between items-center px-4 py-2`, {borderBottomWidth: 1, borderColor: '#334155'}]}>
                    <Text style={[tailwind`text-md`, {color: '#94a3b8'}]}>Runs / Ball</Text>
                </View>
                <View style={tailwind`flex-row flex-wrap gap-2 px-4 py-3`}>
                    {runsCount.map((item, index) => (
                        <Pressable
                            key={index}
                            onPress={() => handleScorecard(item)}
                            style={[
                                tailwind`rounded-lg items-center justify-center`,
                                {
                                    backgroundColor: '#0f172a',
                                    borderWidth: 1,
                                    borderColor: '#334155',
                                    width: 44,
                                    height: 44,
                                },
                            ]}
                        >
                            <Text style={[tailwind`text-lg font-bold`, {color: '#f1f5f9'}]}>{item}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>
        </View>
    );
});

UpdateCricketScoreCard.displayName = 'UpdateCricketScoreCard';

export default UpdateCricketScoreCard;