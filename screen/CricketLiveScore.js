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
 import { setCurrentInning, setInningStatus, setBatTeam, setCurrentInningNumber, getCurrentBatsman, getCurrentBowler } from '../redux/actions/actions';
import { renderInningScore } from './Matches';
import Animated, {useSharedValue, useAnimatedScrollHandler, Extrapolation, interpolate, useAnimatedStyle} from 'react-native-reanimated';
import { current } from '@reduxjs/toolkit';
import { selectCurrentBatsmen, selectCurrentBowler } from '../redux/reducers/cricketMatchPlayerScoreReducers';

const CricketLive = ({match, parentScrollY, headerHeight, collapsedHeader}) => {
    const navigation = useNavigation()
    const inningData = useSelector(state => ({
        game: state.sportReducers.game,
        batTeam: state.cricketMatchScore.batTeam,
        batting: state.cricketPlayerScore.battingScore,
        bowling: state.cricketPlayerScore.bowlingScore,
        homePlayer: state.teams.homePlayer,
        awayPlayer: state.teams.awayPlayer,
        cricketToss: state.cricketToss.cricketToss
      }), shallowEqual);

    const currentInning = useSelector(state => state.cricketMatchInning.currentInning, shallowEqual);
    const currentInningNumber = useSelector(state => state.cricketMatchInning.currentInningNumber, shallowEqual);
    const inningStatus = useSelector(state => state.cricketMatchInning.inningStatus);
    const currentBatsman = useSelector(state => selectCurrentBatsmen(state, currentInningNumber));
    const currentBowler = useSelector(state => selectCurrentBowler(state, currentInningNumber));

    const game = inningData.game;
    const batTeam = inningData.batTeam;
    const batting = inningData.batting || [];
    const bowling = inningData.bowling || [];
    const homePlayer = inningData.homePlayer;
    const awayPlayer = inningData.awayPlayer;
    const cricketToss = inningData.cricketToss;
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
    const [selectedBowlerType, setSelectedBowlerType] = useState("");
    const [wicketsData, setWicketsData] = useState([]);
    const [selectNextBowler, setSelectNextBowler] = useState(bowling.innings);   
    const [isWicketModalVisible, setIsWicketModalVisible] = useState(false);
    const [isBatsmanStrikerChange, setIsBatsmanStrikerChange] = useState(false);
    const [isCurrentInningEnded, setIsCurrentInningEnded] = useState(false);
    const [addBatsmanModalVisible, setAddBatsmanModalVisible] = useState(false);
    const [addBowlerModalVisible, setAddBowlerModalVisible] = useState(false);
    const [isStartNewInningModalVisible, setIsStartNewInningModalVisible] = useState(false);
    const [isModalBatsmanStrikerChange, setIsModalBatsmanStrikeChange] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const homeTeamID = match?.homeTeam?.id;
    const awayTeamID = match?.awayTeam?.id;
    const homeTeamPublicID = match?.homeTeam?.public_id;
    const awayTeamPublicID = match?.awayTeam?.public_id;
    const runsCount = [0, 1, 2, 3, 4, 5, 6];
    const dispatch = useDispatch();
    const {height: sHeight, width: sWidth} = Dimensions.get("window");
    const currentScrollY = useSharedValue(0);
    // scroll handler for header animation
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
    useEffect(() => {
        if(match) {
            setIsLoading(false);
        }
    }, [match]);

    useEffect(() => {
        console.log("Bat Team: ", batTeam);
    }, [batTeam]);

    useEffect(() => {
        if (cricketToss && currentInningNumber === 1) {
            if (cricketToss.tossDecision === "Batting") {
                setCurrentLiveScore(cricketToss.tossWonTeam.public_id === homeTeamPublicID ? homeTeamPublicID : awayTeamPublicID);
            } else {
                setCurrentLiveScore(cricketToss.tossWonTeam.public_id === homeTeamPublicID ? awayTeamPublicID : homeTeamPublicID);
            }
        } else if(currentInningNumber === 2 && (match.match_format === "ODI" || match.match_format === "T20")) {
             const firstInningBattingTeam = cricketToss.tossDecision === "Batting" 
            ? (cricketToss.tossWonTeam.public_id === homeTeamPublicID ? homeTeamPublicID : awayTeamPublicID)
            : (cricketToss.tossWonTeam.public_id === homeTeamPublicID ? awayTeamPublicID : homeTeamPublicID);
            const secondInningBattingTeam = firstInningBattingTeam === homeTeamPublicID ? awayTeamPublicID : homeTeamPublicID;
            setCurrentLiveScore(secondInningBattingTeam);
        }
        // added the test inning update here 
    }, [cricketToss, homeTeamPublicID, awayTeamPublicID]);

    const toggleMenu = () => setMenuVisible(!menuVisible);

    const bowlTeamPublicID = match.awayTeam.public_id === batTeam ? match.homeTeam.public_id : match.awayTeam.public_id;    
    navigation.setOptions({
        headerTitle:'',
        headerLeft:()=>(
            <Pressable onPress={()=>navigation.goBack()}>
                <AntDesign name="arrowleft" size={24} color="white" style={tailwind`ml-4`} />
            </Pressable>
        ),
        headerStyle:tailwind`bg-red-400`,
        headerRight : () => (
            <View style={tailwind`flex-row`}>
                <Pressable style={tailwind`border-b-1  `} onPress={() => {setInningVisible(true)}}>
                    <Text style={tailwind`text-white text-lg`}>Actions</Text>
                </Pressable>
                <Pressable style={tailwind``} onPress={toggleMenu}>
                    <MaterialIcon name="more-vert" size={24} color="white" />
                </Pressable>
            </View>      
        )
    });

        const handleEndInning = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                const data = {
                    match_public_id: match.public_id,
                    team_public_id: batTeam,
                    inning: currentInningNumber
                }
    
                const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateCricketEndInning`, data,{
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                })
                if(response.data){
                    setIsCurrentInningEnded(true)
                }
                dispatch(setEndInning(response?.data.inning));
                dispatch(setBatsmanScore(response.data.batsman));
                dispatch(setBowlerScore(response.data.bowler));
                dispatch(setInningStatus("completed"));
            } catch (err) {
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
                        winningTeam = match.innings?.[1].team.public;
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
            const fetchHomePlayers = async () => {
                try {
                    const authToken = await AsyncStorage.getItem('AccessToken');
                    const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTeamsMemberFunc/${match.homeTeam.public_id}`, {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    
                    dispatch(getHomePlayer(response.data || []));
                } catch (err) {
                    console.error("unable to fetch the team player: ", err);
                }
            }
            const fetchAwayPlayers = async () => {
                try {
                    const authToken = await AsyncStorage.getItem('AccessToken');
                    const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTeamsMemberFunc/${ match.awayTeam.public_id}`, {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    
                    dispatch(getAwayPlayer(response.data || []));
                } catch (err) {
                    console.error("unable to fetch the team player: ", err);
                }
            }
            fetchHomePlayers();
            fetchAwayPlayers();
        }, [match.id]);

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
        // if (!isCurrentInningEnded) {
        //     Alert.alert(
        //         "⚠ Inning Not Ended",
        //         "You need to end the current inning before proceeding.",
        //         [
        //             { text: "OK", style: "cancel" }
        //         ]
        //     );
        // }
        //get match 
        // console.log("Team ID: ", teamPublicID)
        // switch (currentInningNumber) {
        //     case 1:
        //         setNextInning(2);
        //         dispatch(setCurrentInningNumber(2));
        //         //dispatch(setCurrentInning("inning2"))
        //         break;
        //     case 2:
        //         setNextInning(3);
        //         dispatch(setCurrentInningNumber(3));
        //        //dispatch(setCurrentInning("inning3"))
        //         break;
        //     case 3:
        //         setNextInning(4)
        //         dispatch(setCurrentInningNumber(4));
        //         //dispatch(setCurrentInning("inning4"))
        //         break;
        //     default:
        //         setNextInning(1);
        //         dispatch(setCurrentInningNumber(1));
        //         break;
        // }        
        try {
            const matchPublicID = match.public_id;
            await addCricketScoreServices({game, dispatch, matchPublicID, teamPublicID, currentInningNumber, followOn})
        } catch (err) {
            console.error("Failed to start next inning: ", err);
            dispatch(setCurrentInningNumber(currentInningNumber-1))
        }
    }

    const currentFielder = homeTeamPublicID !== batTeam
    ? homePlayer?.filter((player) => {
        const currentField = !bowling?.innings[currentInningNumber]?.some(
            (bowler) => bowler?.is_current_bowler === true && bowler?.player.id === player.id
        )
        return currentField;
    }
    ) || []
    : awayPlayer?.filter((player) => 
        {
            const currentField = !bowling?.innings[currentInningNumber]?.some(
                (bowler) => bowler?.is_current_bowler === true && bowler?.player.id === player.id
            )
            return currentField; 
        } 
     ) || [];

    const handleSelectBowler = () => {
        if (selectedBowlerType === "existingBowler"){
            return (
                <SetCurrentBowler match={match} batTeam={batTeam} homePlayer={homePlayer} awayPlayer={awayPlayer} game={game} dispatch={dispatch} existingBowler={existingBowler} currentBowler={currentBowler}/>
            )
        } else {
            return (
                <AddCricketBowler match={match} batTeam={batTeam}  homePlayer={homePlayer} awayPlayer={awayPlayer} game={game} dispatch={dispatch} bowlerToBeBowled={bowlerToBeBowled} currentBowler={currentBowler} bowling={bowling}/>
            )
        }
    }

    const handleToggle = (item) => {
        if(item==="newBowler") {
           setSelectNextBowler(bowlerToBeBowled);
        } else {
           setSelectNextBowler(existingBowler);
        }
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

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    } else {
        return (
            <Animated.ScrollView 
                onScroll={handlerScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: 0,
                    paddingBottom: 100,
                    minHeight: sHeight + 100
                }}
            >
                <View>
                    <View style={tailwind`bg-white mb-4 shadow-lg rounded-lg overflow-hidden`}>
                        <View style={tailwind`flex-row items-start justify-between ml-2 mr-2 p-2`}>
                            {(match.status_code !== "not_started" && match.status_code !== "finished") && (
                                <Text style={tailwind`text-red-400 text-lg`}>live</Text>
                            )}
                            <Text>{match.match_format}</Text>
                        </View>
                        <View>
                            <View>
                                {match.home_team_id === batTeam ? (
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
                        isFollowOnApplicable={isFollowOnApplicable}
                        followOn={followOn}
                        setFollowOn={setFollowOn}
                    />
                ): currentBatsman?.length > 0 && (currentBowler?.length > 0) ? (
                    <>
                    <View style={tailwind`bg-white mb-4 shadow-lg rounded-lg overflow-hidden`}>
                        {/* Header */}
                        <View style={tailwind`flex-row justify-between px-4 py-2 border-b border-gray-200`}>
                            <View style={tailwind`flex-2`}>
                                <Text style={tailwind`text-md text-gray-700`}>Batting</Text>
                            </View>
                            <View style={tailwind`flex-row flex-3 justify-evenly`}>
                            <Text style={tailwind`text-md text-gray-700 text-center`}>R</Text>
                            <Text style={tailwind`text-md text-gray-700 text-center`}>B</Text>
                            <Text style={tailwind`text-md text-gray-700 text-center`}>4s</Text>
                            <Text style={tailwind`text-md text-gray-700 text-center`}>6s</Text>
                            <Text style={tailwind`text-md text-gray-700 text-center`}>S/R</Text>
                            </View>
                        </View>

                        {/* Batsmen Data */}
                        {currentBatsman?.length > 0 && currentBatsman.map((item, index) => (
                            <View 
                            key={index} 
                            style={tailwind`flex-row justify-between px-4 py-2 ${item.is_striker ? 'bg-red-100' : 'bg-white'} items-center`}
                            >
                            {/* Player Name */}
                            <View style={tailwind`flex-2 flex-row`}>
                                <Text style={tailwind`text-md text-gray-800 flex-shrink`}>{item?.player?.name}</Text>
                                {item.is_striker && <Text style={tailwind`text-md text-red-500 font-bold ml-1`}>*</Text>}
                            </View>

                            {/* Stats */}
                            <View style={tailwind`flex-row flex-3 justify-evenly`}>
                                <Text style={tailwind`text-md text-gray-800 text-center`}>{item.runs_scored}</Text>
                                <Text style={tailwind`text-md text-gray-800 text-center`}>{item.balls_faced}</Text>
                                <Text style={tailwind`text-md text-gray-800 text-center`}>{item.fours}</Text>
                                <Text style={tailwind`text-md text-gray-800 text-center`}>{item.sixes}</Text>
                                <Text style={tailwind`text-md text-gray-800 text-center`}>
                                {item.balls_faced > 0 ? ((item.runs_scored / item.balls_faced) * 100).toFixed(1) : '0.0'}
                                </Text>
                            </View>
                            </View>
                        ))}

                        {/* Add Next Batsman Button */}
                        <View style={tailwind`p-4`}>
                            <Pressable 
                            onPress={() => { setIsModalBattingVisible(true) }} 
                            style={tailwind`p-2 bg-white rounded-lg shadow-md items-center`}
                            >
                            <Text style={tailwind`text-gray-800 text-center font-semibold`}>Add Next Batsman</Text>
                            </Pressable>
                        </View>
                    </View>

                    <View style={tailwind`bg-white mb-4 shadow-lg rounded-lg overflow-hidden`}>
                    <View style={tailwind`flex-row justify-between px-4 py-2`}>
                        <Text style={tailwind`flex-1 text-md text-gray-800`}>Bowling</Text>
                        <View style={tailwind`flex-row flex-[3] justify-between`}>
                            <Text style={tailwind`w-8 text-md text-gray-700 text-center`}>O</Text>
                            <Text style={tailwind`w-8 text-md text-gray-700 text-center`}>R</Text>
                            <Text style={tailwind`w-8 text-md text-gray-700 text-center`}>W</Text>
                            <Text style={tailwind`w-8 text-md text-gray-700 text-center`}>WD</Text>
                            <Text style={tailwind`w-8 text-md text-gray-700 text-center`}>NB</Text>
                        </View>
                    </View>
                    {currentBowler && currentBowler.map((item, index) => (
                        <View key={index} style={tailwind`flex-row justify-between px-4 py-2 border-t border-gray-200`}>
                            <View style={tailwind`flex-row`}>
                                <Text style={tailwind`text-md text-gray-800`}>{item?.player?.name}</Text>
                            </View>
                            <View style={tailwind`flex-row flex-[3] justify-between`}>
                                <Text style={tailwind`w-8 text-md text-gray-800 text-center`}>
                                    {convertBallToOvers(item.ball_number)}
                                </Text>
                                <Text style={tailwind`w-8 text-md text-gray-800 text-center`}>{item.runs}</Text>
                                <Text style={tailwind`w-8 text-md text-gray-800 text-center`}>{item.wickets}</Text>
                                <Text style={tailwind`w-8 text-md text-gray-800 text-center`}>{item.wide}</Text>
                                <Text style={tailwind`w-8 text-md text-gray-800 text-center`}>{item.no_ball}</Text>
                            </View>
                        </View>
                    ))}
                    {/* Add Next Bowler Button */}
                    <View style={tailwind`p-4`}>
                        <Pressable
                        onPress={() => setIsModalBowlingVisible(true)}
                        style={tailwind`p-2 bg-white rounded-lg shadow-md items-center`}
                        >
                        <Text style={tailwind`text-gray text-center font-semibold`}>Add Next Bowler</Text>
                        </Pressable>
                    </View>
               </View>
               <UpdateCricketScoreCard match={match} currentScoreEvent={currentScoreEvent} isWicketModalVisible={isWicketModalVisible} setIsWicketModalVisible={setIsWicketModalVisible} addCurrentScoreEvent={addCurrentScoreEvent} setAddCurrentScoreEvent={setAddCurrentScoreEvent} runsCount={runsCount} wicketTypes={wicketTypes} game={game} wicketType={wicketType} setWicketType={setWicketType} selectedFielder={selectedFielder} currentBatsman={currentBatsman} currentBowler={currentBowler} dispatch={dispatch} batTeam={batTeam} setIsFielder={setIsFielder} isBatsmanStrikeChange={isBatsmanStrikeChange} currentWicketKeeper={currentWicketKeeper} currentInning={currentInning}/>
            </>
            ) : (
                    <View style={tailwind`p-1`}>
                        <AddBatsmanAndBowler match={match}/>
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
                    <Pressable onPress={() => setIsModalBattingVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <AddCricketBatsman match={match} batTeam={batTeam}  homePlayer={homePlayer} awayPlayer={awayPlayer} game={game} dispatch={dispatch}/>
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
                            <View style={tailwind`bg-white rounded-t-3xl p-6 pb-10 shadow-lg`}>
                                <Text style={tailwind`text-lg font-semibold text-center mb-4 text-gray-800`}>
                                    Select Next Bowlers
                                </Text>
                                <View style={tailwind`flex-row justify-around mb-6`}>
                                    <Pressable 
                                        onPress={() => {setSelectedBowlerType("newBowler"), handleToggle("newBowler")}} 
                                        style={[tailwind`px-4 py-2 bg-blue-500 rounded-full shadow-md`, selectedBowlerType === "newBowler" ? tailwind`bg-blue-200` : tailwind`bg-gray-200`]}
                                    >
                                        <Text style={tailwind`${selectedBowlerType === "newBowler" ? "text-white" : "text-gray-800"} font-semibold`}>New Bowler</Text>
                                    </Pressable>
                                    <Pressable 
                                        onPress={() => {setSelectedBowlerType("existingBowler"), handleToggle("existingBowler")}} 
                                        style={[tailwind`px-4 py-2 bg-gray-300 rounded-full shadow-md`, selectedBowlerType === "existingBowler" ? tailwind`bg-blue-200` : tailwind`bg-gray-200`]}
                                    >
                                        <Text style={tailwind`${selectedBowlerType === "existingBowler" ? "text-white" : "text-gray-800"} font-semibold`}>Existing Bowler</Text>
                                    </Pressable>
                                </View>
                                <View style={tailwind`max-h-60`}>
                                    <ScrollView style={tailwind`border border-gray-300 rounded-lg p-2`}>
                                        {handleSelectBowler()}
                                    </ScrollView>
                                </View>

                                {/* Close Button */}
                                <Pressable 
                                    onPress={() => setIsModalBowlingVisible(false)}
                                    style={tailwind`mt-6 p-3 bg-red-500 rounded-full`}
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
                            <View style={tailwind`p-10 bg-white rounded-xl`}>
                                <View>
                                    <Text>Is Strike Change</Text>
                                </View>
                                <View style={tailwind`flex-row justify-between`}>
                                    <Pressable style={tailwind`rounded-md bg-red-400 p-4`} onPress={() => {setIsBatsmanStrikeChange(true); setIsModalBatsmanStrikeChange(false) }}>
                                        <Text style={tailwind`text-lg`}>true</Text>
                                    </Pressable>
                                    <Pressable style={tailwind`rounded-md bg-red-400 p-4 `}  onPress={() => {setIsBatsmanStrikeChange(true); setIsModalBatsmanStrikeChange(false) }}>
                                        <Text style={tailwind`text-lg`}>false</Text>
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
                        <View style={tailwind`bg-white rounded-t-2xl p-5 h-[100%]`}>
                            <Text style={tailwind`text-lg font-semibold mb-3 text-center`}>Select Fielder</Text>
                            <ScrollView style={tailwind``} showsVerticalScrollIndicator={false}>
                                {currentFielder?.map((item, index) => (
                                    <Pressable 
                                        key={index} 
                                        style={tailwind`p-3 border-b border-gray-200`}
                                        onPress={() => {
                                            setSelectedFielder(item);
                                            setIsFielder(false);
                                            setIsModalBatsmanStrikeChange(true);
                                        }}
                                    >   
                                        <Text style={tailwind`text-lg text-gray-600 text-center`}>{item.player_name}</Text>
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
                            <View style={tailwind`mt-12 mr-4 bg-white rounded-lg shadow-lg p-4 gap-4`}>
                                <TouchableOpacity onPress={() => handleEndInning()}>
                                    <Text style={tailwind`text-xl`}>Add New Batsman </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleEndInning()}>
                                    <Text style={tailwind`text-xl`}>Add New Bowler</Text>
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
    if(batTeam === match.homteTeam.public_id){
        dispatch(setBatTeam(match.awayTeam.public_id));
    } else {
        dispatch(setBatTeam(match.homeTeam.public_id));
    }
  }

  return (
    <View style={tailwind`flex-1 items-center`}>
      <View style={tailwind`bg-white rounded-lg shadow-lg w-90`}>
        {/* Header */}
        <View style={tailwind`p-2`}>
          <Text style={tailwind`text-lg font-bold`}>Match Inning Setup</Text>
        </View>

        {/* Match Info */}
        <View style={tailwind`bg-gray-100 p-2 rounded-md`}>
          <Text style={tailwind`text-md text-black`}>{match.homeTeam.name} vs {match.awayTeam.name}</Text>
          <Text style={tailwind`text-md text-black`}>{match.match_format}</Text>
          <Text style={tailwind`text-md text-black`}>{formattedDate(match.start_timestamp)}</Text>
        </View>

        {/* Current Inning */}
        <View style={tailwind`mb-4 p-4`}>
          <Text style={tailwind`text-lg text-gray-800 mb-2`}>Current Inning</Text>
          <View style={tailwind`rounded-2xl bg-white border border-gray-200`}>
            <View style={tailwind`flex-row justify-between items-center px-4 pt-4`}>
              <Text style={tailwind`text-lg text-gray-800`}>{battingTeamName} Batting</Text>
              <Text style={tailwind`text-md font-medium text-gray-500`}>Inning {currentInningNumber}</Text>
            </View>
            {renderInningScore(currentScore)}
          </View>
        </View>

        {/* Next Inning Setup */}
        {inningStatus === "completed" && currentInningNumber < MAX_INNINGS[match.match_format] && (
          <View style={tailwind`p-4`}>
            <Text style={tailwind`text-md text-gray-800 mb-2`}>
              {followOn ? 'Follow-on Inning Setup' : 'Next Inning Setup'}
            </Text>
            <View style={tailwind`rounded-2xl bg-white border border-gray-200 mb-4`}>
              <View style={tailwind`flex-row justify-between items-center px-4 pt-4`}>
                <View style={tailwind`flex-1`}>
                  <Text style={tailwind`text-lg font-semibold text-gray-800`}>
                    {followOn ? battingTeamName : bowlingTeamName}
                  </Text>
                  <Text style={tailwind`text-sm text-gray-600`}>
                    {followOn ? 'Continues Batting (Follow-on)' : 'Will Bat Next'}
                  </Text>
                </View>
                <Text style={tailwind`text-md font-medium text-gray-500`}>
                  {followOn ? 'Follow-on Inning' : `Inning ${getNextInning()}`}
                </Text>
              </View>

              {match.match_format === "Test" ? (
                <View style={tailwind`px-4 pb-4 pt-2`}>
                  <Text>{getLeadTrailStatus(match)}</Text>
                  
                  {/* Follow-on Option for Test matches */}
                  {isFollowOnApplicable && (
                    <View style={tailwind`mt-3 p-3 bg-yellow-100 rounded-lg border border-yellow-300`}>
                      <Text style={tailwind`text-sm font-semibold text-yellow-800 mb-2`}>
                        Follow-on Available
                      </Text>
                      <Text style={tailwind`text-xs text-yellow-700 mb-3`}>
                        The batting team scored less than 200 runs and is more than 200 runs behind. 
                        You can enforce the follow-on.
                      </Text>
                      <Pressable 
                        onPress={() => setFollowOn(!followOn)}
                        style={[
                          tailwind`p-2 rounded-lg border`,
                          followOn ? tailwind`bg-red-500 border-red-600` : tailwind`bg-gray-200 border-gray-300`
                        ]}
                      >
                        <Text style={[
                          tailwind`text-center font-semibold`,
                          followOn ? tailwind`text-white` : tailwind`text-gray-700`
                        ]}>
                          {followOn ? 'Follow-on Enforced' : 'Enforce Follow-on'}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ) : (
                <View style={tailwind`px-4 pb-4 pt-2`}>
                  <Text style={tailwind`text-lg font-semibold`}>
                    🎯 Target: {targetScore || 0} runs
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={tailwind`flex-row justify-between`}>
              <Pressable
                style={tailwind`rounded-lg bg-gray-300 px-6 py-3 mr-2`}
                onPress={() => setInningVisible(false)}
              >
                <Text style={tailwind`text-black font-medium text-center`}>Cancel</Text>
              </Pressable>

              {/* {match.match_format !== "Test" ? (
                <Pressable onPress={() => handleNextInning()} style={tailwind`rounded-lg bg-red-500 px-6 py-3 ml-2`}>
                    <Text style={tailwind`text-white font-medium text-center`}>Start Next Inning</Text>
                </Pressable>
              ):( */}
                    <Pressable
                        style={tailwind`rounded-lg bg-red-500 px-6 py-3 ml-2`}
                        onPress={() => {
                        // If follow-on is enforced, the same team continues batting
                        // Otherwise, the opposite team bats
                        const nextBattingTeam = followOn 
                            ? batTeam  // Same team continues (follow-on)
                            : (batTeam === match.homeTeam.public_id ? match.awayTeam.public_id : match.homeTeam.public_id); // Opposite team
                        
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
