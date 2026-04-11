import {useState, useEffect, useCallback, useMemo} from 'react';
import {View, Text,Pressable,Modal, Alert, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions} from 'react-native';
import tailwind from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from './axios_config';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { convertBallToOvers } from '../utils/ConvertBallToOvers';
import { UpdateCricketScoreCard } from '../components/UpdateCricketScoreCard';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { setEndInning, setBatsmanScore, setBowlerScore, addBowler, getHomePlayer, getAwayPlayer, getCricketBattingScore, getCricketBowlingScore, getCurrentBatsmanScore, getcurrentBowlerScore, getCurrentBowlerScore } from '../redux/actions/actions';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AddBatsmanAndBowler from '../components/AddBatsAndBowler';
import { CricketLiveMatchModal } from '../Modals/CricketLiveMatch';
import { AddCricketBatsman } from '../components/AddCricketBatsman';
import { AddCricketBowler } from '../components/AddCricketBowler';
import SetCurrentBowler from '../components/SetCurrentBowler';
import { formattedDate } from '../utils/FormattedDateTime';
import { addCricketScoreServices } from '../services/cricketMatchServices';
 import { setCurrentInning, setInningStatus, setBatTeam, setCurrentInningNumber, setCurrentBatsman, setCurrentBowler } from '../redux/actions/actions';
import { renderInningScore } from './Matches';
import Animated, {useSharedValue, useAnimatedScrollHandler, Extrapolation, interpolate, useAnimatedStyle} from 'react-native-reanimated';
import { current } from '@reduxjs/toolkit';
import { selectCurrentBatsmen, selectCurrentBowler } from '../redux/reducers/cricketMatchPlayerScoreReducers';
import { getLeadTrailStatus } from '../screen/CricketMatchPage'

const CricketLive = ({match, parentScrollY, headerHeight, collapsedHeader}) => {
    const navigation = useNavigation()
    const currentInning = useSelector(state => state.cricketMatchInning.currentInning);
    const currentInningNumber = useSelector(state => state.cricketMatchInning.currentInningNumber);
    const inningStatus = useSelector(state => state.cricketMatchInning.inningStatus);
    const currentBatsman = useSelector(state => selectCurrentBatsmen(state, currentInningNumber));
    const currentBowler = useSelector(state => selectCurrentBowler(state, currentInningNumber));

    const game = useSelector(state => state.sportReducers.game);
    const batTeam = useSelector(state => state.cricketMatchScore.batTeam);
    const batting = useSelector(state => state.cricketPlayerScore.battingScore);
    const bowling = useSelector(state => state.cricketPlayerScore.bowlingScore);
    const homePlayer = useSelector(state => state.teams.homePlayer);
    const awayPlayer = useSelector(state => state.teams.awayPlayer);
    const cricketToss = useSelector(state => state.cricketToss.cricketToss);

    const [isModalBattingVisible, setIsModalBattingVisible] = useState(false);
    const [isModalBowlingVisible, setIsModalBowlingVisible] = useState(false);
    const [followOn, setFollowOn] = useState(false);
    const [nextInning, setNextInning] = useState(null);
    const [currentLiveScore, setCurrentLiveScore] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [isBatsmanStrikeChange,setIsBatsmanStrikeChange] = useState(false);
    const [wicketType, setWicketType] = useState("");
    const [addCurrentScoreEvent, setAddCurrentScoreEvent] = useState([]);
    const [inningVisible, setInningVisible] = useState(false);
    const currentScoreEvent = ["No Ball", "Wicket", "Wide", "Leg Bye"];
    const wicketTypes = ["Run Out", "Stamp", "Catch", "Hit Wicket", "Bowled", "LBW"];
    const [isFielder, setIsFielder] = useState(false);
    const [selectedFielder, setSelectedFielder] = useState();
    const [selectedOutBatsman, setSelectedOutBatsman] = useState(null);
    const [selectedBowlerType, setSelectedBowlerType] = useState("");
    const [isCurrentBatsmanModalVisible, setIsCurrentBatsmanModalVisible] = useState(false);
    const [wicketsData, setWicketsData] = useState([]);
    const [selectNextBowler, setSelectNextBowler] = useState(bowling.innings);   
    const [isWicketModalVisible, setIsWicketModalVisible] = useState(false);
    const [isBatsmanStrikerChange, setIsBatsmanStrikerChange] = useState(false);
    const [isCurrentInningEnded, setIsCurrentInningEnded] = useState(false);
    const [addBatsmanModalVisible, setAddBatsmanModalVisible] = useState(false);
    const [addBowlerModalVisible, setAddBowlerModalVisible] = useState(false);
    const [isStartNewInningModalVisible, setIsStartNewInningModalVisible] = useState(false);
    const [isModalBatsmanStrikerChange, setIsModalBatsmanStrikeChange] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const homeTeamID = match?.homeTeam?.id;
    const awayTeamID = match?.awayTeam?.id;
    const homeTeamPublicID = match?.homeTeam?.public_id;
    const awayTeamPublicID = match?.awayTeam?.public_id;
    const bowlTeamPublicID = match.awayTeam.public_id === batTeam ? match.homeTeam.public_id : match.awayTeam.public_id;

    // Get current fielders (bowling team players)
    const currentFielder = batTeam === match.homeTeam.public_id ? awayPlayer : homePlayer;

    const runsCount = [0, 1, 2, 3, 4, 5, 6];
    const dispatch = useDispatch();
    const {height: sHeight, width: sWidth} = Dimensions.get("window");
    const currentScrollY = useSharedValue(0);
    const handlerScroll = useAnimatedScrollHandler({
        onScroll:(event) => {
            if(parentScrollY.value === collapsedHeader){
                parentScrollY.value = currentScrollY.value
            } else {
                parentScrollY.value = event.contentOffset.y
            }
        }
    })

    // Content animation style
    const contentStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            parentScrollY.value,
            [0, 50],
            [1, 1],
            Extrapolation.CLAMP
        );
        return {
            opacity
        };
    });

    const MAX_INNINGS = {
        T20: 2,
        ODI: 2,
        Test: 4,
    };
    
    //check for next inning
   const showNextInning = currentInningNumber < MAX_INNINGS[match.match_format];
    // useEffect(() => {
    //     if(match) {
    //         setIsLoading(false);
    //     }
    // }, [match]);

    useEffect(() => {
        const fetchCricketCurrentInning = async () => {
            try {
                setLoading(true);
                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketCurrentInning/${match.public_id}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                })
                const item = response.data;
                dispatch(setBatTeam(item.data.batting_team.public_id))
                dispatch(setCurrentInningNumber(item.data.inning.inning_number))
                dispatch(setInningStatus(item.data.inning.inning_status, item.data.inning.inning_number))
            } catch (err) {
                const backendError = err?.response?.data?.error?.fields;
                setError({
                    global: "Unable to get current inning",
                    fields: backendError,
                })
                console.error("Failed to get cricket inning : ", err)
            } finally {
                setLoading(false);
            }
        }
        fetchCricketCurrentInning()
    }, [])

    useEffect(() => {
        console.log("Bat Team: ", batTeam);
    }, [batTeam]);

    useEffect(() => {
        if (cricketToss && currentInningNumber === 1) {
            if (cricketToss?.tossDecision === "Batting") {
                setCurrentLiveScore(cricketToss?.tossWonTeam?.public_id === homeTeamPublicID ? homeTeamPublicID : awayTeamPublicID);
            } else {
                setCurrentLiveScore(cricketToss?.tossWonTeam?.public_id === homeTeamPublicID ? awayTeamPublicID : homeTeamPublicID);
            }
        } else if(currentInningNumber === 2 && (match.match_format === "ODI" || match.match_format === "T20")) {
             const firstInningBattingTeam = cricketToss?.tossDecision === "Batting" 
            ? (cricketToss?.tossWonTeam?.public_id === homeTeamPublicID ? homeTeamPublicID : awayTeamPublicID)
            : (cricketToss?.tossWonTeam?.public_id === homeTeamPublicID ? awayTeamPublicID : homeTeamPublicID);
            const secondInningBattingTeam = firstInningBattingTeam === homeTeamPublicID ? awayTeamPublicID : homeTeamPublicID;
            setCurrentLiveScore(secondInningBattingTeam);
        }
        // added the test inning update here 
    }, [cricketToss, homeTeamPublicID, awayTeamPublicID]);

    const toggleMenu = () => setMenuVisible(!menuVisible);

    const fetchCurrentBatsman = async () => {
        try {
            setLoading(true);
            const authToken = await AsyncStorage.getItem("AccessToken");
            const data = {
                match_public_id: match.public_id,
                team_public_id: batTeam,
                inning_number: currentInningNumber
            }
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCurrentBatsman` , {
                params: {
                    match_public_id: match.public_id,
                    team_public_id: batTeam,
                    inning_number: currentInningNumber
                },
                headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                },
            })
            const item = response.data;
            if(item.success && item.data) {
                dispatch(setCurrentBatsman(item?.data?.batsman))
            } else {
                dispatch(setCurrentBatsman([]))
            }

        } catch (err) {
            const backendError = err?.response?.data?.error?.fields;
            setError({
                global: "Unable to get current batsman",
                fields: backendError,
            })
            console.error("Failed to fetch current batsman: ", err);
        } finally {
            setLoading(false);
        }
    }

    const fetchCurrentBowler = async () => {
        try {
            setLoading(true);
            const authToken = await AsyncStorage.getItem("AccessToken");
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCurrentBowler`, {
                params:{
                    match_public_id: match.public_id,
                    team_public_id: bowlTeamPublicID,
                    inning_number: currentInningNumber
                },
                headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                },
            })
            const item = response.data;
            if(item.success && item.data) {
                dispatch(setCurrentBowler(item?.data?.bowler))
            } else {
                dispatch(setCurrentBowler([]))
            }
        } catch (err) {
            console.error("Failed to fetch current batsman: ", err);
        } finally {
            setLoading(false);
        }
    }

    useFocusEffect(useCallback(() => {
        fetchCurrentBatsman();
        fetchCurrentBowler();
    }, []))

        const handleEndInning = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                const data = {
                    match_public_id: match.public_id,
                    team_public_id: batTeam,
                    inning_number: currentInningNumber
                }
    
                const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateCricketEndInning`, data,{
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                })
                const item = response.data;
                if(item.data){
                    setIsCurrentInningEnded(true)
                }
                dispatch(setEndInning(item?.data.inning));
                dispatch(setBatsmanScore(item.data.batsman));
                dispatch(setBowlerScore(item.data.bowler));
                dispatch(setInningStatus("completed", currentInningNumber));
            } catch (err) {
                const backendError = err?.response?.data?.error?.fields;
                setError({
                    global: "Unable to end inning",
                    fields: backendError,
                })
                console.error("Failed to end inning: ", err);
            }
        }

        const handleMatchEnd = async () => {
            try {
                var winningTeam = null;
                if(isCurrentInningEnded && match.innings.length== 2){
                    if(match.innings?.[0].score.score > match.innings?.[1].score.score){
                        winningTeam = match.innings?.[0].team.public_id;
                    } else if(match.innings?.[0].score.score < match.innings?.[1].score.score){
                        winningTeam = match.innings?.[1].team.public_id;
                    }
                }
                const data = {
                    match_public_id: match.public_id,
                    result: winningTeam
                }
                const authToken = await AsyncStorage.getItem("AccessToken");
                const matchEndResponse = await axiosInstance.put(`${BASE_URL}/${game.name}/updateMatchResult`, data, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
            } catch(err) {
                console.error("Failed to end match: ", err);
            }
        }

        useEffect(() => {
            if(inningStatus === "completed"){
                setInningVisible(true);
            }
        }, [inningStatus]);

        const getNextInning = () => {
            if (inningStatus === "completed" && currentInningNumber === 1){
                return 2;
            } else if (inningStatus === "completed" && currentInningNumber === 2) {
                return 3;
            } else if (inningStatus === "completed" && currentInningNumber === 3) {
                return 4;
            } else {
                return null;
            }
        };

    const getCurrentInningScore = (scoreArray) => {
        return scoreArray?.find((inning) => inning.inning_number === currentInningNumber);
    }

    const handleNextInning = async (teamPublicID) => {        
        try {
            const matchPublicID = match.public_id;
            await addCricketScoreServices({game, dispatch, matchPublicID, teamPublicID, currentInningNumber, followOn})
        } catch (err) {
            const backendErrors = err?.response?.data?.error?.fields;
            if(err?.response?.data?.error?.code === "FORBIDDEN") {
                setError({
                    global: err?.response?.data?.error?.message,
                    fields: {},
                })
            } else {
                setError({
                    global: "Unable to add cricket score for next inning",
                    fields: backendErrors,
                });
            }
            console.error("Failed to start next inning: ", err);
            dispatch(setCurrentInningNumber(currentInningNumber-1))
        }
    }

    const handleSelectBowler = () => {
            return (
                <SetCurrentBowler match={match} batTeam={batTeam} homePlayer={homePlayer} awayPlayer={awayPlayer} game={game} dispatch={dispatch} bowlingTeamPlayer={players} currentBowler={currentBowler} error={error} setError={setError} inningNumber={currentInningNumber} setIsModalBowlingVisible={setIsModalBowlingVisible}/>
            )
    }

    const currentWicketKeeper = batTeam !== homeTeamPublicID ? homePlayer.find((item) => item.position === "WK"): awayPlayer.find((item) => item.position === "WK");

    const innings = bowling?.innings?.[currentInningNumber] ?? [];
    const players = batTeam === homeTeamPublicID ? (awayPlayer ?? []) : (homePlayer ?? []);
    const bowlerToBeBowled = players.filter(
    (player) =>
        !innings.some(
        (bowler) => bowler?.bowling_status && bowler?.player?.id === player?.id
        )
    );

    const existingBowler = players.filter((player) =>
    innings.some((bowler) => bowler?.player?.id === player?.id)
    );

    const checkFollowOn = useCallback(() => {
        if (match?.match_format === "Test" && currentInningNumber === 2) {
            const firstInningScore = match?.homeScore?.find((inning) => inning.inning_number === 1);
            const secondInningScore = match?.awayScore?.find((inning) => inning.inning_number === 1);
            
            // Follow-on rule: If the team batting second scores less than 200 runs 
            // and is more than 200 runs behind the first innings total
            if (firstInningScore && secondInningScore) {
                const difference = firstInningScore.score - secondInningScore.score;
                if (secondInningScore.score < 200 && difference > 200) {
                    return true; // Follow-on is applicable
                }
            }
        }
        return false;
    }, [match, currentInningNumber]);
    // Check if follow-on is applicable
    const isFollowOnApplicable = useMemo(() => {
        return checkFollowOn();
    }, [checkFollowOn]);

    const handleStartInning = async () => {
        setError({ global: null, fields: {} });
        try {
            setLoading(true);
            const authToken = await AsyncStorage.getItem("AccessToken");
            const data = {
                match_public_id: match.public_id.toString(),
                team_public_id: batTeam.toString(),
                inning_number: currentInningNumber,
            }
            const response = await axiosInstance.put(
                `${BASE_URL}/${game.name}/updateCricketInning`, data, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            const item = response.data;
        } catch (err) {
            setError({
                global: err?.response?.data?.error?.message || "Unable to start inning",
                fields: err?.response?.data?.error?.fields || {},
            });
            console.error("Failed to start inning: ", err);
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
                <ActivityIndicator size="large" color="#f87171" />
                <Text style={{color: '#94a3b8'}}>Loading...</Text>
            </View>
        );
    } else {
        return (
            <Animated.ScrollView
                onScroll={handlerScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                style={{backgroundColor: '#0f172a'}}
                contentContainerStyle={{
                    paddingTop: 0,
                    paddingBottom: 100,
                    minHeight: sHeight + 100
                }}
            >
                <View>
                    <View style={[tailwind`mb-4 rounded-lg overflow-hidden`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155'}]}>
                        <View style={tailwind`flex-row items-start justify-between ml-2 mr-2 p-2`}>
                            {(match.status_code !== "not_started" && match.status_code !== "finished") && (
                                <Text style={[tailwind`text-lg`, {color: '#f87171'}]}>live</Text>
                            )}
                            <Text style={{color: '#94a3b8'}}>{match.match_format}</Text>
                        </View>
                        <View>
                            <View>
                                    {match.homeTeam.public_id === batTeam ? (
                                    renderInningScore(match.homeScore)
                                ):(
                                    renderInningScore(match.awayScore)
                                )}
                            </View>
                        </View>
                    </View>
                </View>
                {inningStatus === "completed" ? (
                    <InningActionModal
                        match={match}
                        currentInning={currentInning}
                        inningStatus={inningStatus}
                        handleNextInning={handleNextInning}
                        batTeam={batTeam}
                        currentInningNumber={currentInningNumber}
                        MAX_INNINGS={MAX_INNINGS}
                        getNextInning={getNextInning}
                        setInningVisible={setInningVisible}
                        isFollowOnApplicable={isFollowOnApplicable}
                        followOn={followOn}
                        setFollowOn={setFollowOn}
                    />
                ): (currentBatsman?.length > 0 && currentBowler?.length > 0 && inningStatus === 'in_progress') ? (
                    <>
                    <View style={[tailwind`mb-4 rounded-lg overflow-hidden`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155'}]}>
                        {/* Header */}
                        <View style={[tailwind`flex-row justify-between px-4 py-2`, {borderBottomWidth: 1, borderColor: '#334155'}]}>
                            <View style={tailwind`flex-2`}>
                                <Text style={[tailwind`text-md`, {color: '#94a3b8'}]}>Batting</Text>
                            </View>
                            <View style={tailwind`flex-row flex-3 justify-evenly`}>
                            <Text style={[tailwind`text-md text-center`, {color: '#94a3b8'}]}>R</Text>
                            <Text style={[tailwind`text-md text-center`, {color: '#94a3b8'}]}>B</Text>
                            <Text style={[tailwind`text-md text-center`, {color: '#94a3b8'}]}>4s</Text>
                            <Text style={[tailwind`text-md text-center`, {color: '#94a3b8'}]}>6s</Text>
                            <Text style={[tailwind`text-md text-center`, {color: '#94a3b8'}]}>S/R</Text>
                            </View>
                        </View>

                        {/* Batsmen Data */}
                        {currentBatsman?.length > 0 && currentBatsman.map((item, index) => (
                            <View
                            key={index}
                            style={[tailwind`flex-row justify-between px-4 py-2 items-center`, {backgroundColor: item.is_striker ? '#f8717120' : '#1e293b'}]}
                            >
                            {/* Player Name */}
                            <View style={tailwind`flex-2 flex-row`}>
                                <Text style={[tailwind`text-md flex-shrink`, {color: '#f1f5f9'}]}>{item?.player?.name}</Text>
                                {item.is_striker && <Text style={[tailwind`text-md font-bold ml-1`, {color: '#f87171'}]}>*</Text>}
                            </View>

                            {/* Stats */}
                            <View style={tailwind`flex-row flex-3 justify-evenly`}>
                                <Text style={[tailwind`text-md text-center`, {color: '#f1f5f9'}]}>{item.runs_scored}</Text>
                                <Text style={[tailwind`text-md text-center`, {color: '#f1f5f9'}]}>{item.balls_faced}</Text>
                                <Text style={[tailwind`text-md text-center`, {color: '#f1f5f9'}]}>{item.fours}</Text>
                                <Text style={[tailwind`text-md text-center`, {color: '#f1f5f9'}]}>{item.sixes}</Text>
                                <Text style={[tailwind`text-md text-center`, {color: '#f1f5f9'}]}>
                                {item.balls_faced > 0 ? ((item.runs_scored / item.balls_faced) * 100).toFixed(1) : '0.0'}
                                </Text>
                            </View>
                            </View>
                        ))}

                        {/* Add Next Batsman Button */}
                        <View style={tailwind`p-4`}>
                            <Pressable
                            onPress={() => { setIsModalBattingVisible(true) }}
                            style={[tailwind`p-2 rounded-lg items-center`, {backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155'}]}
                            >
                            <Text style={[tailwind`text-center font-semibold`, {color: '#f1f5f9'}]}>Add Next Batsman</Text>
                            </Pressable>
                        </View>
                    </View>

                    <View style={[tailwind`mb-4 rounded-lg overflow-hidden`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155'}]}>
                    <View style={tailwind`flex-row justify-between px-4 py-2`}>
                        <Text style={[tailwind`flex-1 text-md`, {color: '#94a3b8'}]}>Bowling</Text>
                        <View style={tailwind`flex-row flex-[3] justify-between`}>
                            <Text style={[tailwind`w-8 text-md text-center`, {color: '#94a3b8'}]}>O</Text>
                            <Text style={[tailwind`w-8 text-md text-center`, {color: '#94a3b8'}]}>R</Text>
                            <Text style={[tailwind`w-8 text-md text-center`, {color: '#94a3b8'}]}>W</Text>
                            <Text style={[tailwind`w-8 text-md text-center`, {color: '#94a3b8'}]}>WD</Text>
                            <Text style={[tailwind`w-8 text-md text-center`, {color: '#94a3b8'}]}>NB</Text>
                        </View>
                    </View>
                    {currentBowler && currentBowler.map((item, index) => (
                        <View key={index} style={[tailwind`flex-row justify-between px-4 py-2`, {borderTopWidth: 1, borderColor: '#334155'}]}>
                            <View style={tailwind`flex-row`}>
                                <Text style={[tailwind`text-md`, {color: '#f1f5f9'}]}>{item?.player?.name}</Text>
                            </View>
                            <View style={tailwind`flex-row flex-[3] justify-between`}>
                                <Text style={[tailwind`w-8 text-md text-center`, {color: '#f1f5f9'}]}>
                                    {convertBallToOvers(item.ball_number)}
                                </Text>
                                <Text style={[tailwind`w-8 text-md text-center`, {color: '#f1f5f9'}]}>{item.runs}</Text>
                                <Text style={[tailwind`w-8 text-md text-center`, {color: '#f1f5f9'}]}>{item.wickets}</Text>
                                <Text style={[tailwind`w-8 text-md text-center`, {color: '#f1f5f9'}]}>{item.wide}</Text>
                                <Text style={[tailwind`w-8 text-md text-center`, {color: '#f1f5f9'}]}>{item.no_ball}</Text>
                            </View>
                        </View>
                    ))}
                    {/* Add Next Bowler Button */}
                    <View style={tailwind`p-4`}>
                        <Pressable
                        onPress={() => setIsModalBowlingVisible(true)}
                        style={[tailwind`p-2 rounded-lg items-center`, {backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155'}]}
                        >
                        <Text style={[tailwind`text-center font-semibold`, {color: '#f1f5f9'}]}>Add Next Bowler</Text>
                        </Pressable>
                    </View>
               </View>
               <UpdateCricketScoreCard match={match} currentScoreEvent={currentScoreEvent} isWicketModalVisible={isWicketModalVisible} setIsWicketModalVisible={setIsWicketModalVisible} addCurrentScoreEvent={addCurrentScoreEvent} setAddCurrentScoreEvent={setAddCurrentScoreEvent} runsCount={runsCount} wicketTypes={wicketTypes} game={game} wicketType={wicketType} setWicketType={setWicketType} selectedFielder={selectedFielder} currentBatsman={currentBatsman} currentBowler={currentBowler} dispatch={dispatch} batTeam={batTeam} setIsFielder={setIsFielder} isBatsmanStrikeChange={isBatsmanStrikeChange} currentWicketKeeper={currentWicketKeeper} currentInningNumber={currentInningNumber} setIsCurrentBatsmanModalVisible={setIsCurrentBatsmanModalVisible} setSelectedOutBatsman={setSelectedOutBatsman}/>
            </>
           ) : (
                <View style={tailwind`p-2`}>
                    {/* Add Batsman and Bowler */}
                    <AddBatsmanAndBowler match={match} />
                    {/* Bowler Select - show when batsman added but no bowler yet */}
                    {currentBatsman?.length >= 2 && currentBowler?.length === 0 && (
                        <View style={[tailwind`mt-3 rounded-lg overflow-hidden`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155'}]}>
                            <View style={[tailwind`px-4 py-3`, {borderBottomWidth: 1, borderColor: '#334155'}]}>
                                <Text style={[tailwind`text-base font-semibold`, {color: '#f1f5f9'}]}>
                                    Select Opening Bowler
                                </Text>
                            </View>
                            <View style={tailwind`p-3`}>
                                <Pressable
                                    onPress={() => setIsModalBowlingVisible(true)}
                                    style={[tailwind`p-3 rounded-lg items-center flex-row justify-center`, {backgroundColor: '#f87171'}]}
                                >
                                    <MaterialIcon name="sports-cricket" size={18} color="#fff" />
                                    <Text style={[tailwind`font-semibold ml-2`, {color: '#fff'}]}>
                                        Select Bowler
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    )}

                    {/* Start Inning Button - only show when both batsman and bowler are ready */}
                    {currentBatsman?.length >= 2 && currentBowler?.length >= 1 && inningStatus === 'not_started' && (
                        <View style={[tailwind`mt-3 rounded-lg overflow-hidden`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155'}]}>
                            {/* Status Summary */}
                            <View style={[tailwind`px-4 py-3`, {borderBottomWidth: 1, borderColor: '#334155'}]}>
                                <Text style={[tailwind`text-base font-semibold`, {color: '#f1f5f9'}]}>
                                    Ready to Start Inning {currentInningNumber}
                                </Text>
                            </View>

                            {/* Batsman Summary */}
                            <View style={tailwind`px-4 py-2`}>
                                <Text style={[tailwind`text-xs font-medium mb-2`, {color: '#64748b'}]}>BATTING</Text>
                                {currentBatsman.map((item, index) => (
                                    <View key={index} style={tailwind`flex-row items-center mb-1`}>
                                        <View style={[tailwind`w-2 h-2 rounded-full mr-2`, {backgroundColor: item.is_striker ? '#f87171' : '#475569'}]} />
                                        <Text style={[tailwind`text-sm`, {color: '#cbd5e1'}]}>
                                            {item?.player?.name}
                                            {item.is_striker && (
                                                <Text style={{color: '#f87171'}}> *</Text>
                                            )}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Divider */}
                            <View style={[tailwind`mx-4`, {height: 1, backgroundColor: '#334155'}]} />

                            {/* Bowler Summary */}
                            <View style={tailwind`px-4 py-2`}>
                                <Text style={[tailwind`text-xs font-medium mb-2`, {color: '#64748b'}]}>BOWLING</Text>
                                {currentBowler.map((item, index) => (
                                    <View key={index} style={tailwind`flex-row items-center mb-1`}>
                                        <View style={[tailwind`w-2 h-2 rounded-full mr-2`, {backgroundColor: '#60a5fa'}]} />
                                        <Text style={[tailwind`text-sm`, {color: '#cbd5e1'}]}>
                                            {item?.player?.name}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Error */}
                            {error?.global && (
                                <View style={[tailwind`mx-4 mb-2 p-2 rounded-lg`, {backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130'}]}>
                                    <Text style={[tailwind`text-xs`, {color: '#fca5a5'}]}>{error.global}</Text>
                                </View>
                            )}

                            {/* Start Button */}
                            <View style={tailwind`p-4`}>
                                <Pressable
                                    onPress={handleStartInning}
                                    disabled={loading}
                                    style={[
                                        tailwind`p-4 rounded-xl items-center flex-row justify-center`,
                                        {backgroundColor: loading ? '#334155' : '#f87171'}
                                    ]}
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <MaterialIcon name="play-arrow" size={20} color="#fff" />
                                            <Text style={[tailwind`text-base font-bold ml-2`, {color: '#fff'}]}>
                                                Start Inning {currentInningNumber}
                                            </Text>
                                        </>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    )}
                </View>
            )}
            {/* Add Batsman */}
            {isModalBattingVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isModalBattingVisible}
                    onRequestClose={() => setIsModalBattingVisible(false)}
                >  
                    <Pressable onPress={() => setIsModalBattingVisible(false)} style={[tailwind`flex-1 justify-end bg-black bg-opacity-50`, {minHeight: 200}]}>
                        <View style={[tailwind`rounded-t-2xl p-4`, {backgroundColor: '#1e293b', maxHeight: sHeight * 0.75}]}>
                            <AddCricketBatsman
                                match={match}
                                batTeam={batTeam}
                                homePlayer={homePlayer}
                                awayPlayer={awayPlayer}
                                game={game}
                                dispatch={dispatch}
                                error={error}
                                setError={setError}
                                setIsBatTeamPlayerModalVisible={setIsModalBattingVisible}
                                onSuccess={() => fetchCurrentBatsman()}
                            />
                        </View>
                    </Pressable>
                </Modal>
            )}
            {/* Add Bowler */}
            {isModalBowlingVisible && (
                    <Modal
                        transparent={true}
                        animationType="slide"
                        visible={isModalBowlingVisible}
                        onRequestClose={() => setIsModalBowlingVisible(false)}
                    >
                        <Pressable 
                            onPress={() => setIsModalBowlingVisible(false)} 
                            style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}
                        >
                            <View style={[tailwind`rounded-t-3xl p-6 pb-10`, {backgroundColor: '#1e293b'}]}>
                                <Text style={[tailwind`text-lg font-semibold text-center mb-4`, {color: '#f1f5f9'}]}>
                                    Select Next Bowlers
                                </Text>
                                <View style={tailwind`flex-row justify-around mb-6`}>
                                    {/* <Pressable
                                        onPress={() => {setSelectedBowlerType("newBowler"), handleToggle("newBowler")}}
                                        style={[tailwind`px-4 py-2 rounded-full`, {borderWidth: 1, borderColor: '#334155'}, selectedBowlerType === "newBowler" ? {backgroundColor: '#f87171'} : {backgroundColor: '#0f172a'}]}
                                    >
                                        <Text style={[tailwind`font-semibold`, {color: selectedBowlerType === "newBowler" ? '#ffffff' : '#94a3b8'}]}>New Bowler</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => {setSelectedBowlerType("existingBowler"), handleToggle("existingBowler")}}
                                        style={[tailwind`px-4 py-2 rounded-full`, {borderWidth: 1, borderColor: '#334155'}, selectedBowlerType === "existingBowler" ? {backgroundColor: '#f87171'} : {backgroundColor: '#0f172a'}]}
                                    >
                                        <Text style={[tailwind`font-semibold`, {color: selectedBowlerType === "existingBowler" ? '#ffffff' : '#94a3b8'}]}>Existing Bowler</Text>
                                    </Pressable> */}
                                </View>
                                <View style={tailwind`max-h-60`}>
                                    <ScrollView style={[tailwind`rounded-lg p-2`, {borderWidth: 1, borderColor: '#334155'}]}>
                                        {handleSelectBowler()}
                                    </ScrollView>
                                </View>

                                {/* Close Button */}
                                <Pressable
                                    onPress={() => setIsModalBowlingVisible(false)}
                                    style={[tailwind`mt-6 p-3 rounded-full`, {backgroundColor: '#f87171'}]}
                                >
                                    <Text style={tailwind`text-white text-center font-semibold`}>Close</Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    </Modal>
                )}
                {isModalBatsmanStrikerChange && (
                    <Modal
                        transparent={true}
                        visible={isModalBatsmanStrikerChange}
                        animationType="slide"
                        onRequestClose={() => setIsModalBatsmanStrikeChange(false)}
                    >
                        <Pressable style={tailwind`flex-1 justify-end bg-black bg-opacity-50`} onPress={() => setIsModalBatsmanStrikeChange(false)}>
                            <View style={[tailwind`p-10 rounded-t-2xl`, {backgroundColor: '#1e293b'}]}>
                                <View>
                                    <Text style={[tailwind`text-lg font-semibold mb-4`, {color: '#f1f5f9'}]}>Is Strike Change</Text>
                                </View>
                                <View style={tailwind`flex-row justify-between`}>
                                    <Pressable style={[tailwind`rounded-md p-4`, {backgroundColor: '#f87171'}]} onPress={() => {setIsBatsmanStrikeChange(true); setIsModalBatsmanStrikeChange(false) }}>
                                        <Text style={[tailwind`text-lg`, {color: '#ffffff'}]}>true</Text>
                                    </Pressable>
                                    <Pressable style={[tailwind`rounded-md p-4`, {backgroundColor: '#334155'}]}  onPress={() => {setIsBatsmanStrikeChange(false); setIsModalBatsmanStrikeChange(false) }}>
                                        <Text style={[tailwind`text-lg`, {color: '#f1f5f9'}]}>false</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </Pressable>
                    </Modal>
                )}
                {/* Select Fielder */}
                {isFielder && (
                    <Modal
                    transparent
                    visible={isFielder}
                    animationType="fade"
                    onRequestClose={() => setIsFielder(false)}
                >
                    <Pressable 
                        style={tailwind`flex-1 justify-end bg-black bg-opacity-50`} 
                        onPress={() => setIsFielder(false)}
                    >
                        <View style={[tailwind`rounded-t-2xl p-5 h-[100%]`, {backgroundColor: '#1e293b'}]}>
                            <Text style={[tailwind`text-lg font-semibold mb-3 text-center`, {color: '#f1f5f9'}]}>Select Fielder</Text>
                            <ScrollView style={tailwind``} showsVerticalScrollIndicator={false}>
                                {currentFielder?.map((item, index) => (
                                    <Pressable
                                        key={index}
                                        style={[tailwind`p-3`, {borderBottomWidth: 1, borderColor: '#334155'}]}
                                        onPress={() => {
                                            setSelectedFielder(item);
                                            setIsFielder(false);
                                            setIsModalBatsmanStrikeChange(true);
                                        }}
                                    >
                                        <Text style={[tailwind`text-lg text-center`, {color: '#cbd5e1'}]}>{item.name}</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                    </Pressable>
                </Modal>
                )}
                {/* Select Batsman For Runout */}
                {isCurrentBatsmanModalVisible && (
                    <Modal
                    transparent
                    visible={isCurrentBatsmanModalVisible}
                    animationType="fade"
                    onRequestClose={() => setIsCurrentBatsmanModalVisible(false)}
                >
                    <Pressable 
                        style={tailwind`flex-1 justify-end bg-black bg-opacity-50`} 
                        onPress={() => setIsCurrentBatsmanModalVisible(false)}
                    >
                        <View style={[tailwind`rounded-t-2xl p-5 h-[100%]`, {backgroundColor: '#1e293b'}]}>
                            <Text style={[tailwind`text-lg font-semibold mb-3 text-center`, {color: '#f1f5f9'}]}>Select Batsman</Text>
                            <ScrollView style={tailwind``} showsVerticalScrollIndicator={false}>
                                {currentBatsman?.map((item, index) => (
                                    <Pressable
                                        key={index}
                                        style={[tailwind`p-3`, {borderBottomWidth: 1, borderColor: '#334155'}]}
                                        onPress={() => {
                                            setSelectedOutBatsman(item);
                                            setIsCurrentBatsmanModalVisible(false);
                                            setIsFielder(true);
                                        }}
                                    >
                                        <Text style={[tailwind`text-lg text-center`, {color: '#cbd5e1'}]}>{item.player.name}</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                    </Pressable>
                </Modal>
                )}
           {menuVisible && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={menuVisible}
                    onRequestClose={toggleMenu}
                >
                    <TouchableOpacity onPress={toggleMenu} style={tailwind``}>
                        <View style={tailwind`flex-row justify-end`}>
                            <View style={[tailwind`mt-12 mr-4 rounded-lg p-4 gap-4`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155'}]}>
                                <TouchableOpacity onPress={() => { setIsModalBattingVisible(true); toggleMenu(); }}>
                                    <Text style={[tailwind`text-xl`, {color: '#f1f5f9'}]}>Add New Batsman </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { setIsModalBowlingVisible(true); toggleMenu(); }}>
                                    <Text style={[tailwind`text-xl`, {color: '#f1f5f9'}]}>Add New Bowler</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}
            </Animated.ScrollView>
        );
        }
    }

export default CricketLive;

const InningActionModal = ({
  match,
  currentInning,
  inningStatus,
  handleNextInning,
  batTeam,
  currentInningNumber,
  MAX_INNINGS,
  getNextInning,
  setInningVisible,
  isFollowOnApplicable,
  followOn,
  setFollowOn
}) => {

  const dispatch = useDispatch();
  const battingTeamName = batTeam === match.homeTeam.public_id ? match.homeTeam.name : match.awayTeam.name;
  const bowlingTeamName = batTeam === match.homeTeam.public_id ? match.awayTeam.name : match.homeTeam.name;

  const currentScore = batTeam === match.homeTeam.public_id
    ? match.homeScore
    : match.awayScore;

  const targetScore = match.match_format !== "Test" && (match?.homeScore?.length > 0 || match?.awayScore?.length > 0)
    ? (batTeam !== match.homeTeam.public_id
        ? match?.awayScore[currentInningNumber - 1]?.score + 1
        : match?.homeScore[currentInningNumber - 1]?.score + 1)
    : null;

  const handleNextBattingTeam = () => {
    if(batTeam === match.homeTeam.public_id){
        dispatch(setBatTeam(match.awayTeam.public_id));
    } else {
        dispatch(setBatTeam(match.homeTeam.public_id));
    }
  }

  return (
    <View style={[tailwind`flex-1 items-center`, {backgroundColor:"#0f172a"}]}>
      <View style={[tailwind`rounded-lg w-90`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155'}]}>
        {/* Header */}
        <View style={tailwind`p-2`}>
          <Text style={[tailwind`text-lg font-bold`, {color: '#f1f5f9'}]}>Match Inning Setup</Text>
        </View>

        {/* Match Info */}
        <View style={[tailwind`p-2 rounded-md`, {backgroundColor: '#0f172a'}]}>
          <Text style={[tailwind`text-md`, {color: '#f1f5f9'}]}>{match.homeTeam.name} vs {match.awayTeam.name}</Text>
          <Text style={[tailwind`text-md`, {color: '#cbd5e1'}]}>{match.match_format}</Text>
          <Text style={[tailwind`text-md`, {color: '#cbd5e1'}]}>{formattedDate(match.start_timestamp)}</Text>
        </View>

        {/* Current Inning */}
        <View style={tailwind`mb-4 p-4`}>
          <Text style={[tailwind`text-lg mb-2`, {color: '#f1f5f9'}]}>Current Inning</Text>
          <View style={[tailwind`rounded-2xl`, {backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155'}]}>
            <View style={tailwind`flex-row justify-between items-center px-4 pt-4`}>
              <Text style={[tailwind`text-lg`, {color: '#f1f5f9'}]}>{battingTeamName} Batting</Text>
              <Text style={[tailwind`text-md font-medium`, {color: '#94a3b8'}]}>Inning {currentInningNumber}</Text>
            </View>
            {renderInningScore(currentScore)}
          </View>
        </View>

        {/* Next Inning Setup */}
        {inningStatus === "completed" && currentInningNumber < MAX_INNINGS[match.match_format] && (
          <View style={tailwind`p-4`}>
            <Text style={[tailwind`text-md mb-2`, {color: '#f1f5f9'}]}>
              {followOn ? 'Follow-on Inning Setup' : 'Next Inning Setup'}
            </Text>
            <View style={[tailwind`rounded-2xl mb-4`, {backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155'}]}>
              <View style={tailwind`flex-row justify-between items-center px-4 pt-4`}>
                <View style={tailwind`flex-1`}>
                  <Text style={[tailwind`text-lg font-semibold`, {color: '#f1f5f9'}]}>
                    {followOn ? battingTeamName : bowlingTeamName}
                  </Text>
                  <Text style={[tailwind`text-sm`, {color: '#94a3b8'}]}>
                    {followOn ? 'Continues Batting (Follow-on)' : 'Will Bat Next'}
                  </Text>
                </View>
                <Text style={[tailwind`text-md font-medium`, {color: '#94a3b8'}]}>
                  {followOn ? 'Follow-on Inning' : `Inning ${getNextInning()}`}
                </Text>
              </View>

              {match.match_format === "Test" ? (
                <View style={tailwind`px-4 pb-4 pt-2`}>
                  <Text>{getLeadTrailStatus(match)}</Text>
                  
                  {/* Follow-on Option for Test matches */}
                  {isFollowOnApplicable && (
                    <View style={[tailwind`mt-3 p-3 rounded-lg`, {backgroundColor: '#f59e0b15', borderWidth: 1, borderColor: '#f59e0b30'}]}>
                      <Text style={[tailwind`text-sm font-semibold mb-2`, {color: '#fbbf24'}]}>
                        Follow-on Available
                      </Text>
                      <Text style={[tailwind`text-xs mb-3`, {color: '#94a3b8'}]}>
                        The batting team scored less than 200 runs and is more than 200 runs behind.
                        You can enforce the follow-on.
                      </Text>
                      <Pressable
                        onPress={() => setFollowOn(!followOn)}
                        style={[
                          tailwind`p-2 rounded-lg`,
                          {borderWidth: 1},
                          followOn ? {backgroundColor: '#f87171', borderColor: '#f87171'} : {backgroundColor: '#334155', borderColor: '#334155'}
                        ]}
                      >
                        <Text style={[
                          tailwind`text-center font-semibold`,
                          {color: followOn ? '#ffffff' : '#94a3b8'}
                        ]}>
                          {followOn ? 'Follow-on Enforced' : 'Enforce Follow-on'}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ) : (
                <View style={tailwind`px-4 pb-4 pt-2`}>
                  <Text style={[tailwind`text-lg font-semibold`, {color: '#f1f5f9'}]}>
                    Target: {targetScore || 0} runs
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={tailwind`flex-row justify-between`}>
              <Pressable
                style={[tailwind`rounded-lg px-6 py-3 mr-2`, {backgroundColor: '#334155'}]}
                onPress={() => setInningVisible(false)}
              >
                <Text style={[tailwind`font-medium text-center`, {color: '#e2e8f0'}]}>Cancel</Text>
              </Pressable>

              {/* {match.match_format !== "Test" ? (
                <Pressable onPress={() => handleNextInning()} style={[tailwind`rounded-lg px-6 py-3 ml-2`, {backgroundColor: '#f87171'}]}>
                    <Text style={tailwind`text-white font-medium text-center`}>Start Next Inning</Text>
                </Pressable>
              ):( */}
                    <Pressable
                        style={[tailwind`rounded-lg px-6 py-3 ml-2`, {backgroundColor: '#f87171'}]}
                        onPress={() => {
                        // If follow-on is enforced, the same team continues batting
                        // Otherwise, the opposite team bats
                       const nextBattingTeam = followOn 
                        ? batTeam
                        : (batTeam === match.homeTeam.public_id ? match.awayTeam.public_id : match.homeTeam.public_id);
                        
                        handleNextInning(nextBattingTeam);
                        }}
                    >
                        <Text style={tailwind`text-white font-medium text-center`}>
                        {followOn ? 'Start Follow-on Inning' : 'Start Next Inning'}
                        </Text>
                    </Pressable>
              {/* )} */}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};
