import {useState, useEffect} from 'react';
import {View, Text,Pressable,Modal, Alert, TouchableOpacity, ActivityIndicator, ScrollView} from 'react-native';
import tailwind from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { convertBallToOvers } from '../utils/ConvertBallToOvers';
import { UpdateCricketScoreCard } from '../components/UpdateCricketScoreCard';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { setEndInning, setBatsmanScore, setBowlerScore, addBowler, getHomePlayer, getAwayPlayer, getCricketBattingScore, getCricketBowlingScore, getCurrentBatsmanScore, getcurrentBowlingScore, getCurrentBowlerScore } from '../redux/actions/actions';
import { useNavigation } from '@react-navigation/native';
import AddBatsmanAndBowler from '../components/AddBatsAndBowler';
import { CricketLiveMatchModal } from '../Modals/CricketLiveMatch';
import { AddCricketBatsman } from '../components/AddCricketBatsman';
import { AddCricketBowler } from '../components/AddCricketBowler';
import SetCurrentBowler from '../components/SetCurrentBowler';
import { formattedDate } from '../utils/FormattedDateTime';
import { addCricketScoreServices } from '../services/cricketMatchServices';
import { setCurrentInning, setInningStatus, setBatTeam } from '../redux/actions/actions';


const CricketLive = ({route}) => {
    const navigation = useNavigation()
    const inningData = useSelector(state => ({
        game: state.sportReducers.game,
        match: state.cricketMatchScore.match,
        batTeam: state.cricketMatchScore.batTeam,
        batting: state.cricketPlayerScore.battingScore,
        bowling: state.cricketPlayerScore.bowlingScore,
        homePlayer: state.teams.homePlayer,
        awayPlayer: state.teams.awayPlayer,
        cricketToss: state.cricketToss.cricketToss
      }), shallowEqual);

    const currentInning = useSelector(state => state.cricketMatchInning.currentInning);
    const inningStatus = useSelector(state => state.cricketMatchInning.inningStatus);

      useEffect(() => {
        console.log("Updated Game Data:", inningData);
      }, [inningData]);

    const game = inningData.game;
    const match = inningData.match;
    const batTeam = inningData.batTeam;
    const batting = inningData.batting;
    const bowling = inningData.bowling;
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
    const [currentBattingBatsman, setCurrentBattingBatsman] = useState([]);
    const axiosInstance = useAxiosInterceptor()
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
    const runsCount = [0, 1, 2, 3, 4, 5, 6];
    const dispatch = useDispatch();

    useEffect(() => {
        if(match) {
            setIsLoading(false);
        }
    }, [match]);

    useEffect(() => {
        console.log("Bat Team: ", batTeam);
    }, [batTeam]);

    useEffect(() => {
        if (cricketToss) {
            if (cricketToss.tossDecision === "Batting") {
                setCurrentLiveScore(cricketToss.tossWonTeam.id === homeTeamID ? homeTeamID : awayTeamID);
            } else {
                setCurrentLiveScore(cricketToss.tossWonTeam.id === homeTeamID ? awayTeamID : homeTeamID);
            }
        }
    }, [cricketToss, homeTeamID, awayTeamID]);

    const toggleMenu = () => setMenuVisible(!menuVisible);

    const bowlTeamID = match.away_team_id === batTeam ? match.home_team_id : match.away_team_id;    
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
                    match_id: match.id,
                    team_id: batTeam,
                    inning: currentInning
                }
    
                const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateCricketEndInning`, data,{
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'applicaiton/json'
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
                        winningTeam = match.innings?.[0].team_id;
                    } else if(match.innings?.[0].score.score < match.innings?.[1].score.score){
                        winningTeam = match.innings?.[1].team_id;
                    }
                }
                const data = {
                    id: match.id,
                    result: winningTeam
                }
                const authToken = await AsyncStorage.getItem("AccessToken");
                const matchEndResponse = await axiosInstance.put(`${BASE_URL}/${game.name}/updateMatchResult`, data, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'applicaiton/json'
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
                    const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTeamsMemberFunc`, {
                        params:{
                            team_id: match.homeTeam.id.toString()
                        },
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
                    const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTeamsMemberFunc`, {
                        params:{
                            team_id: match.awayTeam.id.toString()
                        },
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

        const getNextInning = () => {
            if (inningStatus === "completed" && currentInning === 1){
                return 2;
            } else if (inningStatus === "completed" && currentInning === 2) {
                return 3;
            } else if (inningStatus === "completed" && currentInning === 3) {
                return 4;
            } else {
                return null;
            }
        };

        const handleMatchInning = () => {
            if(match?.innings?.length == 2){
                return (
                    <View style={tailwind`p-6 bg-gray-100 rounded-lg shadow-md`}>
                        <Text style={tailwind`text-2xl font-bold text-gray-800 mb-4`}>Current Inning</Text>
                        <View style={tailwind`rounded-lg bg-red-200 shadow-lg mb-4`}>
                            <View style={tailwind`flex-row justify-between p-4`}>
                                <Text style={tailwind`text-xl font-semibold text-gray-800`}>
                                    {batTeam === match.homeTeam.id ? match.homeTeam.name : match.awayTeam.name}
                                </Text>
                                <Text style={tailwind`text-xl font-semibold text-gray-800`}>
                                    {match.home_team_id === batTeam ? match.homeScore.inning : match.awayScore.inning}
                                </Text>
                            </View>
                            <View style={tailwind`flex-row justify-between p-4 border-t border-gray-300`}>
                                <Text style={tailwind`text-xl font-semibold text-gray-800`}>
                                    {match.home_team_id === batTeam? match.homeScore.score : match.awayScore.score}/{match.home_team_id === batTeam? match.homeScore.wickets : match.awayScore.wickets}
                                </Text>
                            </View>
                        </View>
                        <View style={tailwind`mb-4 `}>
                            <Pressable style={tailwind` rounded-lg bg-red-400 p-4 shadow-md mb-2`} onPress={() => handleEndInning()}>
                                <Text style={tailwind`text-lg text-white text-center font-semibold`}>End Current Inning</Text>
                            </Pressable>
                            <Pressable style={tailwind` rounded-lg bg-red-400 p-4 shadow-md mb-2`} onPress={() => handleMatchEnd()}>
                                <Text style={tailwind`text-lg text-white text-center font-semibold`}>End Match</Text>
                            </Pressable>
                        </View>
                    </View>
                );
            } else {
                return (
                    <View style={tailwind`bg-white rounded-lg shadow-lg h-160 w-90`}>
                        <View style={tailwind`p-2`}>
                            <Text style={tailwind`text-lg font-bold`}>Match Inning Setup</Text>
                        </View>
                        <View style={tailwind` bg-gray-100 p-2 rounded-md`}>
                            <View style={tailwind``}>
                                <Text style={tailwind`text-md text-black`}>{match.homeTeam.name} vs {match.awayTeam.name}</Text>
                                <Text style={tailwind`text-md text-black`}>{match.match_format}</Text>
                            </View>
                            <View style={tailwind``}>
                                <Text style={tailwind`text-md text-black`}>{formattedDate(match.start_timestamp)}</Text>
                            </View>
                        </View>
                        <View style={tailwind`mb-4 p-4`}>
                            <Text style={tailwind`text-lg text-gray-800 mb-4`}>Current Inning</Text>
                            {/* Current Inning Card */}
                            <View style={tailwind`rounded-2xl bg-white border border-gray-200 ml-2 mr-2`}>
                                <View style={tailwind`flex-row justify-between items-center px-4 pt-4`}>
                                    <Text style={tailwind`text-lg text-gray-800`}>
                                        {batTeam === match.homeTeam.id ? match.homeTeam.name : match.awayTeam.name} Batting
                                    </Text>
                                    <Text style={tailwind`text-md font-medium text-gray-500`}>{currentInning}</Text>
                                </View>
                                <View style={tailwind`px-4 pb-4 pt-2`}>
                                <Text style={tailwind`text-lg font-bold`}>
                                    {match.innings[0].score.score}/{match.innings[0].score.wickets}
                                </Text>
                                <Text>{convertBallToOvers(match.innings[0].score.overs)} Overs</Text>
                                </View>
                            </View>
                        </View>
                        {/* End Inning Button */}
                        <View style={tailwind`p-4`}>
                            <Pressable
                            style={tailwind`rounded-lg bg-red-400 px-6 py-3 shadow-md`}
                            onPress={() => setIsCurrentInningEnded(true)}
                            >
                            <Text style={tailwind`text-white text-base font-semibold text-center`}>End Current Inning</Text>
                            </Pressable>
                        </View>

                        {/* Next Inning UI */}
                            <View style={tailwind`p-4`}>
                                <Text style={tailwind`text-md text-gray-800 mb-4`}>Next Inning Setup</Text>
                                <View style={tailwind`rounded-2xl bg-white border border-gray-200 mb-6`}>
                                    <View style={tailwind`flex-row justify-between items-center px-4 pt-4`}>
                                    <Text style={tailwind`text-lg font-semibold text-gray-800`}>
                                        {batTeam === match.homeTeam.id ? match.awayTeam.name : match.homeTeam.name}
                                    </Text>
                                    <Text style={tailwind`text-md font-medium text-gray-500`}>{getNextInning()}</Text>
                                    </View>
                                    <View style={tailwind`px-4 pb-4 pt-2`}>
                                    <Text style={tailwind`text-lg font-semibold `}>
                                        🎯 Target: {match.innings[0].score.score + 1} runs
                                    </Text>
                                    </View>
                                </View>

                                {/* Buttons */}
                                <View style={tailwind`flex-row justify-between`}>
                                    <Pressable
                                    style={tailwind`rounded-lg bg-red-400 px-6 py-3 mr-2`}
                                    onPress={() => setInningVisible(false)}
                                    >
                                    <Text style={tailwind`text-white font-medium text-center`}>Cancel</Text>
                                    </Pressable>
                                    <Pressable style={tailwind`rounded-lg bg-red-400 px-6 py-3 ml-2`} onPress={() => handleNextInning(match.home_team_id === batTeam ? awayTeamID : homeTeamID)}>
                                        <Text style={tailwind`text-white font-medium text-center`}>Start Next Inning</Text>
                                    </Pressable>
                                </View>
                                </View>
                            </View>
                        );
                        }
                    }
    
    const handleNextInning = async (teamID) => {
        if (!isCurrentInningEnded) {
            Alert.alert(
                "⚠ Inning Not Ended",
                "You need to end the current inning before proceeding.",
                [
                    { text: "OK", style: "cancel" }
                ]
            );
        }
        //get match 
        switch (inningStatus) {
            case "not_started":
                setNextInning(1);
                //dispatch(setCurrentInning("inning1"))
                break;
            case "first_inning_completed":
                setNextInning(2);
                //dispatch(setCurrentInning("inning2"))
                break;
            case "second_inning_completed":
                setNextInning(3);
               //dispatch(setCurrentInning("inning3"))
                break;
            case  "third_inning_completed":
                setNextInning(4)
                //dispatch(setCurrentInning("inning4"))
                break;
            default:
                break;
        }        
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            await addCricketScoreServices(sport, dispatch, match.id, teamID, nextInning, followOn, authToken, axiosInstance)
        } catch (err) {
            console.error("Failed to start next inning: ", err);
        }
    }

    const currentBowling = bowling?.innings?.filter((item) => item.is_current_bowler === true );
    const currentBatting = batting?.innings?.filter((item) => (item.is_currently_batting === true));
    const currentFielder = homeTeamID !== batTeam
    ? homePlayer?.filter((player) => {
        const currentField = !bowling?.innings?.some(
            (bowler) => bowler.is_current_bowler === true && bowler.player.id === player.id
        )
        return currentField;
    }
            
      ) || []
    : awayPlayer?.filter((player) => 
        {
            const currentField = !bowling?.innings?.filter(
                (bowler) => bowler.is_current_bowler === true && bowler.player.id === player.id
            )
            return currentField; 
        } 
     ) || [];

    const handleSelectBowler = () => {
        if (selectedBowlerType === "existingBowler"){
            return (
                <SetCurrentBowler match={match} batTeam={batTeam} homePlayer={homePlayer} awayPlayer={awayPlayer} game={game} dispatch={dispatch} existingBowler={existingBowler} currentBowler={currentBowling}/>
            )
        } else {
            return (
                <AddCricketBowler match={match} batTeam={batTeam}  homePlayer={homePlayer} awayPlayer={awayPlayer} game={game} dispatch={dispatch} bowlerToBeBowled={bowlerToBeBowled} currentBowler={currentBowling} bowling={bowling}/>
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

    const currentWicketKeeper = batTeam !== homeTeamID ? homePlayer.find((item) => item.position === "WK"): awayPlayer.find((item) => item.position === "WK");


    const bowlerToBeBowled = batTeam?.id === homeTeamID ? awayPlayer?.filter((player) => !bowling?.innings?.some(
        (bowler) => bowler.bowling_status && bowler.player.id === player.id
    )) : homePlayer?.filter((player) => !bowling?.innings?.some(
        (bowler) => bowler.bowling_status && bowler.player.id === player.id
    ));

    const existingBowler = (batTeam?.id === homeTeamID ? awayPlayer : homePlayer)?.filter((player) => 
        bowling?.innings?.some((bowler) => bowler.player.id === player.id)
    );

    const checkFollowOn = () => {
        if (match.innings.length >= 2) {
            const firstInningScore = match.innings[0].score.score;
            const secondInningScore = match.innings[1].score.score;
            // Check if the second team scored less than 200 runs less than the first team's score
            if (secondInningScore < firstInningScore - 200) {
                <Pressable onPress={() => setFollowOn(true)} style = {[followOn ?tailwind`bg-red-400` : tailwind`bg-white`]}>
                    <Text style>Follow On</Text>
                </Pressable>
            }
        }
    };
    useEffect(() => {
        checkFollowOn();
    }, [match.innings]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    } else {
        return (
            <ScrollView>
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
                                    <View style={tailwind`flex-row gap-2`}>
                                        <Text style={tailwind`text-lg font-bold`}>{match.homeTeam.name}</Text>
                                        <Text style={tailwind`text-lg font-bold`}>{match.homeScore.score}/{match.homeScore.wickets }</Text>
                                        <Text style={tailwind`text-lg font-bold`}>({convertBallToOvers(match.homeScore.overs)})</Text>
                                    </View>
                                ):(
                                    <View style={tailwind`flex-row gap-2`}>
                                        <Text style={tailwind`text-lg font-bold`}>{match.awayTeam.name}</Text>
                                        <Text style={tailwind`text-lg font-bold`}>{match.awayScore.score}/{match.awayScore.wickets}</Text>
                                        <Text style={tailwind`text-lg font-bold`}>({convertBallToOvers(match.awayScore.overs)})</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
                {currentBatting?.length > 0 && (currentBowling.length > 0) ? (
                    <>
                        <View style={tailwind`bg-white mb-4 shadow-lg rounded-lg overflow-hidden`}>
                        <View style={tailwind`flex-row justify-between px-6 py-2`}>
                            <Text style={tailwind`text-md text-gray-700`}>Batting</Text>
                            <View style={tailwind`flex-row justify-between gap-4`}>
                                <Text style={tailwind`text-md text-gray-700`}>R</Text>
                                <Text style={tailwind`text-md text-gray-700`}>B</Text>
                                <Text style={tailwind`text-md text-gray-700`}>4s</Text>
                                <Text style={tailwind`text-md text-gray-700`}>6s</Text>
                                <Text style={tailwind`text-md text-gray-700`}>S/R</Text>
                            </View>
                        </View>
                    {currentBatting?.length > 0 && currentBatting?.map((item, index) => (
                        <View key={index} style={tailwind`flex-row justify-between mb-2 px-6 py-1 ${item.is_striker ? 'bg-red-100': 'bg-white'}`}>
                            <View style={tailwind`flex-row`}>
                                <Text style={tailwind`text-md text-gray-800`}>{item?.player?.name}</Text>
                                {item.is_striker && <Text style={tailwind`text-md text-gray-800`}>*</Text>}
                            </View>
                            <View style={tailwind`flex-row justify-between gap-4`}>
                                <Text style={tailwind`text-md text-gray-800`}>{item.runs_scored}</Text>
                                <Text style={tailwind`text-md text-gray-800`}>{item.balls_faced}</Text>
                                <Text style={tailwind`text-md text-gray-800`}>{item.fours}</Text>
                                <Text style={tailwind`text-md text-gray-800`}>{item.sixes}</Text>
                                <Text style={tailwind`text-md text-gray-800`}>{ item.balls_faced > 0 ? ((item.runs_scored/item.balls_faced)*100.0).toFixed(1) : (0).toFixed(1)}</Text>
                            </View>
                        </View>
                    ))}
                    {/* Add Next Batsman Button */}
                    <View style={tailwind`p-4`}>
                        <Pressable onPress={() => { setIsModalBattingVisible(true) }} style={tailwind`p-2 bg-white rounded-lg shadow-md items-center`}>
                            <Text style={tailwind`text-gray text-center font-semibold`}>Add Next Batsman</Text>
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
                    {currentBowling && currentBowling.map((item, index) => (
                        <View key={index} style={tailwind`flex-row justify-between px-4 py-2 border-t border-gray-200`}>
                            <View style={tailwind`flex-row`}>
                                <Text style={tailwind`text-md text-gray-800`}>{item?.player?.name}</Text>
                            </View>
                            <View style={tailwind`flex-row flex-[3] justify-between`}>
                                <Text style={tailwind`w-8 text-md text-gray-800 text-center`}>
                                    {convertBallToOvers(item.ball)}
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
               <UpdateCricketScoreCard currentScoreEvent={currentScoreEvent} isWicketModalVisible={isWicketModalVisible} setIsWicketModalVisible={setIsWicketModalVisible} addCurrentScoreEvent={addCurrentScoreEvent} setAddCurrentScoreEvent={setAddCurrentScoreEvent} runsCount={runsCount} wicketTypes={wicketTypes} game={game} wicketType={wicketType} setWicketType={setWicketType} selectedFielder={selectedFielder} batting={batting} bowling={bowling} dispatch={dispatch} batTeam={batTeam} setIsFielder={setIsFielder} isBatsmanStrikeChange={isBatsmanStrikeChange} currentWicketKeeper={currentWicketKeeper}/>
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
            {inningVisible && (
                <Modal  
                    transparent={true}
                    animationType="fade"
                    visible={inningVisible}
                    onRequestClose={() => setInningVisible(false)}
                >
                    <Pressable onPress={() => setInningVisible(false)} style={tailwind`flex-1 bg-black bg-opacity-50`}>
                        <View style={tailwind` justify-center items-center`}>
                            <View style={tailwind`bg-white rounded-lg shadow-lg`}>
                                {handleMatchInning()}
                            </View>
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
            </ScrollView>
        );
        }
    }

export default CricketLive;