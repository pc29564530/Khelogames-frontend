import {useState, useEffect} from 'react';
import {View, Text,Pressable,Modal, TouchableOpacity} from 'react-native';
import tailwind from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import { useSelector, useDispatch } from 'react-redux';
import { convertBallToOvers } from '../utils/ConvertBallToOvers';
import { UpdateCricketScoreCard } from '../components/UpdateCricketScoreCard';
import SetCurrentBowler from '../components/SetCurrentBowler';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { setEndInning, setBatsmanScore, setBowlerScore } from '../redux/actions/actions';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const CricketLive = ({}) => {
    const navigation = useNavigation()
    const game = useSelector(state => state.sportReducers.game);
    const match = useSelector((state) => state.cricketMatchScore.match);
    const batting = useSelector((state) => state.cricketPlayerScore.battingScore);
    const bowling = useSelector((state) => state.cricketPlayerScore.bowlingScore);
    const homePlayer = useSelector((state) => state.teams.homePlayer);
    const awayPlayer = useSelector((state) => state.teams.awayPlayer);
    const [menuVisible, setMenuVisible] = useState(false);
    const [isBatsmanStrikeChange,setIsBatsmanStrikeChange] = useState(false);
    const [wicketType, setWicketType] = useState("");
    const [currentBattingBatsman, setCurrentBattingBatsman] = useState([]);
    const [currentBowler, setCurrentBowler] = useState([]);
    const axiosInstance = useAxiosInterceptor()
    const [addCurrentScoreEvent, setAddCurrentScoreEvent] = useState([]);
    const [inningVisible, setInningVisible] = useState(false);
    const currentScoreEvent = ["No Ball", "Wicket", "Wide", "Leg Bye"];
    const wicketTypes = ["Run Out", "Stamp", "Catch", "Hit Wicket", "Bowled", "LBW"];
    const [isFielder, setIsFielder] = useState(false);
    const [selectedFielder, setSelectedFielder] = useState();
    const [wicketsData, setWicketsData] = useState([]);
    const batTeam = useSelector(state => state.cricketMatchScore.batTeam);
    const [selectNextBowler, setSelectNextBowler] = useState(bowling.innings);   
    const [isWicketModalVisible, setIsWicketModalVisible] = useState(false);
    const [isBatsmanStrikerChange, setIsBatsmanStrikerChange] = useState(false);
    const [currentWicketKeeper, setCurrentWicketKeeper] = useState();
    const [isCurrentInningEnded, setIsCurrentInningEnded] = useState(false);
    const homeTeamID = match?.homeTeam?.id;
    const awayTeamID = match?.awayTeam?.id;
    const runsCount = [0, 1, 2, 3, 4, 5, 6, 7];
    const dispatch = useDispatch()
    useEffect(() => {
        console.log("Bat Team: ", batTeam)
    }, [batTeam])



    const toggleMenu = () => setMenuVisible(!menuVisible);

    const bowlTeamID = match.away_team_id === batTeam ? match.home_team_id : match.away_team_id;
        useEffect(() => {
            const fetchCurrentBatsman = async () => {
                try {
                    const authToken = await AsyncStorage.getItem("AccessToken")
                    const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCurrentBatsman`, {
                        params: {
                            "match_id": match.id,
                            "team_id": batTeam
                        },
                        headers: {
                            'Authorization': `bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                    })
                    setCurrentBattingBatsman(response.data.batting)
                    console.log("Resonse: ", response.data)
                } catch (err) {
                    console.error("Failed to get current batsman: ", err)
                }
            }
            fetchCurrentBatsman();
        },[batTeam]);
        console.log("Current Bowler: ", bowling)
        const currentFielder = homeTeamID !== batTeam
        ? homePlayer?.filter((player) => {
            const currentField = !bowling?.innings?.some(
                (bowler) => bowler?.is_current_bowler === true && bowler.player.id === player.id
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
         //Automate this process
        //  const handleSelectBowler = () => {
        //     if (selectedBowlerType === "existingBowler"){
        //         return (
        //             <SetCurrentBowler match={match} batTeam={batTeam} homePlayer={homePlayer} awayPlayer={awayPlayer} game={game} dispatch={dispatch} existingBowler={existingBowler} currentBowler={currentBowler}/>
        //         )
        //     } else {
        //         return (
        //             <AddCricketBowler match={match} batTeam={batTeam}  homePlayer={homePlayer} awayPlayer={awayPlayer} game={game} dispatch={dispatch} bowlerToBeBowled={bowlerToBeBowled} currentBowler={currentBowler} bowling={bowling}/>
        //         )
        //     }
        //   }

        useEffect(() => {
            const fetchCurrentBowler = async () => {
                try {
                    const authToken = await AsyncStorage.getItem("AccessToken")
                    const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCurrentBowler`, {
                        params: {
                            "match_id": match.id,
                            "team_id": bowlTeamID
                        },
                        headers: {
                            'Authorization': `bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                    })
                    setCurrentBowler(response.data.bowling)
                    console.log("Bowler Response: ", response.data)
                } catch (err) {
                    console.error("Failed to get current bowler: ", err)
                }
            }
            fetchCurrentBowler();
        },[bowlTeamID]);

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
        })


        const handleEndInning = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                console.log("Match Id: ", match.id)
                console.log("team_id ", batTeam)
                //create a state for current inning
                const data = {
                    match_id: match.id,
                    team_id: batTeam,
                    inning: "inning1"
                }

                console.log("Line no 167: ", data)
    
                const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateCricketEndInning`, data,{
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'applicaiton/json'
                    }
                })
                console.log("Innng Data: ", response.data)
                if(response.data){
                    setIsCurrentInningEnded(true)
                }
                dispatch(setEndInning(response?.data.inning))
                dispatch(setBatsmanScore(response.data.batsman))
                dispatch(setBowlerScore(response.data.bowler))
            } catch (err) {
                console.error("Failed to end inning: ", err);
            }
        }

        const handleMatchEnd = async () => {
            try {
                var winningTeam = null;
                console.log("isCurrentInningEnded:", isCurrentInningEnded);
console.log("match.innings:", match.innings);
console.log("match.innings.length:",match.innings.length);
console.log("match.innings[0]?.score?.score:", match.innings?.[0]?.score?.score);
console.log("match.innings[1]?.score?.score:", match.innings?.[1]?.score?.score);
                if(isCurrentInningEnded && match.innings.length== 2){
                    console.log("Line no 188")
                    if(match.innings?.[0].score.score > match.innings?.[1].score.score){
                        console.log("Line no 184: ")
                        winningTeam = match.innings?.[0].team_id;
                    } else if(match.innings?.[0].score.score < match.innings?.[1].score.score){
                        console.log("Line no 187")
                        winningTeam = match.innings?.[1].team_id;
                    }
                }
                const data = {
                    id: match.id,
                    result: winningTeam
                }
                console.log("Data Match Result: ", data)
                const authToken = await AsyncStorage.getItem("AccessToken");
                const matchEndResponse = await axiosInstance.put(`${BASE_URL}/${game.name}/updateMatchResult`, data, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'applicaiton/json'
                    }
                });
                console.log("Match Result: ", matchEndResponse.data)
            } catch(err) {
                console.error("Failed to end match: ", err);
            }
        }


        console.log("Innings: ", match.innings[0].inning)
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
                                    {match.innings[1].inning}
                                </Text>
                            </View>
                            <View style={tailwind`flex-row justify-between p-4 border-t border-gray-300`}>
                                <Text style={tailwind`text-xl font-semibold text-gray-800`}>
                                    {match.innings[1].score.score}/{match.innings[1].score.wickets}
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
                    <View style={tailwind`p-4 bg-white`}>
            <Text style={tailwind`text-xl font-bold text-gray-800 mb-4`}>Current Inning</Text>

            {/* Current Inning Card */}
            <View style={tailwind`rounded-2xl bg-white shadow-md mb-6 border border-gray-200`}>
                <View style={tailwind`flex-row justify-between items-center px-4 pt-4`}>
                <Text style={tailwind`text-lg font-semibold text-gray-800`}>
                    {batTeam === match.homeTeam.id ? match.homeTeam.name : match.awayTeam.name}
                </Text>
                <Text style={tailwind`text-md font-medium text-gray-500`}>{match.innings[0].inning}</Text>
                </View>
                <View style={tailwind`px-4 pb-4 pt-2`}>
                <Text style={tailwind`text-lg font-bold`}>
                    {match.innings[0].score.score}/{match.innings[0].score.wickets}
                </Text>
                </View>
            </View>

            {/* End Inning Button */}
            <View style={tailwind`mb-6`}>
                <Pressable
                style={tailwind`rounded-lg bg-red-400 px-6 py-3 shadow-md`}
                onPress={() => setIsCurrentInningEnded(true)}
                >
                <Text style={tailwind`text-white text-base font-semibold text-center`}>End Current Inning</Text>
                </Pressable>
            </View>

            {/* Next Inning UI */}
            {isCurrentInningEnded && (
                <View>
                    <Text style={tailwind`text-xl font-bold text-gray-800 mb-4`}>Next Inning Setup</Text>

                    <View style={tailwind`rounded-2xl bg-white shadow-md border border-gray-200 mb-6`}>
                        <View style={tailwind`flex-row justify-between items-center px-4 pt-4`}>
                        <Text style={tailwind`text-lg font-semibold text-gray-800`}>
                            {batTeam === match.homeTeam.id ? match.homeTeam.name : match.awayTeam.name}
                        </Text>
                        <Text style={tailwind`text-md font-medium text-gray-500`}>{match.innings[1].inning}</Text>
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
                        <Pressable style={tailwind`rounded-lg bg-red-400 px-6 py-3 ml-2`} onPress={() => handleNextInning()}>
                        <Text style={tailwind`text-white font-medium text-center`}>Start Next Inning</Text>
                        </Pressable>
                    </View>
                    </View>
                )}
                </View>
            );
            }
        }

    return (
        <View>
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
                            {/* {console.log("Match Line 141: ", match)} */}
                            {match.homeTeam.id === batTeam ? (
                                <View style={tailwind`flex-row gap-2`}>
                                    <Text style={tailwind`text-lg font-bold`}>{match.homeTeam.name}</Text>
                                    <Text style={tailwind`text-lg font-bold`}>{match.homeScore.score}/{match.homeScore.wickets}</Text>
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
                {currentBattingBatsman?.length > 0 && currentBattingBatsman?.map((item, index) => (
                        <View key={index} style={tailwind`flex-row justify-between mb-2 px-6 py-2 ${item.is_striker ? 'bg-red-100': 'bg-white'}`}>
                        <View style={tailwind``}>
                            <View style={tailwind`flex-row`}>
                                <Text style={tailwind`text-md text-gray-800`}>{item?.player?.name}</Text>
                                {item.is_striker && <Text style={tailwind`text-md text-gray-800`}>*</Text>}
                            </View>
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
           </View>
           <View style={tailwind`bg-white mb-4 shadow-lg rounded-lg overflow-hidden`}>
                <View style={tailwind`flex-row justify-between px-4 py-2`}>
                    <Text style={tailwind`flex-1 text-md text-gray-700`}>Bowling</Text>
                    <View style={tailwind`flex-row flex-[3] justify-between`}>
                        <Text style={tailwind`w-8 text-md text-gray-700 text-center`}>O</Text>
                        <Text style={tailwind`w-8 text-md text-gray-700 text-center`}>R</Text>
                        <Text style={tailwind`w-8 text-md text-gray-700 text-center`}>W</Text>
                        <Text style={tailwind`w-8 text-md text-gray-700 text-center`}>WD</Text>
                        <Text style={tailwind`w-8 text-md text-gray-700 text-center`}>NB</Text>
                    </View>
                </View>
                {/* {currentBowler?.map((item, index) => ( */}
                <View style={tailwind`flex-row justify-between px-4 py-2  ${currentBowler?.is_current_bowler ? 'bg-red-100' : 'bg-white'}`}>
                    <View style={tailwind``}>
                        <View style={tailwind`flex-row`}>
                        <Text style={tailwind`text-md text-gray-700`}>{currentBowler?.player?.name}</Text>
                        {currentBowler?.is_current_bowler && <Text style={tailwind`text-md text-gray-700`}>*</Text>}
                        </View>
                    </View>
                    <View style={tailwind`flex-row justify-between`}>
                        <Text style={tailwind`w-8 text-md text-gray-800 text-center`}>
                            {convertBallToOvers(currentBowler.ball)}
                        </Text>
                        <Text style={tailwind`w-8 text-md text-gray-800 text-center`}>{currentBowler.runs}</Text>
                        <Text style={tailwind`w-8 text-md text-gray-800 text-center`}>{currentBowler.wickets}</Text>
                        <Text style={tailwind`w-8 text-md text-gray-800 text-center`}>{currentBowler.wide}</Text>
                        <Text style={tailwind`w-8 text-md text-gray-800 text-center`}>{currentBowler.no_ball}</Text>
                    </View>
                </View>
           </View>
           <View>
                <UpdateCricketScoreCard currentScoreEvent={currentScoreEvent} isWicketModalVisible={isWicketModalVisible} setIsWicketModalVisible={setIsWicketModalVisible} addCurrentScoreEvent={addCurrentScoreEvent} setAddCurrentScoreEvent={setAddCurrentScoreEvent} runsCount={runsCount} wicketTypes={wicketTypes} game={game} wicketType={wicketType} setWicketType={setWicketType} selectedFielder={selectedFielder} batting={batting} bowling={bowling} dispatch={dispatch} batTeam={batTeam} setIsFielder={setIsFielder} isBatsmanStrikeChange={isBatsmanStrikeChange} currentWicketKeeper={currentWicketKeeper}/>
           </View>
           {inningVisible && (
            <Modal  
                transparent={true}
                animationType="fade"
                visible={inningVisible}
                onRequestClose={() => setInningVisible(false)}
            >
                <Pressable onPress={() => setInningVisible(false)} style={tailwind``}>
                    <View style={tailwind`flex-row justify-end items-center`}>
                            <View style={tailwind`mt-12 mr-4 bg-white rounded-lg shadow-lg p-4 gap-4`}>
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
                                <TouchableOpacity onPress={() => setInningVisible(true)}>
                                    <Text style={tailwind`text-xl`}>Set Inning</Text>
                                </TouchableOpacity>
                                {/* <TouchableOpacity onPress={() => handleEndInning()}>
                                    <Text style={tailwind`text-xl`}>End Inning</Text>
                                </TouchableOpacity> */}
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}
        </View>
    );
}

export default CricketLive;

// // added the functionality when need to change bowler when over completed 